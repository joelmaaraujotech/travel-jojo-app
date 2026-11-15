-- Apply once in Supabase SQL Editor. Safe to re-run; does not alter trip data.
begin;
create or replace function public.jojo_sharing_status()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  account_id uuid := auth.uid();
  verified_email text;
  shared_trip uuid;
  trip_info jsonb;
  invitations jsonb;
begin
  if account_id is null then raise exception 'authentication_required'; end if;
  select lower(u.email) into verified_email from auth.users u
    where u.id = account_id and u.email_confirmed_at is not null;
  if verified_email is null then raise exception 'verified_email_required'; end if;
  select m.trip_id into shared_trip from public.jojo_members m where m.user_id = account_id;
  if shared_trip is not null then
    select jsonb_build_object(
      'id', t.id, 'is_owner', t.owner_id = account_id,
      'member_count', (select count(*) from public.jojo_members m where m.trip_id = t.id),
      'participants', (select coalesce(jsonb_agg(jsonb_build_object('user_id', u.id, 'email', u.email)), '[]'::jsonb)
        from public.jojo_members m join auth.users u on u.id = m.user_id where m.trip_id = t.id)
    ) into trip_info from public.jojo_trips t where t.id = shared_trip;
  end if;
  -- Only the verified recipient can discover a token. Keep all existing invite
  -- validation, expiry, locking and two-person limits in jojo_join unchanged.
  select coalesce(jsonb_agg(row_to_json(i)), '[]'::jsonb) into invitations from (
    select v.token, v.expires_at, u.email as inviter_email
    from public.jojo_invites v
    join public.jojo_trips t on t.id = v.trip_id
    join auth.users u on u.id = t.owner_id
    where v.email = verified_email and v.expires_at > now() and shared_trip is null
      and (select count(*) from public.jojo_members m where m.trip_id = v.trip_id) < 2
    order by v.expires_at desc limit 25
  ) i;
  return jsonb_build_object('trip', trip_info, 'invites', invitations);
end;
$$;
revoke all on function public.jojo_sharing_status() from public, anon;
grant execute on function public.jojo_sharing_status() to authenticated;
commit;
