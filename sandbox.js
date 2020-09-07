import getPose from './utils/getPose.js';

function main(){
   const images = document.querySelector('#images').children;
   console.log(images)
   for(let img of images){
      getPose(img);
   }
}

main();