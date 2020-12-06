import { BoundingBoxStorage } from "./bounding-box-storage";
import { PerspectiveParams } from "./perspective-params";
import { OrientationProvider } from "../orientation-provider/orientation-provider";
import { BoundingBox } from "../bounding-box/bounding-box";

export const calculateError = (
  storage: BoundingBoxStorage,
  params: PerspectiveParams,
  cphi: number,
  sphi: number
): number =>
  storage.boxes.reduce((error: number, box: BoundingBox) => {
    const sy = params.fov * box.bottom.y;
    const t = -params.height / (sy * cphi + sphi);
    const ze = t * (cphi - sy * sphi);

    const sy2 = params.fov * (box.bottom.y + box.height);
    const t2 = ze / (cphi - sy2 * sphi);
    const ye = params.height + t2 * (sphi + sy2 * cphi);

    const heightDiff = ye - 1.7;
    return error + heightDiff * heightDiff;
  }, 0);

/**
 * Guess perspective parameters based on data on bounding boxes and others
 */
export const guessParams = (
  storage: BoundingBoxStorage,
  orientationProvider?: OrientationProvider
): PerspectiveParams => {
  let best = new PerspectiveParams();
  let bestErr = Number.POSITIVE_INFINITY;

  const orientation = orientationProvider?.getOrientation() || null;

  if (orientation !== null) {
    const cphi = Math.cos(orientation);
    const sphi = Math.sin(orientation);
    // 75 iterations
    for (let cameraHeight = 1.5; cameraHeight <= 10.0; cameraHeight *= 1.05) {
      // 25 iterations
      for (let fov = 0.6; fov < 1.2; fov += 0.1) {
        // 6 iterations
        const par = new PerspectiveParams(cameraHeight, orientation, fov);
        const err = calculateError(storage, par, cphi, sphi);
        if (err < bestErr) {
          best = par;
          bestErr = err;
        }
      }
    }
  }

  for (let angle = -Math.PI / 4; angle <= Math.PI / 8; angle += Math.PI / 100) {
    const cphi = Math.cos(angle);
    const sphi = Math.sin(angle);
    // 75 iterations
    for (let cameraHeight = 1.5; cameraHeight <= 10.0; cameraHeight *= 1.05) {
      // 25 iterations
      for (let fov = 0.6; fov < 1.2; fov += 0.1) {
        // 6 iterations
        const par = new PerspectiveParams(cameraHeight, angle, fov);
        const err = calculateError(storage, par, cphi, sphi);
        if (err < bestErr) {
          best = par;
          bestErr = err;
        }
      }
    }
  }

  return best;
};
