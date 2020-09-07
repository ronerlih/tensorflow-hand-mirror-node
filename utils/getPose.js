import * as handpose from '@tensorflow-models/handpose';
export default async function getPose(img){

   let model;
   model = await handpose.load();

   const predictions = await model.estimateHands(img);

    if (predictions.length > 0) {
      const result = predictions[0].landmarks;
      // drawKeypoints(ctx, result, predictions[0].annotations);
      console.log(predictions[0])
    }

}