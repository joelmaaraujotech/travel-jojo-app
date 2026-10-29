'use strict';
// Private mobile app: suppress page scaling while retaining one-finger scrolling.
(function(){
 function preventScale(event){if(event.cancelable)event.preventDefault()}
 for(const name of ['gesturestart','gesturechange','gestureend'])document.addEventListener(name,preventScale,{passive:false});
 function preventMultiTouch(event){if(event.touches.length>1)preventScale(event)}
 document.addEventListener('touchstart',preventMultiTouch,{passive:false});
 document.addEventListener('touchmove',preventMultiTouch,{passive:false});
})();
