import { BoundingBox } from "../bounding-box/bounding-box";
import yolo from "tfjs-yolo";

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
export class YoloPersonDetector {
  private model: any;

  async loadModel(): Promise<void> {
    this.model = await yolo.v3tiny("/static/models/v3tiny/model.json");
  }

  async getBoundingBoxes(video: HTMLVideoElement): Promise<BoundingBox[]> {
    const yoloBoxes: YoloBox[] = await this.model.predict(video, {
      scoreThreshold: 0.2,
    });

    const boxes = yoloBoxes
      .filter((yoloBox) => yoloBox.class === "person")
      .map((yoloBox) => {
        let x = yoloBox.left + yoloBox.width / 2;
        let y = yoloBox.bottom;
        let height = yoloBox.height;

        x = (x - video.videoWidth / 2) / (video.videoWidth / 2);
        y = (video.videoHeight / 2 - y) / (video.videoHeight / 2);
        height /= video.videoHeight;

        return new BoundingBox([x, y], height);
      });

    return boxes;
  }
}
