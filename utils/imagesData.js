import { drawKeypoints } from './drawing.js';
import { findSimilar, buildVPTree } from './findSimilarVideo';

let normalisedPoses = [];

export async function buildImagesData(model) {

   const images = document.querySelector('#images').children;
   const imagesAndPoses = await normaliseImages(images, model);
   buildVPTree(normalisedPoses);

   return imagesAndPoses;
}

export async function findMatch (lookupPose) {
   const similarIndexOrder = await findSimilar(lookupPose);
   return similarIndexOrder
}

async function normaliseImages(images, model){
   const poseData = [];
   
   for(let [i, img] of [...images].entries()){

      // get prediction
		const predictions = await model.estimateHands(img);

      if(predictions[0] && predictions[0].landmarks) {
         normalisedPoses.push(mapLandmarks(predictions[0].landmarks))
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

export function mapLandmarks(landmarks) {
   
      return landmarks.map(pos => [pos[0], pos[1]]).flat();
}

function getAngle(inputBone, matchBone) {

   // const angel = Math.tan(Math.abs(matchSlope - inputSlope / 1 + (matchSlope * matchSlope)))
   const dAx = inputBone[1][0] - inputBone[0][0];
   const dAy = inputBone[1][1] - inputBone[0][1];
   const dBx = matchBone[1][0] - matchBone[0][0];
   const dBy = matchBone[1][1] - matchBone[0][1];
   
   let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
   if(angle < 0) {angle = angle * -1;}
   return angle 
}