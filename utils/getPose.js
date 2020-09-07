import * as handpose from '@tensorflow-models/handpose';

const CONFIDENCE = 0.1;

export default async function getPose(img){

   let model;
   model = await handpose.load({detectionConfidence: CONFIDENCE});

   return await model.estimateHands(img);
}