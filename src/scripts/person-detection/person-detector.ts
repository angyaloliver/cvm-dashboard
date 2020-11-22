import * as cpu from "@tensorflow/tfjs-backend-cpu";
import * as webgl from "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import {
  getBoundingBox,
  load,
  ModelConfig,
  PoseNet,
} from "@tensorflow-models/posenet";
import { BoundingBox } from "../bounding-box/bounding-box";
import { Person } from "../person/person";
import { BoundingBoxStorage } from "../perspective-reverse/bounding-box-storage";
import { transformToWorldCoordinates } from "../perspective-reverse/perspective-reverse";
import { guessParams } from "../perspective-reverse/guess-params";

console.log(cpu.version_cpu);
console.log(webgl.version_webgl);

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

const video: HTMLVideoElement = document.getElementById(
  "output-video"
) as HTMLVideoElement;

video.width = VIDEO_WIDTH;
video.height = VIDEO_HEIGHT;

let model: PoseNet | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const detectPeople = async (people: Array<Person>) => {
  await loadModel();

  console.log(tf.getBackend());

  const boundingBoxStorage = new BoundingBoxStorage();

  const animate = async () => {
    const boxes = await getBoundingBoxes();

    const newPeople = boxes.map((box) => new Person(box));
    boxes.forEach((box) => boundingBoxStorage.registerBoundingBox(box));

    const perspectiveParams = guessParams(boundingBoxStorage);

    people.splice(0, people.length, ...newPeople);

    people.forEach((person) => {
      person.wPos = transformToWorldCoordinates(
        person.boundingBox.bottom,
        perspectiveParams
      );
      person.calculateCvm(people);
    });

    await animate();
  };

  await animate();
};

async function loadModel() {
  console.log("Loading tensorflow model...");

  const config: ModelConfig = {
    architecture: "ResNet50",
    outputStride: 16,
    inputResolution: {
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
    },
    quantBytes: 4,
  };

  model = await load(config);

  console.log("Model loaded");
}

async function getBoundingBoxes(): Promise<BoundingBox[]> {
  const config = {
    flipHorizontal: false,
    maxDetections: 10,
    scoreThreshold: 0.5,
  };

  try {
    const poses = await model?.estimateMultiplePoses(video, config);

    return (
      poses?.map((pose) => {
        const tfBoundingBox = getBoundingBox(pose.keypoints);

        let x =
          tfBoundingBox.minX + (tfBoundingBox.maxX - tfBoundingBox.minX) / 2;
        let y = tfBoundingBox.maxY;
        let height = tfBoundingBox.maxY - tfBoundingBox.minY;

        x = (x - VIDEO_WIDTH / 2) / (VIDEO_WIDTH / 2);
        y = (VIDEO_HEIGHT / 2 - y) / (VIDEO_HEIGHT / 2);
        height /= VIDEO_HEIGHT;

        return new BoundingBox([x, y], height);
      }) || []
    );
  } catch (error) {
    await sleep(500);
    return [];
  }
}
