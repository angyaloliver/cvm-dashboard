import { BoundingBoxStorage } from './bounding-box-storage';
import { PerspectiveParams } from './perspective-params';
import {
  transformToWorldCoordinates,
  transformToWorldCoordinatesFixedZ,
} from './perspective-reverse';
import { vec2 } from 'gl-matrix';
import { OrientationProvider } from '../orientation-provider/orientation-provider';

export function calculateError(
  storage: BoundingBoxStorage,
  params: PerspectiveParams
): number {
  let err = 0;
  for (const box of storage.getBoxes()) {
    const bottom = transformToWorldCoordinates(box.bottom, params);
    const top = transformToWorldCoordinatesFixedZ(
      vec2.fromValues(box.bottom.x, box.bottom.y + box.height),
      params,
      bottom.z
    );
    const heightDiff = top.y - 1.7; /* - bottom.y */
    err += heightDiff * heightDiff;
  }
  return err;
}

const guessHeightAndFov = (angle: number, callback : (par : PerspectiveParams) => void) => {
  for (let cameraHeight = 3; cameraHeight <= 10.0; cameraHeight *= 1.05) {
    // ~80 iterations
    for (let fov = 0.6; fov < 1.2; fov += 0.1) {
      // 6 iterations
      const par = new PerspectiveParams(cameraHeight, angle, fov);
      callback(par);
    }
  }
}

/**
 * Guess perspective parameters based on data on bounding boxes and others
 */
export const guessParams = (storage: BoundingBoxStorage, orientationProvider? : OrientationProvider): PerspectiveParams => {
  // X coordinates are not important
  let best: null | PerspectiveParams = null;
  let bestErr = 0;
  const orientation = orientationProvider?.getOrientation() || null;

  const iter = (par : PerspectiveParams) => {
    const err = calculateError(storage, par);
    if (best === null || err < bestErr) {
      best = par;
      bestErr = err;
    }
  }

  if (orientation !== null) {
    guessHeightAndFov(orientation, iter);
  }
  for (
    let angle = Math.PI / 8;
    angle >= -Math.PI / 4;
    angle -= Math.PI / 200
  ) {
    // ~80 iterations
    guessHeightAndFov(angle, iter);
  }
  if(best === null) {
    // will not happen,  but typescript does not know
    return new PerspectiveParams();
  }
  return best;
};
