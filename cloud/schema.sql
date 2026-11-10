-- Execute once in the SQL editor of YOUR Supabase project.
-- No service-role key belongs in the browser. Email/password login uses administrator-created, confirmed accounts.
begin;
create table public.jojo_trips(id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 120), owner_id uuid not null references auth.users(id), created_at timestamptz not null default now());
create table public.jojo_members(trip_id uuid not null references public.jojo_trips(id) on delete cascade, user_id uuid not null references auth.users(id), primary key(trip_id,user_id), unique(user_id));
create table public.jojo_invites(token uuid primary key default gen_random_uuid(), trip_id uuid not null references public.jojo_trips(id) on delete cascade, email text not null, expires_at timestamptz not null default now()+interval '7 days');
create table public.jojo_records(trip_id uuid not null references public.jojo_trips(id) on delete cascade, kind text not null check(kind in ('stops','expenses','plans','tasks','settings','rates')), record_id text not null check(length(record_id) between 1 and 200), payload jsonb, revision bigint not null default 1, deleted boolean not null default false, updated_at timestamptz not null default now(), updated_by uuid not null references auth.users(id), primary key(trip_id,kind,record_id));
create table public.jojo_history(id bigint generated always as identity primary key, trip_id uuid not null references public.jojo_trips(id), kind text not null, record_id text not null, payload jsonb, revision bigint not null, deleted boolean not null, saved_at timestamptz not null default now());
create table public.jojo_backups(id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.jojo_trips(id), backup_day date not null default (now() at time zone 'UTC')::date, records jsonb not null, created_at timestamptz not null default now(), unique(trip_id,backup_day));
create function public.jojo_is_member(p_trip uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.jojo_members where trip_id=p_trip and user_id=auth.uid())$$;
alter table public.jojo_trips enable row level security;
alter table public.jojo_members enable row level security;
alter table public.jojo_invites enable row level security;
alter table public.jojo_records enable row level security;
alter table public.jojo_history enable row level security;
alter table public.jojo_backups enable row level security;
create policy member_trip on public.jojo_trips for select to authenticated using(public.jojo_is_member(id));
create policy own_membership on public.jojo_members for select to authenticated using(user_id=auth.uid());
create policy member_records on public.jojo_records for select to authenticated using(public.jojo_is_member(trip_id));
create policy member_history on public.jojo_history for select to authenticated using(public.jojo_is_member(trip_id));
create policy member_backups on public.jojo_backups for select to authenticated using(public.jojo_is_member(trip_id));
create function public.jojo_create_trip(p_name text) returns uuid language plpgsql security definer set search_path='' as $$declare result uuid; begin
 if auth.uid() is null then raise exception 'authentication_required'; end if;
 if exists(select 1 from public.jojo_members where user_id=auth.uid()) then raise exception 'already_joined'; end if;
 insert into public.jojo_trips(name,owner_id) values(trim(p_name),auth.uid()) returning id into result;
 insert into public.jojo_members values(result,auth.uid());return result;end$$;
create function public.jojo_invite(p_trip uuid,p_email text) returns uuid language plpgsql security definer set search_path='' as $$declare result uuid;begin
 perform 1 from public.jojo_trips where id=p_trip and owner_id=auth.uid() for update;
 if not found then raise exception 'owner_required';end if;
 if (select count(*) from public.jojo_members where trip_id=p_trip)>=2 then raise exception 'trip_full';end if;
 if p_email is null or p_email not like '%@%' then raise exception 'email_required';end if;
 delete from public.jojo_invites where trip_id=p_trip;
 insert into public.jojo_invites(trip_id,email) values(p_trip,lower(trim(p_email))) returning token into result;return result;end$$;
