import * as handpose from '@tensorflow-models/handpose';
// import { cropAndResize } from '@tensorflow/tfjs-core/dist/ops/image_ops';
import { drawKeypoints, drawPointAnnotation } from './utils/drawing.js';
import findSimilar from './utils/findSimilar.js';
import l2norm from 'compute-l2norm';
// import { drawMatches } from 'opencv4nodejs';

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
   // console.log(poseData)

   // find similar
   // const similarIndex = await findSimilar(inputPose, poseData);
   
   const similarIndexOrder = await findSimilar(mapLandmarks(inputPose.landmarks), poseData.map(pred => mapLandmarks(pred.landmarks)));
   

   const inputBone = [inputPose.landmarks[0], inputPose.landmarks[17]]
   const matchBone = [poseData[similarIndexOrder[0]].landmarks[0], poseData[similarIndexOrder[0]].landmarks[17]]

   drawCanvasMatches(similarIndexOrder);
   
   transformDataImageInRelationToInput(inputBone,matchBone, poseData[similarIndexOrder[0]])

   // console.log(similarIndexOrder)
}

function drawCanvasMatches(similarIndexOrder){

   similarIndexOrder
   .map( i => confirmedCanvases[i])
   // .map( canvas => console.log(canvas))
   .map((canvas, i) => {
      
      copyImgFromCanvasToCanvas(canvas,sortedCanvas[i],canvas.boundingBox.topLeft, canvas.boundingBox.bottomRight);
      return canvas;
   });

}
function transformDataImageInRelationToInput(inputBone, matchBone, matchPose){

   // get angel
   const angel = getAngle(inputBone, matchBone);
   
   // get img data
   const matchCtx = sortedCanvas[0].getContext('2d');
   // const imgData = matchCtx.getImageData(0,0,300,300);

   // rotate closest match
   // sortedCanvas[0].style= `transform: rotate(1rad);`;
   sortedCanvas[0].style= `transform: rotate(${angel}rad);`;
   
   const inputCtx = inputCanvas.getContext('2d');
   inputCtx.scale(2, 2);
   inputCtx.translate(252, -88)
   inputCtx.rotate(angel)

   inputCtx.globalAlpha = 0.75;

   
   inputCtx.drawImage(sortedCanvas[0],0,0);
   // inputCtx.rotate(-Math.PI / 2)
   
   
   console.log(matchPose)
}
async function drawOnInputImage(){

   const predictions = await getPrediction(inputEl);
   inputPose = predictions[0]

   // draw dots
   predictions[0].landmarks.map((position, i) => {
      drawPointAnnotation(inputCanvas.getContext('2d'), position[1],position[0], 5 , i)
   })

   // inputPose = predictions[0].landmarks.map(xyzPose => l2norm(xyzPose)).flat();
   drawToCanvas(inputCanvas, predictions);

   // return currentPose;
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
      // if(i == 0) {
      //    console.log(img);
      //    console.log(predictions[0]);
      // }

      if(predictions[0] && predictions[0].landmarks) 
         {
            poseData.push(predictions[0]);
            img.setAttribute("data-confirmed-id", i);
         }
         // poseData.push(predictions[0].landmarks.map(xyzPose => l2norm(xyzPose)).flat())
      
      // get canvas and draw
      const canvas = document.querySelector(`#canvas-${img.getAttribute('id')}`);

      drawToCanvas(canvas, predictions, img);

      if (predictions[0]) {
         canvas.boundingBox =  predictions[0].boundingBox
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
   // console.log(boundingBox)
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
   const wx = ex - sx 
   const wy = ey - sy 

   // get img data
   const imgData = originContext.getImageData(sx, sy, wx, wy);
   newContext.putImageData(imgData, sx, sy);
   canvasB.style.border = "6px solid lightgreen";


}

// 🚀
main();

Number.prototype.minMax = function(min, max) {
   return Math.min(Math.max(this, min), max)
}