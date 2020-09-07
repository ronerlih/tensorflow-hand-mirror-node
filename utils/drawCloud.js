import {fingerLookupIndices} from './fingers';
import { VIDEO_WIDTH, VIDEO_HEIGHT} from './video';

let scatterGLHasInitialized = false;

export function drawPointCloud(result, scatterGL) {

  const ANCHOR_POINTS = [[0, 0, 0], [0, -VIDEO_HEIGHT, 0],
  [-VIDEO_WIDTH, 0, 0], [-VIDEO_WIDTH, -VIDEO_HEIGHT, 0]];

  const pointsData = result.map(point => {
    return [-point[0], -point[1], -point[2]];
  });

  const dataset = new ScatterGL.Dataset([...pointsData, ...ANCHOR_POINTS]);

  if (!scatterGLHasInitialized) {
    scatterGL.render(dataset);

    const fingers = Object.keys(fingerLookupIndices);

    scatterGL.setSequences(fingers.map(finger => ({ indices: fingerLookupIndices[finger] })));
    scatterGL.setPointColorer((index) => {
      if (index < pointsData.length) {
        return 'steelblue';
      }
      return 'white'; // Hide.
    });
  } else {
    scatterGL.updateDataset(dataset);
  }
  scatterGLHasInitialized = true;
}