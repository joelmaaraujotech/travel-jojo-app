'use strict';
const UI_ICON_PATHS={
 plus:'<path d="M12 5v14M5 12h14"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',check:'<path d="m5 12 4 4L19 6"/>',circle:'<circle cx="12" cy="12" r="8.5"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 edit:'<path d="m14 5 5 5M4 20l4.5-1L20 7.5a2.8 2.8 0 0 0-4-4L4.5 15 4 20Z"/>',trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 17v4h16v-4"/>',
 sound:'<path d="M11 4 5 9H2v6h3l6 5V4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',expand:'<path d="M9 3H3v6M15 3h6v6M3 15v6h6M21 15v6h-6"/>',
 settings:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',exchange:'<path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/>',
 chevron:'<path d="m7 10 5 5 5-5"/>',phone:'<path d="m5 3 4 1 1 5-3 2a15 15 0 0 0 6 6l2-3 5 1 1 4c-1 4-7 2-12-3S2 4 5 3Z"/>',map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5ZM9 3v16M15 5v16"/>',speech:'<path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z"/>'
};
function uiIcon(name){return `<svg class="ui-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${UI_ICON_PATHS[name]||UI_ICON_PATHS.circle}</svg>`}
function decorateIcons(root=document){
 root.querySelectorAll('button:not([data-language]):not(#appearance-fab),a.button,summary,.tag[data-status]').forEach(el=>{
  if(el.closest('.modal-footer')){el.querySelectorAll('.ui-icon').forEach(icon=>icon.remove());return}
  if(el.querySelector('.ui-icon'))return;
  const action=el.dataset.action;
  let name=({lodging:'pin',transport:'map',reservation:'download',notes:'edit',convert:'exchange',expense:'plus',plan:'plus',address:'pin','remove-plan':'close','delete-stop':'trash','delete-expense':'trash',offline:'download',export:'download',import:'upload',speak:'sound','show-phrase':'expand',settings:'settings',rate:'exchange'})[action];
  if(action==='stop')name=el.dataset.id?'edit':'plus';
  if(action==='vote')name=el.getAttribute('aria-pressed')==='true'?'check':'circle';
  if(el.hasAttribute('data-close'))name='close';
  if(el.matches('button[type=submit]'))name='check';
  if(el.id==='help')name='help';
  if(el.tagName==='SUMMARY')name='chevron';
  if(el.matches('.tag[data-status]'))name=el.dataset.status==='Ideia'?'circle':'check';
  if(el.matches('a.button'))name=el.getAttribute('href').startsWith('tel:')?'phone':el.getAttribute('href').startsWith('#frases')?'speech':'map';
  if(!name)return;
  for(const node of el.childNodes)if(node.nodeType===Node.TEXT_NODE)node.textContent=node.textContent.replace(/^\s*[＋✚✕✓○]\s*/,'');
  el.insertAdjacentHTML('afterbegin',uiIcon(name));
 });
}
