import * as handpose from '@tensorflow-models/handpose';
// import { cropAndResize } from '@tensorflow/tfjs-core/dist/ops/image_ops';
import { drawKeypoints, drawPointAnnotation } from './utils/drawing.js';
import findSimilar from './utils/findSimilar.js';
import l2norm from 'compute-l2norm';

const infoEl = document.querySelector("#info");
const inputEl = document.querySelector("#input>img");
const images = document.querySelector('#images').children;
const inputCanvas = document.querySelector("#input-canvas");
const sortedCanvas = document.querySelector("#sorted-results").children;


const CONFIDENCE = 0.01;
let model;
const poseData = [];
let inputPose;
let confirmedCanvases = [];

async function main(){

   // load handpose ts model from local storage or library
   await loadModel();

   // estimate and draw on source images
   await drawOnDatasetImages()

   // estimate and draw on input img
   await drawOnInputImage();

   // console.log(inputPose)
   console.log(poseData)

   // find similar
   // const similarIndex = await findSimilar(inputPose, poseData);
   const similarIndexOrder = await findSimilar(inputPose, poseData);

   similarIndexOrder
      .map( i => confirmedCanvases[i])
      // .map( canvas => console.log(canvas))
      .forEach((canvas, i) => copyImgFromCanvasToCanvas(canvas,sortedCanvas[i],[0, 0],[300, 300]));

   console.log(similarIndexOrder)
}

async function drawOnInputImage(){

   const predictions = await getPrediction(inputEl);
   inputPose = mapLandmarks(predictions[0].landmarks)

   // draw dots
   predictions[0].landmarks.map((position, i) => {
      drawPointAnnotation(inputCanvas.getContext('2d'), position[1],position[0], 5 , i)
   })

   // inputPose = predictions[0].landmarks.map(xyzPose => l2norm(xyzPose)).flat();
   drawToCanvas(inputCanvas, predictions);

   // return currentPose;
}
function mapLandmarks(landmarks) {
   
   // only flat
   // return landmarks.flat();

   //  2norm and flat
   // return landmarks.map(xyzPose => l2norm(xyzPose)).flat();
   
   // only 2norm
   // return landmarks.map(xyzPose => l2norm(xyzPose));

      // only 2d
      return landmarks.map(pos => [pos[0], pos[1]]).flat();



}

async function drawOnDatasetImages(){
   for(let [i, img] of [...images].entries()){

      // get prediction
      const predictions = await getPrediction(img);
      
      // debug
      if(i == 0) {
         console.log(img);
         console.log(predictions[0]);
      }

      if(predictions[0] && predictions[0].landmarks) 
         poseData.push(mapLandmarks(predictions[0].landmarks));
         // poseData.push(predictions[0].landmarks.map(xyzPose => l2norm(xyzPose)).flat())
      
      // get canvas and draw
      const canvas = document.querySelector(`#canvas-${img.getAttribute('id')}`);

      drawToCanvas(canvas, predictions, img);

      if (predictions[0]) {
         confirmedCanvases.push(canvas);
         handFoundPipeline(predictions, img)
       }
   }
   return 
}
async function handFoundPipeline(predictions, img){

   return cropAndResize(predictions, img);
   
}
async function cropAndResize(predictions, img){
   // get cannvases
   const newCanvas = document.querySelector(`#resized-${img.getAttribute('id')}`);
   const originCanvas = document.querySelector(`#canvas-${img.getAttribute('id')}`);
   const boundingBox = predictions[0].boundingBox;
   copyImgFromCanvasToCanvas(originCanvas, newCanvas, boundingBox.topLeft, boundingBox.bottomRight)
   
   return (predictions, newCanvas)
    
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
function drawPoint(canvas, position, color) {
   var context = canvas.getContext('2d');

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