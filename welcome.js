'use strict';
(function(){const dialog=document.querySelector('#welcome-screen');const text=(pt,nl)=>uiLanguage==='nl'?nl:pt;
function updateWelcome(){dialog.querySelector('#welcome-subtitle').textContent=text('Marrocos & Egito','Marokko & Egypte');dialog.querySelector('#welcome-start').textContent=text('Começar','Starten');dialog.querySelector('.welcome-languages').setAttribute('aria-label',text('Escolher idioma','Taal kiezen'));dialog.querySelectorAll('[data-welcome-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.welcomeLanguage===uiLanguage)))}
dialog.querySelectorAll('[data-welcome-language]').forEach(button=>button.onclick=()=>{uiLanguage=button.dataset.welcomeLanguage;try{localStorage.setItem('jojo_language',uiLanguage)}catch{}updateWelcome();render()});
function showWelcome(){updateWelcome();document.body.classList.add('welcome-open');if(!dialog.open)dialog.showModal();document.documentElement.classList.remove('welcome-pending');document.querySelector('meta[name="theme-color"]').content='#000000'}
function start(){dialog.close();document.body.classList.remove('welcome-open');document.documentElement.classList.remove('welcome-pending');if(typeof applyAppearance==='function')applyAppearance();/* Returning from the background must not discard an open form. */if(document.querySelector('#modal')?.open)return;if(location.hash!=='#hoje')location.hash='#hoje';else render()}
dialog.querySelector('#welcome-start').onclick=start;
// Entry is explicit: Escape/back dismiss gestures cannot skip Start.
dialog.addEventListener('cancel',e=>e.preventDefault());
// iOS can resume a PWA without reloading its document.
let wasHidden=document.hidden;
document.addEventListener('visibilitychange',()=>{if(document.hidden){wasHidden=true;return}if(wasHidden){wasHidden=false;showWelcome()}});
window.addEventListener('pageshow',showWelcome);
showWelcome();
})();
