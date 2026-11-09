'use strict';
(function(root){
 const kinds=['stops','expenses','plans','tasks','settings','rates'];
 const settings=new Set(['people','budget','start','insurance','assistance','contact','currency']);
 const clone=x=>JSON.parse(JSON.stringify(x));
 const stable=x=>JSON.stringify(x,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
 const key=r=>r.kind+':'+r.record_id;
 const allowed=(kind,id)=>kinds.includes(kind)&&typeof id==='string'&&id.length>0&&id.length<=200&&id!=='__proto__'&&id!=='constructor'&&id!=='prototype'&&(kind!=='settings'||settings.has(id));
 function flatten(data){const map=Object.create(null);for(const kind of kinds){if(['settings','rates'].includes(kind)){for(const [id,payload] of Object.entries(data[kind]||{}))if(allowed(kind,id))map[kind+':'+id]={kind,record_id:id,payload:clone(payload),deleted:false}}else for(const payload of data[kind]||[]){const id=String(payload.id);if(!allowed(kind,id))throw Error('invalid_local_record');map[kind+':'+id]={kind,record_id:id,payload:clone(payload),deleted:false}}}return map}
 const equivalent=(a,b)=>!!a?.deleted===!!b?.deleted&&(a?.deleted||stable(a?.payload)===stable(b?.payload));
 function materialize(template,map){const out=clone(template);for(const kind of kinds)out[kind]=['settings','rates'].includes(kind)?{}:[];for(const r of Object.values(map)){if(!allowed(r.kind,r.record_id)||r.deleted)continue;if(['settings','rates'].includes(r.kind))out[r.kind][r.record_id]=clone(r.payload);else out[r.kind].push(clone(r.payload))}out.version=3;out.updated=stable(flatten(template))===stable(flatten(out))?template.updated:new Date().toISOString();return out}
 class SyncEngine{
  constructor({remote,storage,scope,getData,putData,onState=()=>{}}){this.remote=remote;this.storage=storage;this.scope=scope;this.getData=getData;this.putData=putData;this.onState=onState;this.busy=false;const raw=storage.getItem(scope);this.state=raw?JSON.parse(raw):{base:{},conflicts:{},lastSync:null};this.emit('local')}
  persist(){this.storage.setItem(this.scope,JSON.stringify(this.state))}
  pending(){const local=flatten(this.getData()),ops=[];for(const id of new Set([...Object.keys(local),...Object.keys(this.state.base)])){const base=this.state.base[id],value=local[id]||{...base,deleted:true};if(!base&&value.deleted||base&&equivalent(base,value))continue;ops.push({...clone(value),revision:base?.revision||0})}return ops}
  emit(status){this.status=status;this.onState({status,pending:this.pending().length,conflicts:Object.keys(this.state.conflicts).length,lastSync:this.state.lastSync})}
  async adopt(){const records=await this.remote.list(),base=Object.create(null);for(const r of records)if(allowed(r.kind,r.record_id))base[key(r)]=r;const next=materialize(this.getData(),base);this.putData(next);this.state={base,conflicts:{},lastSync:new Date().toISOString()};this.persist();this.emit('synced')}
  async sync(){if(this.busy)return;this.busy=true;this.emit('syncing');try{
   // Pending work is reconstructed from durable local data, so it survives restarts.
   for(const op of this.pending()){
    const id=key(op);if(this.state.conflicts[id])continue;
    const result=await this.remote.apply(op);const record=result.record;
    if(!record||!allowed(record.kind,record.record_id))throw Error('invalid_server_record');
    if(result.ok||equivalent(record,op)){this.state.base[id]=record;delete this.state.conflicts[id]}else this.state.conflicts[id]={remote:record};
    this.persist();
   }
   const protectedKeys=new Set(this.pending().map(key)),local=flatten(this.getData()),records=await this.remote.list();
   for(const r of records){if(!allowed(r.kind,r.record_id))continue;const id=key(r);if(protectedKeys.has(id))continue;local[id]=r}
   const next=materialize(this.getData(),local);this.putData(next);
   for(const r of records)if(allowed(r.kind,r.record_id)&&!protectedKeys.has(key(r)))this.state.base[key(r)]=r;
   this.state.lastSync=new Date().toISOString();this.persist();
   // First snapshot per UTC day + immutable per-record history are separate from sync.
   await this.remote.backup();this.emit(Object.keys(this.state.conflicts).length?'conflict':this.pending().length?'pending':'synced');
  }catch(error){this.emit(error.status===401?'auth':'offline');throw error}finally{this.busy=false}}
  resolve(id,choice){const conflict=this.state.conflicts[id];if(!conflict)throw Error('missing_conflict');if(choice==='remote'){const map=flatten(this.getData());map[id]=conflict.remote;this.putData(materialize(this.getData(),map))}else if(choice!=='local')throw Error('invalid_choice');this.state.base[id]=conflict.remote;delete this.state.conflicts[id];this.persist();this.emit('pending')}
  restore(record){if(!allowed(record.kind,record.record_id))throw Error('invalid_record');const map=flatten(this.getData());map[key(record)]={...record,deleted:false};this.putData(materialize(this.getData(),map));this.emit('pending')}
 }
 root.JojoSyncCore={SyncEngine,flatten,materialize,equivalent,stable};
 if(typeof module!=='undefined')module.exports=root.JojoSyncCore;
})(typeof window==='undefined'?globalThis:window);
