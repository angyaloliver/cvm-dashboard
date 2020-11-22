import { BoundingBoxStorage } from './bounding-box-storage';
import { PerspectiveParams } from './perspective-params';
import {
  transformToWorldCoordinates,
  transformToWorldCoordinatesFixedZ,
} from './perspective-reverse';
import { vec2 } from 'gl-matrix';

let fiiirst = true;
export function calculateError(
  storage: BoundingBoxStorage,
  params: PerspectiveParams
): number {
  let err = 0;
  for (const box of storage.getBoxes()) {
    const bottom = transformToWorldCoordinates(vec2.clone(box.bottom), params);
    const top = transformToWorldCoordinatesFixedZ(
      vec2.fromValues(box.bottom.x, box.bottom.y + box.height),
      params,
      bottom.z
    );
    const height = top.y; /* - bottom.y */
    if (fiiirst) {
      console.log('Height: ', height);
      fiiirst = false;
    }
    err += (height - 1.7) * (height - 1.7);
  }
  return err;
}

/**
 * Guess perspective parameters based on data on bounding boxes and others
 * TODO maybe async is useful?
 */
export const guessParams = (storage: BoundingBoxStorage): PerspectiveParams => {
  // X coordinates are not important
  let best: null | PerspectiveParams = null;
  let bestErr = 0;
  for (let cameraHeight = 3; cameraHeight <= 10.0; cameraHeight *= 1.05) {
    // ~80 iterations
    for (
      let angle = Math.PI / 8;
      angle >= -Math.PI / 4;
      angle -= Math.PI / 200
    ) {
      // ~80 iterations
      for (let fov = 0.6; fov < 1.2; fov += 0.1) {
        // 6 iterations
        const par = new PerspectiveParams(cameraHeight, angle, fov);
        const err = calculateError(storage, par);
        if (best === null || err < bestErr) {
          best = par;
          bestErr = err;
        }
      }
    }
  }
  best = best as PerspectiveParams;
  return best;
};
