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
import { showBoundingBoxes } from "./scripts/person-detection/show-bounding-boxes";
import { YoloPersonDetector } from "./scripts/person-detection/yolo-person-detector";

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

const demoSwitch = document.querySelector("#switch") as HTMLInputElement;

const video: HTMLVideoElement = document.getElementById(
  "output-video"
) as HTMLVideoElement;

const fpsElement = document.getElementById("fps") as HTMLElement;

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
const people: Array<Person> = new Array<Person>();
const boundingBoxStorage = new BoundingBoxStorage();
const orientationProvider = new OrientationProvider();
const personDetector = new YoloPersonDetector();

const main = async () => {
  applyArrayPlugins();

  updateStatistics(ui, people);
  drawGradients(ui, people);

  await loadInput(ui);
  demoSwitch.onchange = () => loadInput(ui);

  await personDetector.loadModel();

  if (debugMode) fpsElement.style.display = "block";

  requestAnimationFrame(() => void update());
};

const update = async () => {
  const t0 = performance.now();

  const boxes = await personDetector.getBoundingBoxes(video);
  processBoundingBoxes(boxes);

  const t1 = performance.now();

  if (debugMode) fpsElement.innerText = `${(1000 / (t1 - t0)).toFixed(0)} fps`;

  requestAnimationFrame(() => void update());
};

let previousBoundingBoxes: Array<BoundingBox> | null = null;

const processBoundingBoxes = (boxes: BoundingBox[]) => {
  boxes.forEach((box) => boundingBoxStorage.registerBoundingBox(box));

  const perspectiveParams = guessParams(
    boundingBoxStorage,
    orientationProvider
  );

  if (previousBoundingBoxes !== null) {
    previousBoundingBoxes = previousBoundingBoxes.filter(
      (b) => b.timeToLive > 0 && !b.isCloseToEdge()
    );

    for (const prevBox of previousBoundingBoxes) {
      if (!boxes.some((b) => prevBox.isCloseTo(b))) {
        prevBox.timeToLive -= 1;
        boxes.push(prevBox);
      }
    }
  }

  previousBoundingBoxes = boxes;

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

  if (debugMode) showBoundingBoxes(people);
};

void main();
