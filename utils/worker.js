function getGradientColor(percent) {
   // const canvas = new OffscreenCanvas(100, 1);
   // const ctx = canvas.getContext('2d');
   // const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
   // gradient.addColorStop(0, 'red');
   // gradient.addColorStop(1, 'blue');
   // ctx.fillStyle = gradient;
   // ctx.fillRect(0, 0, ctx.canvas.width, 1);
   // const imgd = ctx.getImageData(0, 0, ctx.canvas.width, 1);
   // const colors = imgd.data.slice(percent * 4, percent * 4 + 4);
   // return `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[])`;

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
onmessage = function (e){
   console.log(e)
}