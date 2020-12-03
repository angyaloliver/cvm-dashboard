import * as cpu from "@tensorflow/tfjs-backend-cpu";
import * as webgl from "@tensorflow/tfjs-backend-webgl";
import {
  getBoundingBox,
  load,
  ModelConfig,
  PoseNet,
} from "@tensorflow-models/posenet";
import { BoundingBox } from "../bounding-box/bounding-box";
import { PersonDetector } from "./person-detector";

console.log("TF CPU Version: ", cpu.version_cpu);
console.log("TF WebGL Version: ", webgl.version_webgl);

export class PoseNetPersonDetector implements PersonDetector {
  private readonly VIDEO_WIDTH = 640;
  private readonly VIDEO_HEIGHT = 360;

  private model: PoseNet | null = null;

  async loadModel(): Promise<void> {
    const config: ModelConfig = {
      architecture: "ResNet50",
      outputStride: 16,
      inputResolution: {
        width: this.VIDEO_WIDTH,
        height: this.VIDEO_HEIGHT,
      },
      quantBytes: 2,
    };

    console.log("Loading PoseNet model...");

    this.model = await load(config);

    console.log("Model loaded");
  }

  async getBoundingBoxes(imageData: ImageData): Promise<BoundingBox[]> {
    const config = {
      flipHorizontal: false,
      maxDetections: 10,
      scoreThreshold: 0.3,
    };

    try {
      const poses = await this.model?.estimateMultiplePoses(imageData, config);

      return (
        poses?.map((pose) => {
          const tfBoundingBox = getBoundingBox(pose.keypoints);

          let x =
            tfBoundingBox.minX + (tfBoundingBox.maxX - tfBoundingBox.minX) / 2;
          let y = tfBoundingBox.maxY;
          let height = tfBoundingBox.maxY - tfBoundingBox.minY;

          x = (x - imageData.width / 2) / (imageData.width / 2);
          y = (imageData.height / 2 - y) / (imageData.height / 2);
          height /= imageData.height;

          return new BoundingBox([x, y], height);
        }) || []
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
