import { openVideoStream } from "./scripts/media-stream/open-video-stream";
import { openCameraStream } from "./scripts/media-stream/open-camera-stream";
import { getRandomVideoUrl } from "./scripts/media-stream/get-random-video-url";
import { UI } from "./scripts/ui/ui";
import { updateStatistics } from "./scripts/statistics/update-statistics";
import { applyArrayPlugins } from "./scripts/plugins/arrayPlugins";
import { Person } from "./scripts/person/person";
import { drawGradients } from "./scripts/ui/draw-gradients";
import { BoundingBox } from "./scripts/bounding-box/bounding-box";
import { OrientationProvider } from "./scripts/orientation-provider/orientation-provider";
import { BoundingBoxStorage } from "./scripts/perspective-reverse/bounding-box-storage";
import { guessParams } from "./scripts/perspective-reverse/guess-params";
import { transformToWorldCoordinates } from "./scripts/perspective-reverse/perspective-reverse";
import { WorkerResponse } from "./scripts/worker-message/worker-response";
import { WorkerRequest } from "./scripts/worker-message/worker-request";
import { showBoundingBoxes } from "./scripts/person-detection/show-bounding-boxes";

declare global {
  interface Array<T> {
    x: T;
    y: T;
    z: T;
  }

  interface ReadonlyArray<T> {
    x: T;
    y: T;
    z: T;
  }

  interface Float32Array {
    x: number;
    y: number;
    z: number;
  }
}

const loadInput = async (ui: UI) => {
  try {
    await ui.giveVideoStream(await openCameraStream());
  } catch {
    await ui.giveVideoStream(await openVideoStream(getRandomVideoUrl()));
  }
};

const video: HTMLVideoElement = document.getElementById(
  "output-video"
) as HTMLVideoElement;

const offscreenCanvas = document.createElement("canvas");
const ctx = offscreenCanvas.getContext("2d");

const ui: UI = new UI(() => loadInput(ui));
const people: Array<Person> = new Array<Person>();
const boundingBoxStorage = new BoundingBoxStorage();
const orientationProvider = new OrientationProvider();

const personDetectorWorker = new Worker("worker.js");

const main = async () => {
  applyArrayPlugins();

  updateStatistics(ui, people);
  drawGradients(ui, people);

  await loadInput(ui);

  personDetectorWorker.postMessage(new WorkerRequest("loadModel"));

  personDetectorWorker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    switch (e.data.type) {
      case "modelLoaded": {
        requestDetectionFromWorker();
        break;
      }
      case "boundingBoxes": {
        processBoundingBoxes(e.data.data as BoundingBox[]);
        break;
      }
      default: {
        console.warn("Unknown message from worker");
        break;
      }
    }
  };
};

const requestDetectionFromWorker = () => {
  offscreenCanvas.width = video.videoWidth;
  offscreenCanvas.height = video.videoHeight;

  if (!video.paused && !video.ended) {
    ctx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const imgData = ctx?.getImageData(
      0,
      0,
      video.videoWidth,
      video.videoHeight
    );
    personDetectorWorker.postMessage(
      new WorkerRequest("getBoundingBoxes", imgData)
    );
  }
};

const processBoundingBoxes = (boxes: BoundingBox[]) => {
  boxes.forEach((box) => boundingBoxStorage.registerBoundingBox(box));
  const perspectiveParams = guessParams(
    boundingBoxStorage,
    orientationProvider
  );

  const newPeople = boxes.map((box) => new Person(box));
  people.splice(0, people.length, ...newPeople);

  people.forEach((person) => {
    person.wPos = transformToWorldCoordinates(
      person.boundingBox.bottom,
      perspectiveParams
    );
  });

  people.forEach((person) => {
    person.calculateCvm(people);
  });

  // showBoundingBoxes(people);
  requestDetectionFromWorker();
};

void main();
