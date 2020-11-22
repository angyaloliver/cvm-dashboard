import { openVideoStream } from "./scripts/media-stream/open-video-stream";
import { openCameraStream } from "./scripts/media-stream/open-camera-stream";
import { getRandomVideoUrl } from "./scripts/media-stream/get-random-video-url";
import { UI } from "./scripts/ui/ui";
import { mockPeople } from "./scripts/mock/mock-people";
import { updateStatistics } from "./scripts/statistics/update-statistics";
import { applyArrayPlugins } from "./scripts/plugins/arrayPlugins";
import { Person } from "./scripts/person/person";
import { drawGradients } from "./scripts/ui/draw-gradients";
import { PersonDetector } from "./scripts/person-detection/person-detector";

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

const main = async () => {
  applyArrayPlugins();
  const ui: UI = new UI(() => loadInput(ui));
  const people: Array<Person> = new Array<Person>();

  mockPeople(people);
  updateStatistics(ui, people);
  drawGradients(ui, people);

  await loadInput(ui);

  const personDetector = new PersonDetector("output-video");

  await personDetector.loadModel();

  const parent = document.querySelector(".video-container");

  while (true) {
    const boundingBoxes = await personDetector.getBoundingBoxes();

    document.querySelectorAll(".box").forEach((elem) => {
      elem.remove();
    });

    boundingBoxes.forEach((box) => {
      const elem = document.createElement("div");
      elem.classList.add("box");

      const parentW = parent!.clientWidth;
      const parentH = parent!.clientHeight;

      const x = (box.bottom.x * parentW) / 2 + parentW / 2;
      const y = (box.bottom.y * parentH) / 2 + parentH / 2;
      const height = box.height * parentH;

      elem.style.left = `${Math.round(x)}px`;
      elem.style.bottom = `${Math.round(y)}px`;
      elem.style.height = `${Math.round(height)}px`;

      parent?.appendChild(elem);
    });
    console.log(boundingBoxes);
  }
};

void main();
