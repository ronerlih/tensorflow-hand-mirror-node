import { drawKeypoints } from './drawing.js';

export async function buildImagesData(model) {

   const images = document.querySelector('#images').children;
   const imagesAndPoses = await normaliseImages(images, model)


   return imagesAndPoses;
}

async function normaliseImages(images, model){
   const poseData = [];
   
   for(let [i, img] of [...images].entries()){

      // get prediction
		const predictions = await model.estimateHands(img);

      if(predictions[0] && predictions[0].landmarks) {
         
         poseData.push([img, predictions[0]]);

         // draw to canvas
         // get canvas and draw
         const canvas = document.querySelector(`#canvas-${img.getAttribute('id')}`);

         drawToCanvas(canvas, predictions, img);

         // canvas.boundingBox =  predictions[0].boundingBox
         // handFoundPipeline(predictions, img)
      }
      
   }
   return poseData;
}

function copyImgFromCanvasToCanvas(canvasA, canvasB, topLeft, bottomRight){
   
   var originContext = canvasA.getContext('2d');
   var newContext = canvasB.getContext('2d');

   let [sx, sy] = topLeft;
   let [ex, ey] = bottomRight;
   const wx = ex - sx 
   const wy = ey - sy 

   // get img data
   const imgData = originContext.getImageData(sx, sy, wx, wy);
   newContext.putImageData(imgData, sx, sy);
}

// draw the keypoints if hter and img from img tag
function drawToCanvas(canvas, predictions, img) {
   var context = canvas.getContext('2d');
   
   if (img)
      context.drawImage(img, 0, 0 );

   if (predictions.length > 0) {
     const result = predictions[0].landmarks;
     drawKeypoints(context, result, predictions[0].annotations);
     context.beginPath();
     context.lineWidth = "2";
     context.strokeStyle = "lightgreen";

     context.rect(
        predictions[0].boundingBox.topLeft[0] > 0 ? predictions[0].boundingBox.topLeft[0] : 0,
        predictions[0].boundingBox.topLeft[1] > 0 ? predictions[0].boundingBox.topLeft[1] : 0,
        predictions[0].boundingBox.bottomRight[0] - predictions[0].boundingBox.topLeft[0] < 300 ? predictions[0].boundingBox.bottomRight[0] - predictions[0].boundingBox.topLeft[0] : 300,
        predictions[0].boundingBox.bottomRight[1] - predictions[0].boundingBox.topLeft[1] < 300 ? predictions[0].boundingBox.bottomRight[1] - predictions[0].boundingBox.topLeft[1] : 300);

     context.stroke();
   }
}