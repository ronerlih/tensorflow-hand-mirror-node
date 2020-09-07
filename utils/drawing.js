
import {fingerLookupIndices} from './fingers.js';

export function drawPoint(ctx, y, x, r) {
   ctx.beginPath();
   ctx.arc(x, y, r, 0, 2 * Math.PI);
   ctx.fill();
 }

export function drawKeypoints(ctx, keypoints) {
   const keypointsArray = keypoints;
 
   for (let i = 0; i < keypointsArray.length; i++) {
     const y = keypointsArray[i][0];
     const x = keypointsArray[i][1];
     drawPoint(ctx, x - 2, y - 2, 3);
   }
 
   const fingers = Object.keys(fingerLookupIndices);
   for (let i = 0; i < fingers.length; i++) {
     const finger = fingers[i];
     const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
     drawPath(ctx, points, false);
   }
 }
 
 export function drawPath(ctx, points, closePath) {
   const region = new Path2D();
   region.moveTo(points[0][0], points[0][1]);
   for (let i = 1; i < points.length; i++) {
     const point = points[i];
     region.lineTo(point[0], point[1]);
   }
 
   if (closePath) {
     region.closePath();
   }
   ctx.stroke(region);
 }