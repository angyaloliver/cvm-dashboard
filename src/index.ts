import { openVideoStream } from "./scripts/media-stream/open-video-stream";
import { openCameraStream } from "./scripts/media-stream/open-camera-stream";
import { getRandomVideoUrl } from "./scripts/media-stream/get-random-video-url";
import { UI } from "./scripts/ui/ui";
import { updateStatistics } from "./scripts/statistics/update-statistics";
import { applyArrayPlugins } from "./scripts/plugins/arrayPlugins";
import { Person } from "./scripts/person/person";
import { BoundingBox } from "./scripts/bounding-box/bounding-box";
import { OrientationProvider } from "./scripts/orientation-provider/orientation-provider";
import { BoundingBoxStorage } from "./scripts/perspective-reverse/bounding-box-storage";
import { guessParams } from "./scripts/perspective-reverse/guess-params";
import { transformToWorldCoordinates } from "./scripts/perspective-reverse/perspective-reverse";
import { showBoundingBoxes } from "./scripts/person-detection/show-bounding-boxes";
import { YoloPersonDetector } from "./scripts/person-detection/yolo-person-detector";
import { PerspectiveParams } from "./scripts/perspective-reverse/perspective-params";
import { vec2 } from "gl-matrix";

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

applyArrayPlugins();

const demoSwitch = document.querySelector("#switch") as HTMLInputElement;
const video: HTMLVideoElement = document.getElementById(
  "output-video"
) as HTMLVideoElement;

const loadInput = async (ui: UI) => {
  if (!demoSwitch.checked) {
    try {
      await ui.giveVideoStream(await openCameraStream());
      return;
    } catch {
      // user has declined permission
    }
  }

  await ui.giveVideoStream(await openVideoStream(getRandomVideoUrl()));
};

const debugMode = window.location.search.includes("debug");

const ui: UI = new UI(() => loadInput(ui));
let people: Array<Person> = new Array<Person>();
const boundingBoxStorage = new BoundingBoxStorage();
const orientationProvider = new OrientationProvider();
const personDetector = new YoloPersonDetector();

const main = async () => {
  updateStatistics(ui, people);

  await loadInput(ui);
  demoSwitch.onchange = () => loadInput(ui);
  await personDetector.loadModel();

  requestAnimationFrame((v) => void updateBoundingBoxes(v));
  requestAnimationFrame(updateUI);
};

let previousTime = performance.now();
const updateBoundingBoxes = async (currentTime: number) => {
  const deltaTime = (currentTime - previousTime) / 1000;
  if (deltaTime < 0.125) {
    requestAnimationFrame((v) => void updateBoundingBoxes(v));
    return;
  }
  previousTime = currentTime;

  const boxes = await personDetector.getBoundingBoxes(video);
  ui.hideLoadingIcon();
  processBoundingBoxes(boxes);

  requestAnimationFrame((v) => void updateBoundingBoxes(v));
};

const getClosestPairs = (
  group1: Array<BoundingBox>,
  group2: Array<BoundingBox>
): {
  box: BoundingBox;
  closest: BoundingBox;
  distance: number;
} =>
  group1
    .map((b) => ({
      box: b,
      closest: group2.sort((b1, b2) => b.distance(b1) - b.distance(b2))[0],
    }))
    .map(({ box, closest }) => ({
      box,
      closest,
      distance: box.distance(closest),
    }))
    .sort((p1, p2) => p1.distance - p2.distance)[0];

let boundingBoxes: Array<BoundingBox> = [];
let perspectiveParams: PerspectiveParams = new PerspectiveParams();
const processBoundingBoxes = (detectedBoundingBoxes: BoundingBox[]) => {
  detectedBoundingBoxes.forEach((box) =>
    boundingBoxStorage.registerBoundingBox(box)
  );

  perspectiveParams = guessParams(boundingBoxStorage, orientationProvider);

  boundingBoxes = boundingBoxes.filter((b) => b.timeSinceLastMerge < 2);

  const remainingBoundingBoxes = new Set(boundingBoxes);
  const remainingDetectedBoundingBoxes = new Set(detectedBoundingBoxes);

  while (
    remainingBoundingBoxes.size > 0 &&
    remainingDetectedBoundingBoxes.size > 0
  ) {
    const closestPair = getClosestPairs(
      Array.from(remainingBoundingBoxes),
      Array.from(remainingDetectedBoundingBoxes)
    );

    if (closestPair.distance > 0.4) {
      break;
    }

    remainingBoundingBoxes.delete(closestPair.box);
    remainingDetectedBoundingBoxes.delete(closestPair.closest);
    closestPair.box.merge(closestPair.closest);
  }

  for (const detected of remainingDetectedBoundingBoxes) {
    boundingBoxes.push(detected);
  }

  people = boundingBoxes.map((box) => new Person(box));
};

let previousTimeUI = performance.now();
let timeSinceStatsUpdate = 0;
const updateUI = (currentTime: number) => {
  const deltaTime = (currentTime - previousTimeUI) / 1000;
  previousTimeUI = currentTime;

  boundingBoxes.forEach((b) => b.update(deltaTime));

  people.forEach((person) => {
    person.worldPosition = transformToWorldCoordinates(
      person.boundingBox.bottom,
      perspectiveParams
    );
  });

  people.forEach((person) => {
    person.calculateCvm(people);
  });

  if (debugMode) {
    showBoundingBoxes(people);
  }

  if (ui.hasActiveStream) {
    ui.setCvmValuesForGradient(
      people.map((p) => {
        const translated = vec2.multiply(
          vec2.create(),
          p.boundingBox.centerInUICoordinates,
          ui.outputSize
        );
        return {
          value: 1 - p.cvm!,
          center: translated,
        };
      })
    );
  } else {
    ui.clearGradients();
  }

  if ((timeSinceStatsUpdate += deltaTime) > 1) {
    updateStatistics(ui, people);
    timeSinceStatsUpdate = 0;
  }

  requestAnimationFrame(updateUI);
};

void main();
