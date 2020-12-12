import { BoundingBox } from "../bounding-box/bounding-box";
import { PersonDetector } from "./person-detector";
import yolo from "../tfjs-yolo/yolo";

interface YoloBox {
  top: number;
  left: number;
  bottom: number;
  right: number;
  height: number;
  width: number;
  score: number;
  class: string;
}

export class YoloPersonDetector implements PersonDetector {
  private model: any;

  async loadModel(): Promise<void> {
    this.model = await yolo.v3tiny("/static/models/v3tiny/model.json");
  }

  async getBoundingBoxes(imageData: ImageData): Promise<BoundingBox[]> {
    const yoloBoxes: YoloBox[] = await this.model.predict(imageData, {
      scoreThreshold: 0.2,
    });

    const boxes = yoloBoxes
      .filter((yoloBox) => yoloBox.class === "person")
      .map((yoloBox) => {
        let x = yoloBox.left + yoloBox.width / 2;
        let y = yoloBox.bottom;
        let height = yoloBox.height;

        x = (x - imageData.width / 2) / (imageData.width / 2);
        y = (imageData.height / 2 - y) / (imageData.height / 2);
        height /= imageData.height;

        return new BoundingBox([x, y], height);
      });

    return boxes;
  }
}