create function public.jojo_join(p_token uuid) returns uuid language plpgsql security definer set search_path='' as $$declare invite public.jojo_invites; verified_email text;begin
 if auth.uid() is null then raise exception 'authentication_required';end if;
 select lower(email) into verified_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 select * into invite from public.jojo_invites where token=p_token and expires_at>now();
 if invite.trip_id is null or invite.email is distinct from verified_email then raise exception 'invalid_invite';end if;
 perform 1 from public.jojo_trips where id=invite.trip_id for update;
 -- Recheck invite after lock: an owner may have revoked it concurrently.
 if not exists(select 1 from public.jojo_invites where token=p_token and expires_at>now()) then raise exception 'invalid_invite';end if;
 if exists(select 1 from public.jojo_members where user_id=auth.uid()) then raise exception 'already_joined';end if;
 if (select count(*) from public.jojo_members where trip_id=invite.trip_id)>=2 then raise exception 'trip_full';end if;
 insert into public.jojo_members values(invite.trip_id,auth.uid());delete from public.jojo_invites where trip_id=invite.trip_id;return invite.trip_id;end$$;
create function public.jojo_apply(p_trip uuid,p_kind text,p_id text,p_expected bigint,p_payload jsonb,p_deleted boolean) returns jsonb language plpgsql security definer set search_path='' as $$declare current_record public.jojo_records; result public.jojo_records;begin
 if not public.jojo_is_member(p_trip) then raise exception 'forbidden';end if;
 if p_expected<0 or p_expected is null or p_deleted is null then raise exception 'invalid_operation';end if;
 if p_kind not in ('stops','expenses','plans','tasks','settings','rates') or length(p_id) not between 1 and 200 then raise exception 'invalid_record';end if;
 if not p_deleted and (p_payload is null or octet_length(p_payload::text)>200000) then raise exception 'invalid_payload';end if;
 -- Trip row serializes edits, including two simultaneous INSERTs of the same ID.
 perform 1 from public.jojo_trips where id=p_trip for update;
 select * into current_record from public.jojo_records where trip_id=p_trip and kind=p_kind and record_id=p_id;
 if coalesce(current_record.revision,0)<>p_expected then return jsonb_build_object('ok',false,'record',to_jsonb(current_record));end if;
 insert into public.jojo_records(trip_id,kind,record_id,payload,revision,deleted,updated_by) values(p_trip,p_kind,p_id,p_payload,p_expected+1,p_deleted,auth.uid())
 on conflict(trip_id,kind,record_id) do update set payload=excluded.payload,revision=excluded.revision,deleted=excluded.deleted,updated_at=now(),updated_by=auth.uid() returning * into result;
 insert into public.jojo_history(trip_id,kind,record_id,payload,revision,deleted) values(p_trip,p_kind,p_id,result.payload,result.revision,result.deleted);
 return jsonb_build_object('ok',true,'record',to_jsonb(result));end$$;
create function public.jojo_backup(p_trip uuid) returns void language plpgsql security definer set search_path='' as $$begin
 if not public.jojo_is_member(p_trip) then raise exception 'forbidden';end if;
 perform 1 from public.jojo_trips where id=p_trip for update;
 insert into public.jojo_backups(trip_id,records) select p_trip,coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) from public.jojo_records r where r.trip_id=p_trip on conflict(trip_id,backup_day) do nothing;
 end$$;
-- No direct writes: all mutations require membership and revision checks above.
revoke all on public.jojo_trips,public.jojo_members,public.jojo_invites,public.jojo_records,public.jojo_history,public.jojo_backups from public,anon,authenticated;
grant select on public.jojo_trips,public.jojo_members,public.jojo_records,public.jojo_history,public.jojo_backups to authenticated;
revoke all on function public.jojo_is_member(uuid),public.jojo_create_trip(text),public.jojo_invite(uuid,text),public.jojo_join(uuid),public.jojo_apply(uuid,text,text,bigint,jsonb,boolean),public.jojo_backup(uuid) from public,anon;
grant execute on function public.jojo_is_member(uuid),public.jojo_create_trip(text),public.jojo_invite(uuid,text),public.jojo_join(uuid),public.jojo_apply(uuid,text,text,bigint,jsonb,boolean),public.jojo_backup(uuid) to authenticated;
commit;
