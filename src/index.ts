import { openVideoStream } from './scripts/media-stream/open-video-stream';
import { openCameraStream } from './scripts/media-stream/open-camera-stream';
import { getRandomVideoUrl } from './scripts/media-stream/get-random-video-url';
import { UI } from './scripts/ui/ui';
import { mockStatistics } from './scripts/mock/mock-statistics';
import { mockPeople } from './scripts/mock/mock-people';
import { applyArrayPlugins } from './scripts/plugins/arrayPlugins';

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

  mockStatistics(ui);
  mockPeople(ui);

  await loadInput(ui);
};

void main();
