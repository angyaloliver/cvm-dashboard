import * as cpu from "@tensorflow/tfjs-backend-cpu";
import * as webgl from "@tensorflow/tfjs-backend-webgl";
import {
  getBoundingBox,
  load,
  ModelConfig,
  PoseNet,
} from "@tensorflow-models/posenet";
import { BoundingBox } from "../bounding-box/bounding-box";

console.log(cpu.version_cpu);
console.log(webgl.version_webgl);

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PersonDetector {
  private video: HTMLVideoElement;
  private model: PoseNet | null = null;

  constructor(videoElementId: string) {
    const video = document.getElementById(videoElementId) as HTMLVideoElement;
    video.width = VIDEO_WIDTH;
    video.height = VIDEO_HEIGHT;

    this.video = video;
  }

  public async loadModel() {
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

    this.model = await load(config);

    console.log("Model loaded");
  }

  public async getBoundingBoxes(): Promise<BoundingBox[]> {
    const config = {
      flipHorizontal: false,
      maxDetections: 10,
      scoreThreshold: 0.5,
    };

    try {
      const poses = await this.model?.estimateMultiplePoses(this.video, config);

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

          return new BoundingBox(x, y, height);
        }) || []
      );
    } catch (error) {
      await sleep(1000);
      return [];
    }
  }
}
