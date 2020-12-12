/**
 * Based on the tfjs-yolo library by shaqian
 * https://github.com/shaqian/tfjs-yolo
 */
import * as tf from "@tensorflow/tfjs";
import coco_classes from "./coco-classes";
import { v3_tiny_model, v3_tiny_anchors } from "./config";
import postprocess from "./postprocess";

const MAX_BOXES = 20;
const SCORE_THRESHOLD = 0.5;
const IOU_THRESHOLD = 0.3;

async function _loadModel(
  pathOrIOHandler: string | tf.io.IOHandler,
  modelUrl: string | null
) {
  if (modelUrl) {
    return await tf.loadGraphModel(modelUrl);
  } else {
    return await tf.loadLayersModel(pathOrIOHandler);
  }
}

async function _predict(
  version: string,
  model: tf.LayersModel | tf.GraphModel,
  image: ImageData,
  maxBoxes: number,
  scoreThreshold: number,
  iouThreshold: number,
  numClasses: number,
  anchors: number[],
  classNames: string[]
) {
  const outputs: tf.Tensor<tf.Rank>[] = tf.tidy(() => {
    let imageTensor = tf.browser.fromPixels(image, 3);
    imageTensor = imageTensor.expandDims(0).toFloat().div(tf.scalar(255));

    const outputs: tf.Tensor<tf.Rank>[] = model.predict(
      imageTensor
    ) as tf.Tensor<tf.Rank>[];
    return outputs;
  });

  const boxes = await postprocess(
    version,
    outputs,
    anchors,
    numClasses,
    classNames,
    [image.height, image.width],
    maxBoxes,
    scoreThreshold,
    iouThreshold
  );

  tf.dispose(outputs);

  return boxes;
}

async function v3tiny(pathOrIOHandler = v3_tiny_model, modelUrl = null) {
  const model = await _loadModel(pathOrIOHandler, modelUrl);

  return {
    predict: async function (
      image: ImageData,
      {
        maxBoxes = MAX_BOXES,
        scoreThreshold = SCORE_THRESHOLD,
        iouThreshold = IOU_THRESHOLD,
        numClasses = coco_classes.length,
        anchors = v3_tiny_anchors,
        classNames = coco_classes,
      } = {}
    ) {
      return await _predict(
        "v3tiny",
        model,
        image,
        maxBoxes,
        scoreThreshold,
        iouThreshold,
        numClasses,
        anchors,
        classNames
      );
    },
    dispose: () => {
      model.dispose();
    },
  };
}

const yolo = {
  v3tiny,
};

export default yolo;
