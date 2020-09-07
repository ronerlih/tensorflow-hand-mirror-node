import * as handpose from '@tensorflow-models/handpose';
import { drawKeypoints } from './utils/drawing.js';

const infoEl = document.querySelector("#info");

const CONFIDENCE = 0.1;
let model;

async function main(){
   infoEl.innerHTML = "loading hand pose model<span class='blink'>..</span>";

   model = await handpose.load({detectionConfidence: CONFIDENCE})
   infoEl.textContent = null;

   const images = document.querySelector('#images').children;
   
   for(let img of images){
      // get canvas and draw src img

      // get prediction
      const predictions = await model.estimateHands(img);
      
      const canvas = document.querySelector(`#canvas-${img.getAttribute('id')}`);
      var context = canvas.getContext('2d');
      context.drawImage(img, 0, 0 );

      if (predictions.length > 0) {
        const result = predictions[0].landmarks;
        drawKeypoints(context, result, predictions[0].annotations);
        canvas.style.border = "6px solid lightgreen";
      }

   }
}

main();