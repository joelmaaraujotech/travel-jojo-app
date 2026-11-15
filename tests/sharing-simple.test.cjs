const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const trip='11111111-1111-4111-8111-111111111111',token='22222222-2222-4222-8222-222222222222';
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const records=new Map(),members=new Set(['owner']);let invitation=null,joins=0,applies=0;
 async function phone(user,{migration=true}={}){
  const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}}),p=await c.newPage();
  await p.addInitScript(({user,trip})=>{localStorage.setItem('jojo_cloud_session',JSON.stringify({access_token:user,refresh_token:user,expires_at:Math.floor(Date.now()/1000)+3600,user:{id:user,email:user+'@example.com'}}));if(user==='guest')localStorage.setItem('jojo_trip_v3',JSON.stringify({version:3,settings:{people:['Guest','Friend'],budget:99,currency:'BRL',start:'',insurance:'',assistance:'',contact:''},stops:[],plans:[],expenses:[],tasks:[],rates:{},updated:null}));if(user==='owner'){localStorage.setItem('jojo_cloud_binding',JSON.stringify({user,trip}));localStorage.setItem('jojo_sync_'+user+'_'+trip,JSON.stringify({base:{},conflicts:{},lastSync:null}))}},{user,trip});
  await p.route('**/cloud-config.js',r=>r.fulfill({contentType:'application/javascript',body:"window.JOJO_CLOUD_CONFIG={enabled:true,url:'https://test.supabase.co',publishableKey:'sb_publishable_test'}"}));
  await p.route('https://test.supabase.co/**',async r=>{const req=r.request(),path=new URL(req.url()).pathname,body=req.postDataJSON();let result=[],status=200;
   if(path.endsWith('/jojo_sharing_status')){if(!migration){status=404;result={code:'PGRST202'}}else result={trip:members.has(user)?{id:trip,is_owner:user==='owner',member_count:members.size,participants:[...members].map(user_id=>({user_id,email:user_id+'@example.com'}))}:null,invites:!members.has(user)&&invitation?.email===user+'@example.com'?[{token,inviter_email:'owner@example.com'}]:[]};}
   else if(path==='/rest/v1/jojo_members')result=members.has(user)?[{trip_id:trip}]:[];
   else if(path.endsWith('/jojo_invite')){assert.equal(body.p_email,'guest@example.com');invitation={email:body.p_email};result=token;}
   else if(path.endsWith('/jojo_join')){assert.equal(body.p_token,token);joins++;members.add(user);invitation=null;result=trip;}
   else if(path==='/rest/v1/jojo_records'){if(user==='guest')await new Promise(resolve=>setTimeout(resolve,250));result=[...records.values()];}
   else if(path.endsWith('/jojo_apply')){applies++;const id=body.p_kind+':'+body.p_id,old=records.get(id);if((old?.revision||0)!==body.p_expected)result={ok:false,record:old};else{const rec={kind:body.p_kind,record_id:body.p_id,payload:body.p_payload,deleted:body.p_deleted,revision:body.p_expected+1};records.set(id,rec);result={ok:true,record:rec}}}
   else if(path.endsWith('/jojo_backup'))result=null;
   return r.fulfill({status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify(result)});
  });
  const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8081');await p.locator('#welcome-start').click();await p.locator('nav a[href="#mais"]').click();return {c,p,errors};
 }
 const owner=await phone('owner');await owner.p.getByText('Tudo salvo na nuvem',{exact:true}).waitFor();
 assert.equal(await owner.p.locator('[data-cloud=sync]').isVisible(),false);
 const guest=await phone('guest');await guest.p.locator('[data-cloud=check-invites]').waitFor();
 await owner.p.locator('[data-cloud=invite]').click();await owner.p.locator('[name=email]').fill('guest@example.com');await owner.p.locator('#editor [type=submit]').click();await owner.p.getByRole('heading',{name:'Convite criado'}).waitFor();assert((await owner.p.locator('#modal').innerText()).includes('Nenhum e-mail é enviado'));
 await owner.p.locator('#modal .modal-footer [data-close]').click();
 await guest.p.locator('[data-cloud=check-invites]').click();await guest.p.locator('[data-cloud=accept-invite]').waitFor();assert.equal(await guest.p.locator('[data-cloud=create]').count(),0);
 await guest.p.locator('[data-cloud=accept-invite]').click();await guest.p.locator('#modal .modal-footer [data-close]').click();assert.equal(joins,0);
 await guest.p.locator('[data-cloud=accept-invite]').click();await guest.p.locator('#editor [type=submit]').click();await guest.p.getByText('Tudo salvo na nuvem',{exact:true}).waitFor();assert.equal(joins,1);assert.equal(await guest.p.locator('[data-cloud=adopt]').count(),0);assert.equal(await guest.p.locator('[data-cloud=invite]').count(),0);assert.equal(await guest.p.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith('jojo_before_cloud_')))).settings.budget),99);assert.equal(records.get('settings:budget').payload,0);
 async function budget(p,amount){await p.locator('[data-action=settings]').click();await p.locator('[name=budget]').fill(String(amount));await p.locator('#editor [type=submit]').click();await p.waitForFunction(()=>document.querySelector('.cloud-status')?.textContent==='Tudo salvo na nuvem');}
 await budget(owner.p,1234);assert.equal(records.get('settings:budget').payload,1234);await guest.p.evaluate(()=>dispatchEvent(new Event('online')));await guest.p.waitForFunction(()=>JSON.parse(localStorage.getItem('jojo_trip_v3'))?.settings.budget===1234);
 await budget(guest.p,2468);await owner.p.evaluate(()=>dispatchEvent(new Event('online')));await owner.p.waitForFunction(()=>JSON.parse(localStorage.getItem('jojo_trip_v3'))?.settings.budget===2468);assert((await owner.p.locator('#cloud-card').innerText()).includes('guest@example.com'));
 await guest.c.setOffline(true);await guest.p.waitForFunction(()=>document.querySelector('.cloud-status')?.textContent.includes('Sem internet'));await budgetOffline(guest.p);await guest.c.setOffline(false);await guest.p.waitForFunction(()=>document.querySelector('.cloud-status')?.textContent==='Tudo salvo na nuvem');assert.equal(records.get('settings:budget').payload,3000);
 async function budgetOffline(p){await p.locator('[data-action=settings]').click();await p.locator('[name=budget]').fill('3000');await p.locator('#editor [type=submit]').click();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('jojo_trip_v3')).settings.budget),3000);}
 assert.deepEqual(owner.errors,[]);assert.deepEqual(guest.errors,[]);
 const fallback=await phone('new-user',{migration:false});await fallback.p.locator('.cloud-options>summary').click();await fallback.p.locator('[data-cloud=join]').click();await fallback.p.locator('[name=token]').waitFor();assert((await fallback.p.locator('#modal').innerText()).includes('cópia de segurança'));
 await guest.p.locator('[data-language=nl]').click();await guest.p.getByText('Alles opgeslagen in de cloud',{exact:true}).waitFor();
 console.log('PASS: two separate browser phones; invitation discovery, cancel before membership, accept+backup+adopt in one flow, two-way automatic sync, offline save/reconnect, connected identity, code fallback before migration and Dutch states; applies='+applies);
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
