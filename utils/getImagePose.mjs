import posenet from '@tensorflow-models/posenet';
import {readFileSync} from "./readFileSync.mjs";
import * as tf from '@tensorflow/tfjs-node';
import Canvas from 'canvas';
import fs from 'fs';


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
      const canvas = await bufferToImageData(data);
   const imageScaleFactor = 0.50;
   const flipHorizontal = false;
   const outputStride = 16;
   //convert image file to base64-encoded string
   // var htmlImageElement = new Image(630, 630);
   // console.log(htmlImageElement);
   // // load the posenet model
   const net = await posenet.load();

   const pose = await net.estimateSinglePose(canvas, imageScaleFactor, flipHorizontal, outputStride);
   console.log(pose);

   // draw
   const ctx = canvas.getContext('2d');

 
   pose.keypoints
      .filter(point => point.score >= 0.5)
      .forEach( point => {
         ctx.beginPath(); //Start path
         ctx.arc(point.position.x, point.position.y, 3, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
         ctx.fill();
      })
   const dataURL = canvas.toDataURL()
   var matches = dataURL.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
   const newBuf = new Buffer(matches[2], 'base64')
   console.log(newBuf)
   var buf = Buffer.from(newBuf, 'base64');
   await fs.writeFileSync('image.jpg', buf);

   
}
getImagePose();


export {getImagePose};