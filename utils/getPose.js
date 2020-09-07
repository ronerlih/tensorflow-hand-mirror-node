import * as handpose from '@tensorflow-models/handpose';

const CONFIDENCE = 0.1;

let model = await handpose.load({detectionConfidence: CONFIDENCE});

export default async function getPose(img){

   return await model.estimateHands(img);
}