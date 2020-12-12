import * as tf from "@tensorflow/tfjs";
import { TensorLike1D } from "@tensorflow/tfjs-core/dist/types";
import { v3_masks } from "./config";

async function postprocess(
  version: string | string[],
  outputs: tf.Tensor<tf.Rank>[],
  anchors: number[],
  numClasses: number,
  classNames: string[],
  imageShape: number[],
  maxBoxes: number,
  scoreThreshold: number | undefined,
  iouThreshold: number | undefined
) {
  const isV3 = version.indexOf("v3") > -1;
  const [boxes, boxScores] = yoloEval(
    isV3,
    outputs,
    anchors,
    numClasses,
    imageShape
  );

  const boxes_: tf.TypedArray[] = [];
  const scores_: number[] = [];
  let classes_: tf.TypedArray = new Int32Array();

  const _classes = tf.argMax(boxScores, -1);
  const _boxScores: tf.Tensor<tf.Rank.R1> = tf.max(boxScores, -1);

  const nmsIndex = await tf.image.nonMaxSuppressionAsync(
    boxes,
    _boxScores,
    maxBoxes,
    iouThreshold,
    scoreThreshold
  );

  if (nmsIndex.size) {
    tf.tidy(() => {
      const classBoxes = tf.gather(boxes, nmsIndex);
      const classBoxScores = tf.gather(_boxScores, nmsIndex);

      classBoxes.split(nmsIndex.size).map((box) => {
        boxes_.push(box.dataSync());
      });
      classBoxScores.dataSync().forEach((score: number) => {
        scores_.push(score);
      });
      classes_ = _classes.gather(nmsIndex).dataSync();
    });
  }
  _boxScores.dispose();
  _classes.dispose();
  nmsIndex.dispose();

  boxes.dispose();
  boxScores.dispose();

  return boxes_.map((box, i) => {
    const top = Math.max(0, box[0]);
    const left = Math.max(0, box[1]);
    const bottom = Math.min(imageShape[0], box[2]);
    const right = Math.min(imageShape[1], box[3]);
    const height = bottom - top;
    const width = right - left;
    return {
      top,
      left,
      bottom,
      right,
      height,
      width,
      score: scores_[i],
      class: classNames[classes_[i]],
    };
  });
}

function yoloEval(
  isV3: boolean,
  outputs: any[],
  anchors: TensorLike1D,
  numClasses: any,
  imageShape: any
) {
  return tf.tidy(() => {
    let numLayers = 1;
    let inputShape;
    let anchorMask;

    if (isV3) {
      numLayers = outputs.length;
      anchorMask = v3_masks[numLayers];
      inputShape = outputs[0].shape.slice(1, 3).map((num: number) => num * 32);
    } else {
      inputShape = outputs.shape.slice(1, 3);
    }

    const anchorsTensor = tf.tensor1d(anchors).reshape([-1, 2]);
    let boxes = [];
    let boxScores = [];

    for (let i = 0; i < numLayers; i++) {
      const [_boxes, _boxScores] = yoloBoxesAndScores(
        isV3,
        isV3 ? outputs[i] : outputs,
        isV3
          ? anchorsTensor.gather(tf.tensor1d(anchorMask[i], "int32"))
          : anchorsTensor,
        numClasses,
        inputShape,
        imageShape
      );

      boxes.push(_boxes);
      boxScores.push(_boxScores);
    }

    boxes = tf.concat(boxes);
    boxScores = tf.concat(boxScores);

    return [boxes, boxScores];
  });
}

function yoloBoxesAndScores(
  isV3: any,
  feats: any,
  anchors: tf.Tensor<tf.Rank>,
  numClasses: number,
  inputShape: any,
  imageShape: any
) {
  const [boxXy, boxWh, boxConfidence, boxClassProbs] = yoloHead(
    isV3,
    feats,
    anchors,
    numClasses,
    inputShape
  );

  let boxes = yoloCorrectBoxes(boxXy, boxWh, imageShape);
  boxes = boxes.reshape([-1, 4]);
  let boxScores = tf.mul(boxConfidence, boxClassProbs);
  boxScores = tf.reshape(boxScores, [-1, numClasses]);

  return [boxes, boxScores];
}

function yoloHead(
  isV3: any,
  feats: tf.Tensor<tf.Rank>,
  anchors: tf.Tensor<tf.Rank>,
  numClasses: number,
  inputShape: any[]
) {
  const numAnchors = anchors.shape[0];
  // Reshape to height, width, num_anchors, box_params.
  const anchorsTensor = tf.reshape(anchors, [1, 1, numAnchors, 2]);

  const gridShape = feats.shape.slice(1, 3); // height, width

  const gridY = tf.tile(tf.reshape(tf.range(0, gridShape[0]), [-1, 1, 1, 1]), [
    1,
    gridShape[1],
    1,
    1,
  ]);
  const gridX = tf.tile(tf.reshape(tf.range(0, gridShape[1]), [1, -1, 1, 1]), [
    gridShape[0],
    1,
    1,
    1,
  ]);
  const grid = tf.concat([gridX, gridY], 3).cast(feats.dtype);

  feats = feats.reshape([
    gridShape[0],
    gridShape[1],
    numAnchors,
    numClasses + 5,
  ]);

  const [xy, wh, con, probs] = tf.split(feats, [2, 2, 1, numClasses], 3);
  // Adjust preditions to each spatial grid point and anchor size.
  const boxXy = tf.div(tf.add(tf.sigmoid(xy), grid), gridShape.reverse());
  const boxWh = tf.div(tf.mul(tf.exp(wh), anchorsTensor), inputShape.reverse());
  const boxConfidence = tf.sigmoid(con);

  let boxClassProbs;
  if (isV3) {
    boxClassProbs = tf.sigmoid(probs);
  } else {
    boxClassProbs = tf.softmax(probs);
  }

  return [boxXy, boxWh, boxConfidence, boxClassProbs];
}

function yoloCorrectBoxes(
  boxXy:
    | string
    | number
    | boolean
    | tf.Tensor<tf.Rank>
    | Uint8Array
    | Int32Array
    | Float32Array
    | tf.RecursiveArray<boolean>
    | tf.RecursiveArray<string>
    | Uint8Array[]
    | tf.RecursiveArray<
        number | number[] | Uint8Array | Int32Array | Float32Array
      >,
  boxWh:
    | string
    | number
    | boolean
    | tf.Tensor<tf.Rank>
    | Uint8Array
    | Int32Array
    | Float32Array
    | tf.RecursiveArray<boolean>
    | tf.RecursiveArray<string>
    | Uint8Array[]
    | tf.RecursiveArray<
        number | number[] | Uint8Array | Int32Array | Float32Array
      >,
  imageShape:
    | number
    | boolean
    | tf.Tensor<tf.Rank>
    | tf.RecursiveArray<boolean>
    | tf.RecursiveArray<string>
    | tf.RecursiveArray<
        number | number[] | Uint8Array | Int32Array | Float32Array
      >
) {
  const boxYx = tf.concat(tf.split(boxXy, 2, 3).reverse(), 3);
  const boxHw = tf.concat(tf.split(boxWh, 2, 3).reverse(), 3);

  // Scale boxes back to original image shape.
  const boxMins = tf.mul(tf.sub(boxYx, tf.div(boxHw, 2)), imageShape);
  const boxMaxes = tf.mul(tf.add(boxYx, tf.div(boxHw, 2)), imageShape);

  const boxes = tf.concat(
    [...tf.split(boxMins, 2, 3), ...tf.split(boxMaxes, 2, 3)],
    3
  );

  return boxes;
}

export default postprocess;
