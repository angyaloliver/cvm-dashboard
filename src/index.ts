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
import { PerspectiveParams } from "./scripts/perspective-reverse/perspective-params";
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

const ui: UI = new UI(() => loadInput(ui));
const people: Array<Person> = new Array<Person>();
const boundingBoxStorage = new BoundingBoxStorage();
const orientationProvider = new OrientationProvider();
let perspectiveParams: PerspectiveParams | null = null;

const main = async () => {
  applyArrayPlugins();

  updateStatistics(ui, people);
  drawGradients(ui, people);

  await loadInput(ui);

  const personDetector = new YoloPersonDetector();
  await personDetector.loadModel();

  while (true) {
    const boxes = await personDetector.getBoundingBoxes(video);

    processBoundingBoxes(boxes);
  }
};

const processBoundingBoxes = (boxes: BoundingBox[]) => {
  boxes.forEach((box) => boundingBoxStorage.registerBoundingBox(box));

  if (boundingBoxStorage.getBoxes().length > 16) {
    if (perspectiveParams === null) {
      perspectiveParams = guessParams(boundingBoxStorage, orientationProvider);
      console.log("Perspective parameters calculated");
    }

    const newPeople = boxes.map((box) => new Person(box));
    people.splice(0, people.length, ...newPeople);

    people.forEach((person) => {
      person.wPos = transformToWorldCoordinates(
        person.boundingBox.bottom,
        perspectiveParams!
      );
    });

    people.forEach((person) => {
      person.calculateCvm(people);
    });

    showBoundingBoxes(people);
  }
};

void main();
