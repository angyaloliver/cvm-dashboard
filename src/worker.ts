import { PersonDetector } from "./scripts/person-detection/person-detector";
import { CocoSsdPersonDetector } from "./scripts/person-detection/cocossd-person-detector";
import { PoseNetPersonDetector } from "./scripts/person-detection/posenet-person-detector";
import { WorkerResponse } from "./scripts/worker-message/worker-response";
import { WorkerRequest } from "./scripts/worker-message/worker-request";

const personDetector: PersonDetector = new CocoSsdPersonDetector();
// const personDetector: PersonDetector = new PoseNetPersonDetector();

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
