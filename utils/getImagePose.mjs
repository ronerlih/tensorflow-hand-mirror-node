import posenet from '@tensorflow-models/posenet';
import {readFileSync} from "./readFileSync.mjs";
import * as tf from '@tensorflow/tfjs-node';
import Canvas from 'canvas';


async function bufferToImageData (buff) {
   const canvas = Canvas.createCanvas(630, 630)
   const ctx = canvas.getContext('2d');

   // Draw image on canvas
   const image = await Canvas.loadImage(buff)
   await ctx.drawImage(image, 0, 0, 630, 630)
   
   // return ctx;
   // const clamped = Uint8ClampedArray.from(buff)
   // clamped.width = 630;
   // clamped.height = 630;
   return canvas;
}

async function getImagePose() {
   // const imageElement = document.getElementById('cat');
   // readfile for testing
   const data = readFileSync('../images/man-working-with-bad-posture-1200x630.jpg')
      const imageData = await bufferToImageData(data);
   const imageScaleFactor = 0.50;
   const flipHorizontal = false;
   const outputStride = 16;
   //convert image file to base64-encoded string
   // var htmlImageElement = new Image(630, 630);
   // console.log(htmlImageElement);
   console.log(imageData)
   // // load the posenet model
   const net = await posenet.load();

   const pose = await net.estimateSinglePose(imageData, imageScaleFactor, flipHorizontal, outputStride);
   console.log(pose)

}
getImagePose();


export {getImagePose};