import * as handpose from '@tensorflow-models/handpose';
// import { cropAndResize } from '@tensorflow/tfjs-core/dist/ops/image_ops';
import { drawKeypoints } from './utils/drawing.js';
import findSimilar from './utils/findSimilar.js';

const infoEl = document.querySelector("#info");
const inputEl = document.querySelector("#input>img");
const images = document.querySelector('#images').children;
const inputCanvas = document.querySelector("#input-canvas");

const CONFIDENCE = 0.1;
let model;
const poseData = [];
let inputPose;

async function main(){

   // load handpose ts model from local storage or library
   await loadModel();

   // estimate and draw on source images
   drawOnDatasetImages()

   // estimate and draw on input img
   drawOnInputImage();

   // find similar
   // findSimilar(inputPose, poseData);
}

async function drawOnInputImage(){

   const predictions = await getPrediction(inputEl);
   inputPose = predictions[0];
   drawToCanvas(inputCanvas, predictions);
   // return currentPose;
}

async function drawOnDatasetImages(){
   for(let img of images){

      // get prediction
      const predictions = await getPrediction(img);
      

      poseData.push(predictions[0])
      
      // get canvas and draw
      const canvas = document.querySelector(`#canvas-${img.getAttribute('id')}`);
      drawToCanvas(canvas, predictions, img);

      if (predictions[0]) {
         handFoundPipeline(predictions, img)
       }
   }
}
async function handFoundPipeline(predictions, img){

   cropAndResize(predictions, img);
   
}
async function cropAndResize(predictions, img){
   // get cannvases
   const newCanvas = document.querySelector(`#resized-${img.getAttribute('id')}`);
   const originCanvas = document.querySelector(`#canvas-${img.getAttribute('id')}`);
   console.log(predictions)
   const boundingBox = predictions[0].boundingBox;
   copyImgFromCanvasToCanvas(originCanvas, newCanvas, boundingBox.topLeft, boundingBox.bottomRight)
   
   console.log(newCanvas)
}
async function loadModel() {
   infoEl.innerHTML = "loading hand pose model<span class='blink'>..</span>";
   
   model = await handpose.load({detectionConfidence: CONFIDENCE})

   infoEl.textContent = null;
   return;
}

async function getPrediction(img) {
   return await model.estimateHands(img);

}

// draw the keypoints if hter and img from img tag
function drawToCanvas(canvas, predictions, img) {
   var context = canvas.getContext('2d');
   
   if (img)
      context.drawImage(img, 0, 0 );

   if (predictions.length > 0) {
     const result = predictions[0].landmarks;
     drawKeypoints(context, result, predictions[0].annotations);
     canvas.style.border = "6px solid lightgreen";
   }
}

// draw from canvas context
function copyImgFromCanvasToCanvas(canvasA, canvasB, topLeft, bottomRight){
   var originContext = canvasA.getContext('2d');
   var newContext = canvasB.getContext('2d');

   let [sx, sy] = topLeft;
   let [ex, ey] = bottomRight;
   // get img data
   const imgData = originContext.getImageData(sx, sy, ex, ey);
   newContext.putImageData(imgData,sx,sy);
   canvasB.style.border = "6px solid lightgreen";


}

// 🚀
main();