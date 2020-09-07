

 export function isMobile() {
   const isAndroid = /Android/i.test(navigator.userAgent);
   const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
   return isAndroid || isiOS;
 }

