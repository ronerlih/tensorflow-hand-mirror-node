/* eslint-disable */
/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as handpose from '@tensorflow-models/handpose';
import * as utils from './utils';
import { drawKeypoints } from './utils/drawing.js';
import { loadVideo } from './utils/video.js';

import {drawPointCloud} from './utils/drawCloud';

let videoWidth, videoHeight, scatterGL;
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

const mobile = utils.isMobile();
// Don't render the point cloud on mobile in order to maximize performance and
// to avoid crowding limited screen space.
let renderPointcloud = mobile === false;

const state = {};
state.confidence = 0.5;
state.flip = false;

if (renderPointcloud) {
  state.renderPointcloud = false;
}

let model;

const main = async () => {
  model = await handpose.load(
    {detectionConfidence: state.confidence}
  );
  let video;

  try {
    video = await loadVideo(mobile);
  } catch (e) {
    noCameraMessage(e)
  }

  landmarksRealTime(video);
}

function noCameraMessage(e){
  let info = document.getElementById('info');
  info.textContent = e.message;
  info.style.display = 'block';
  throw e;
}

function setupDatGui(state, renderPointcloud) {
  const gui = new dat.GUI();

  if (renderPointcloud) {
    gui.add(state, 'renderPointcloud')
      .onChange(render => {
        document.querySelector('#scatter-gl-container').style.display =
          render ? 'inline-block' : 'none';
      });
  }

  // flip horizontally 
  gui.add(state, 'flip')
    .onChange( flip => {
    state.flip = flip;
  }); 

  //confidence bar
  gui.add(state, 'confidence', 0, 1)
    .onChange(async sliderValue => {
      state.confidence = sliderValue;
      model = await handpose.load(
        {detectionConfidence: state.confidence}
      );
    });

}
const landmarksRealTime = async (video) => {
  setupDatGui(state, renderPointcloud);

  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;

  const canvas = document.getElementById('output');

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  const ctx = canvas.getContext('2d');

  video.width = videoWidth;
  video.height = videoHeight;

  ctx.clearRect(0, 0, videoWidth, videoHeight);
  ctx.strokeStyle = "lightgreen";
  ctx.fillStyle = "lightgreen";

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  // These anchor points allow the hand pointcloud to resize according to its
  // position in the input.

  async function frameLandmarks() {
    stats.begin();
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
    const predictions = await model.estimateHands(video,state.flip);

    if (predictions.length > 0) {
      const result = predictions[0].landmarks;
      drawKeypoints(ctx, result, predictions[0].annotations);

      if (renderPointcloud === true && scatterGL != null && state.renderPointcloud) {
        drawPointCloud(result, scatterGL);
      }
    }
    stats.end();
      requestAnimationFrame(frameLandmarks);
  };

  frameLandmarks();

  if (renderPointcloud) {
    document.querySelector('#scatter-gl-container').style =
      `width: ${VIDEO_WIDTH}px; height: ${VIDEO_HEIGHT}px;`;

    scatterGL = new ScatterGL(
      document.querySelector('#scatter-gl-container'),
      { 'rotateOnStart': false, 'selectEnabled': false });
  }
};



navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

main();


