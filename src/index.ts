import { openVideoStream } from "./scripts/media-stream/open-video-stream";
import { openCameraStream } from "./scripts/media-stream/open-camera-stream";
import { getRandomVideoUrl } from "./scripts/media-stream/get-random-video-url";
import { UI } from "./scripts/ui/ui";

let previous = 0.5;
let i = 0;
const giveRandomValues = (ui: UI) => {
  ui.updateOverallStatistics({
    napiAtlag: Math.random(),
    jelenlegi: Math.random(),
    tendencia: Math.random() * 2 - 1,
  });

  const current = Math.min(
    1,
    Math.max(0, previous + (Math.random() - 0.5) / 2)
  );
  ui.addTimeFrame(new Date(2020, 10, 12, 10, i++), current);
  previous = current;
};

const main = async () => {
  const ui = new UI();
  try {
    ui.giveVideoStream(await openCameraStream());
  } catch {
    ui.giveVideoStream(openVideoStream(getRandomVideoUrl()));
  }

  giveRandomValues(ui);
  setInterval(() => giveRandomValues(ui), 1000);
};

void main();
