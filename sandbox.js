import getPose from './utils/getPose.js';
import { drawKeypoints } from './utils/drawing.js';

async function main(){
   const images = document.querySelector('#images').children;
   
   for(let img of images){
      // get canvas and draw src img
      const canvas = document.querySelector(`#canvas-${img.getAttribute('id')}`);
      var context = canvas.getContext('2d');
      context.drawImage(img, 0, 0 );
      
      // get prediction
      const predictions = await getPose(img);

      if (predictions.length > 0) {
        const result = predictions[0].landmarks;
        drawKeypoints(context, result, predictions[0].annotations);
        canvas.style.border = "6px solid lightgreen";
      }


   }
}

main();