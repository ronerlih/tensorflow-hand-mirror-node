"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs-core");
const box_1 = require("./box");
const rotate_cpu_1 = require("./rotate_cpu");
const rotate_gpu_1 = require("./rotate_gpu");
const util_1 = require("./util");
const UPDATE_REGION_OF_INTEREST_IOU_THRESHOLD = 0.8;
const PALM_BOX_SHIFT_VECTOR = [0, -0.4];
const PALM_BOX_ENLARGE_FACTOR = 3;
const HAND_BOX_SHIFT_VECTOR = [0, -0.1];
const HAND_BOX_ENLARGE_FACTOR = 1.65;
const PALM_LANDMARK_IDS = [0, 5, 9, 13, 17, 1, 2];
const PALM_LANDMARKS_INDEX_OF_PALM_BASE = 0;
const PALM_LANDMARKS_INDEX_OF_MIDDLE_FINGER_BASE = 2;
class HandPipeline {
    constructor(boundingBoxDetector, meshDetector, meshWidth, meshHeight, maxContinuousChecks, detectionConfidence) {
        this.regionsOfInterest = [];
        this.runsWithoutHandDetector = 0;
        this.boundingBoxDetector = boundingBoxDetector;
        this.meshDetector = meshDetector;
        this.maxContinuousChecks = maxContinuousChecks;
        this.detectionConfidence = detectionConfidence;
        this.meshWidth = meshWidth;
        this.meshHeight = meshHeight;
        this.maxHandsNumber = 1;
    }
    getBoxForPalmLandmarks(palmLandmarks, rotationMatrix) {
        const rotatedPalmLandmarks = palmLandmarks.map((coord) => {
            const homogeneousCoordinate = [...coord, 1];
            return util_1.rotatePoint(homogeneousCoordinate, rotationMatrix);
        });
        const boxAroundPalm = this.calculateLandmarksBoundingBox(rotatedPalmLandmarks);
        return box_1.enlargeBox(box_1.squarifyBox(box_1.shiftBox(boxAroundPalm, PALM_BOX_SHIFT_VECTOR)), PALM_BOX_ENLARGE_FACTOR);
    }
    getBoxForHandLandmarks(landmarks) {
        const boundingBox = this.calculateLandmarksBoundingBox(landmarks);
        const boxAroundHand = box_1.enlargeBox(box_1.squarifyBox(box_1.shiftBox(boundingBox, HAND_BOX_SHIFT_VECTOR)), HAND_BOX_ENLARGE_FACTOR);
        const palmLandmarks = [];
        for (let i = 0; i < PALM_LANDMARK_IDS.length; i++) {
            palmLandmarks.push(landmarks[PALM_LANDMARK_IDS[i]].slice(0, 2));
        }
        boxAroundHand.palmLandmarks = palmLandmarks;
        return boxAroundHand;
    }
    transformRawCoords(rawCoords, box, angle, rotationMatrix) {
        const boxSize = box_1.getBoxSize(box);
        const scaleFactor = [boxSize[0] / this.meshWidth, boxSize[1] / this.meshHeight];
        const coordsScaled = rawCoords.map((coord) => {
            return [
                scaleFactor[0] * (coord[0] - this.meshWidth / 2),
                scaleFactor[1] * (coord[1] - this.meshHeight / 2), coord[2]
            ];
        });
        const coordsRotationMatrix = util_1.buildRotationMatrix(angle, [0, 0]);
        const coordsRotated = coordsScaled.map((coord) => {
            const rotated = util_1.rotatePoint(coord, coordsRotationMatrix);
            return [...rotated, coord[2]];
        });
        const inverseRotationMatrix = util_1.invertTransformMatrix(rotationMatrix);
        const boxCenter = [...box_1.getBoxCenter(box), 1];
        const originalBoxCenter = [
            util_1.dot(boxCenter, inverseRotationMatrix[0]),
            util_1.dot(boxCenter, inverseRotationMatrix[1])
        ];
        return coordsRotated.map((coord) => {
            return [
                coord[0] + originalBoxCenter[0], coord[1] + originalBoxCenter[1],
                coord[2]
            ];
        });
    }
    async estimateHand(image) {
        const useFreshBox = this.shouldUpdateRegionsOfInterest();
        if (useFreshBox === true) {
            const boundingBoxPrediction = await this.boundingBoxDetector.estimateHandBounds(image);
            if (boundingBoxPrediction === null) {
                image.dispose();
                this.regionsOfInterest = [];
                return null;
            }
            this.updateRegionsOfInterest(boundingBoxPrediction, true);
            this.runsWithoutHandDetector = 0;
        }
        else {
            this.runsWithoutHandDetector++;
        }
        const currentBox = this.regionsOfInterest[0];
        const angle = util_1.computeRotation(currentBox.palmLandmarks[PALM_LANDMARKS_INDEX_OF_PALM_BASE], currentBox.palmLandmarks[PALM_LANDMARKS_INDEX_OF_MIDDLE_FINGER_BASE]);
        const palmCenter = box_1.getBoxCenter(currentBox);
        const palmCenterNormalized = [palmCenter[0] / image.shape[2], palmCenter[1] / image.shape[1]];
        let rotatedImage;
        const backend = tf.getBackend();
        if (backend === 'webgl') {
            rotatedImage = rotate_gpu_1.rotate(image, angle, 0, palmCenterNormalized);
        }
        else if (backend === 'cpu') {
            rotatedImage = rotate_cpu_1.rotate(image, angle, 0, palmCenterNormalized);
        }
        else {
            throw new Error(`Handpose is not yet supported by the ${backend} ` +
                `backend - rotation kernel is not defined.`);
        }
        const rotationMatrix = util_1.buildRotationMatrix(-angle, palmCenter);
        let box;
        if (useFreshBox === true) {
            box =
                this.getBoxForPalmLandmarks(currentBox.palmLandmarks, rotationMatrix);
        }
        else {
            box = currentBox;
        }
        const croppedInput = box_1.cutBoxFromImageAndResize(box, rotatedImage, [this.meshWidth, this.meshHeight]);
        const handImage = croppedInput.div(255);
        croppedInput.dispose();
        rotatedImage.dispose();
        const savedWebglPackDepthwiseConvFlag = tf.env().get('WEBGL_PACK_DEPTHWISECONV');
        tf.env().set('WEBGL_PACK_DEPTHWISECONV', true);
        const [flag, keypoints] = this.meshDetector.predict(handImage);
        tf.env().set('WEBGL_PACK_DEPTHWISECONV', savedWebglPackDepthwiseConvFlag);
        handImage.dispose();
        const flagValue = flag.dataSync()[0];
        flag.dispose();
        if (flagValue < this.detectionConfidence) {
            keypoints.dispose();
            this.regionsOfInterest = [];
            return null;
        }
        const keypointsReshaped = tf.reshape(keypoints, [-1, 3]);
        const rawCoords = keypointsReshaped.arraySync();
        keypoints.dispose();
        keypointsReshaped.dispose();
        const coords = this.transformRawCoords(rawCoords, box, angle, rotationMatrix);
        const nextBoundingBox = this.getBoxForHandLandmarks(coords);
        this.updateRegionsOfInterest(nextBoundingBox, false);
        const result = {
            landmarks: coords,
            handInViewConfidence: flagValue,
            boundingBox: {
                topLeft: nextBoundingBox.startPoint,
                bottomRight: nextBoundingBox.endPoint
            }
        };
        return result;
    }
    calculateLandmarksBoundingBox(landmarks) {
        const xs = landmarks.map(d => d[0]);
        const ys = landmarks.map(d => d[1]);
        const startPoint = [Math.min(...xs), Math.min(...ys)];
        const endPoint = [Math.max(...xs), Math.max(...ys)];
        return { startPoint, endPoint };
    }
    updateRegionsOfInterest(box, forceUpdate) {
        if (forceUpdate) {
            this.regionsOfInterest = [box];
        }
        else {
            const previousBox = this.regionsOfInterest[0];
            let iou = 0;
            if (previousBox != null && previousBox.startPoint != null) {
                const [boxStartX, boxStartY] = box.startPoint;
                const [boxEndX, boxEndY] = box.endPoint;
                const [previousBoxStartX, previousBoxStartY] = previousBox.startPoint;
                const [previousBoxEndX, previousBoxEndY] = previousBox.endPoint;
                const xStartMax = Math.max(boxStartX, previousBoxStartX);
                const yStartMax = Math.max(boxStartY, previousBoxStartY);
                const xEndMin = Math.min(boxEndX, previousBoxEndX);
                const yEndMin = Math.min(boxEndY, previousBoxEndY);
                const intersection = (xEndMin - xStartMax) * (yEndMin - yStartMax);
                const boxArea = (boxEndX - boxStartX) * (boxEndY - boxStartY);
                const previousBoxArea = (previousBoxEndX - previousBoxStartX) *
                    (previousBoxEndY - boxStartY);
                iou = intersection / (boxArea + previousBoxArea - intersection);
            }
            this.regionsOfInterest[0] =
                iou > UPDATE_REGION_OF_INTEREST_IOU_THRESHOLD ? previousBox : box;
        }
    }
    shouldUpdateRegionsOfInterest() {
        const roisCount = this.regionsOfInterest.length;
        return roisCount !== this.maxHandsNumber ||
            this.runsWithoutHandDetector >= this.maxContinuousChecks;
    }
}
exports.HandPipeline = HandPipeline;
//# sourceMappingURL=pipeline.js.map