export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720; // used in index.js to resize hand

export async function setupCamera(mobile) {
   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
     throw new Error(
       'Browser API navigator.mediaDevices.getUserMedia not available');
   }
 
   const video = document.getElementById('video');
   const stream = await navigator.mediaDevices.getUserMedia({
     'audio': false,
     'video': {
       facingMode: 'user',
       // Only setting the video to a specified size in order to accommodate a
       // point cloud, so on mobile devices accept the default size.
       width: mobile ? undefined :  VIDEO_WIDTH   ,
       // height: mobile ? undefined : VIDEO_HEIGHT * 2
     },
   });
   video.srcObject = stream;
 
   return new Promise((resolve) => {
     video.onloadedmetadata = () => {
       resolve(video);
     };
   });
 }
 
 export async function loadVideo(mobile) {
   const video = await setupCamera(mobile);
   video.play();
   return video;
 }
