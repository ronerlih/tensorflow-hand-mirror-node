const tf = require('@tensorflow/tfjs-node');
const posenet = require('@tensorflow-models/posenet');
const {
    createCanvas, Image
} = require('canvas')
const imageScaleFactor = 0.5;
const outputStride = 16;
const flipHorizontal = false;

const tryModel = async() => {
    console.log('start');
    const net = await posenet.load();
    const img = new Image();
    img.src = '../images/man-working-with-bad-posture-1200x630.jpg';
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    console.log(canvas)
    const input = tf.browser.fromPixels(canvas);
    const pose = await net.estimateSinglePose(input, imageScaleFactor, flipHorizontal, outputStride);
    console.log(pose);
    for(const keypoint of pose.keypoints) {
       console.log(`${keypoint.part}: (${keypoint.position.x},${keypoint.position.y})`);
    }
    console.log('end');

}



tryModel();