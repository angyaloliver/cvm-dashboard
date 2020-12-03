import * as cpu from "@tensorflow/tfjs-backend-cpu";
import * as webgl from "@tensorflow/tfjs-backend-webgl";
import {
  load,
  ModelConfig,
  ObjectDetection,
} from "@tensorflow-models/coco-ssd";
import { BoundingBox } from "../bounding-box/bounding-box";
import { PersonDetector } from "./person-detector";

console.log("TF CPU Version: ", cpu.version_cpu);
console.log("TF WebGL Version: ", webgl.version_webgl);

export class CocoSsdPersonDetector implements PersonDetector {
  private model: ObjectDetection | null = null;

  async loadModel(): Promise<void> {
    console.log("Loading CocoSSD model...");

    const config: ModelConfig = {
      base: "mobilenet_v2",
    };

    this.model = await load(config);

    console.log("Model loaded");
  }

  async getBoundingBoxes(imageData: ImageData): Promise<BoundingBox[]> {
    try {
      const objects = await this.model?.detect(imageData);

      return (
        objects
          ?.filter((o) => o.class === "person")
          .map((object) => {
            const tfBoundingBox = object.bbox;

            let height = tfBoundingBox[3];
            let x = tfBoundingBox[0] + tfBoundingBox[2] / 2;
            let y = tfBoundingBox[1] + height;

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
