import { PersonDetector } from "./scripts/person-detection/person-detector";
import { WorkerResponse } from "./scripts/worker-message/worker-response";
import { WorkerRequest } from "./scripts/worker-message/worker-request";
import { YoloPersonDetector } from "./scripts/person-detection/yolo-person-detector";

const personDetector: PersonDetector = new YoloPersonDetector();

onmessage = async (e: MessageEvent<WorkerRequest>) => {
  switch (e.data.type) {
    case "loadModel": {
      await personDetector.loadModel();

      postMessage(new WorkerResponse("modelLoaded"));
      break;
    }

    case "getBoundingBoxes": {
      const boxes = await personDetector.getBoundingBoxes(
        e.data.data as ImageData
      );

      postMessage(new WorkerResponse("boundingBoxes", boxes));
      break;
    }

    default: {
      console.warn("Unknown message sent to worker");
      break;
    }
  }
};
