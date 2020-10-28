import { openVideoStream } from "./scripts/open-video-stream";
import { openCameraStream } from "./scripts/open-camera-stream";
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
    // Required for video autoplay
    alert("No camera, click ok");
    ui.giveVideoStream(openVideoStream("static/sample1.mp4"));
  }

  giveRandomValues(ui);
  setInterval(() => giveRandomValues(ui), 1000);
};

void main();
