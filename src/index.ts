import { openVideoStream } from "./scripts/media-stream/open-video-stream";
import { openCameraStream } from "./scripts/media-stream/open-camera-stream";
import { getRandomVideoUrl } from "./scripts/media-stream/get-random-video-url";
import { UI } from "./scripts/ui/ui";
import { mockStatistics } from "./scripts/mock/mock-statistics";
import { mockGradients } from "./scripts/mock/mock-gradients";
import { PersonDetector } from "./scripts/person-detection/person-detector";

const loadInput = async (ui: UI) => {
  try {
    await ui.giveVideoStream(await openCameraStream());
  } catch {
    await ui.giveVideoStream(await openVideoStream(getRandomVideoUrl()));
  }
};

const main = async () => {
  const ui: UI = new UI(() => loadInput(ui));

  mockStatistics(ui);
  // mockGradients(ui);

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

      const x = (box.getX() * parentW) / 2 + parentW / 2;
      const y = (box.getY() * parentH) / 2 + parentH / 2;
      const height = box.getHeight() * parentH;

      elem.style.left = `${Math.round(x)}px`;
      elem.style.bottom = `${Math.round(y)}px`;
      elem.style.height = `${Math.round(height)}px`;

      parent?.appendChild(elem);
    });
    console.log(boundingBoxes);
  }
};

void main();
