import { PerspectiveParams } from '../../src/scripts/perspective-reverse/perspective-params';
import {
  transformToWorldCoordinates,
  transformToWorldCoordinatesFixedZ,
} from '../../src/scripts/perspective-reverse/perspective-reverse';
import { vec2 } from 'gl-matrix';
import { applyArrayPlugins } from '../../src/scripts/plugins/arrayPlugins';

applyArrayPlugins();

describe('perspective', function () {
  it('lookingDownScreenCenter', function () {
    const result = transformToWorldCoordinates(
      vec2.fromValues(0, 0),
      new PerspectiveParams(2, -Math.PI / 2, 1.0)
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(0);
  });
  it('lookingDownScreenRight', function () {
    const result = transformToWorldCoordinates(
      vec2.fromValues(1, 0),
      new PerspectiveParams(2, -Math.PI / 2, 1.0)
    );
    expect(result.x).toBeCloseTo(2);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(0);
  });
  it('lookingDownScreenBottom', function () {
    const result = transformToWorldCoordinates(
      vec2.fromValues(0, -1),
      new PerspectiveParams(2, -Math.PI / 2, 1.0)
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(-2); // behind the camera
  });
  it('lookingDownScreenCenterFov', function () {
    const result = transformToWorldCoordinates(
      vec2.fromValues(0, 0),
      new PerspectiveParams(2, -Math.PI / 2, 0.7)
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(0);
  });
  it('lookingDownScreenRightFov', function () {
    const result = transformToWorldCoordinates(
      vec2.fromValues(1, 0),
      new PerspectiveParams(2, -Math.PI / 2, 0.7)
    );
    expect(result.x).toBeCloseTo(2 * 0.7);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(0);
  });
  it('lookingDownScreenBottomFov', function () {
    const result = transformToWorldCoordinates(
      vec2.fromValues(0, -1),
      new PerspectiveParams(2, -Math.PI / 2, 0.7)
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(-2 * 0.7); // behind the camera
  });
  it('lookingStraightScreenBottom', function () {
    const result = transformToWorldCoordinates(
      vec2.fromValues(0, -1),
      new PerspectiveParams(2, 0, 1.0)
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(2);
  });
  it('lookingStraightScreenRightBottom', function () {
    const result = transformToWorldCoordinates(
      vec2.fromValues(1, -1),
      new PerspectiveParams(2, 0, 1.0)
    );
    expect(result.x).toBeCloseTo(2);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(2);
  });
  it('lookingDiagonallyDownScreenCenter', function () {
    const result = transformToWorldCoordinates(
      vec2.fromValues(0, 0),
      new PerspectiveParams(2, -Math.PI / 4, 1.0)
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(2);
  });
  it('lookingStraightScreenCenterFixedZ', function () {
    const result = transformToWorldCoordinatesFixedZ(
      vec2.fromValues(0, 0),
      new PerspectiveParams(3, 0.0, 1.0),
      /* z = */ 1
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(3);
    expect(result.z).toBeCloseTo(1);
  });
  it('lookingStraightScreenCenterFixedFarZ', function () {
    const result = transformToWorldCoordinatesFixedZ(
      vec2.fromValues(0, 0),
      new PerspectiveParams(3, 0.0, 1.0),
      /* z = */ 100
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(3);
    expect(result.z).toBeCloseTo(100);
  });
  it('lookingStraightScreenBottomFixedZ', function () {
    const result = transformToWorldCoordinatesFixedZ(
      vec2.fromValues(0, -1),
      new PerspectiveParams(3, 0.0, 1.0),
      /* z = */ 1
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(2);
    expect(result.z).toBeCloseTo(1);
  });
  it('lookingStraightScreenBottomFovFixedZ', function () {
    const result = transformToWorldCoordinatesFixedZ(
      vec2.fromValues(0, -1),
      new PerspectiveParams(3, 0.0, 0.7),
      /* z = */ 1
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(3 - 0.7);
    expect(result.z).toBeCloseTo(1);
  });
  it('lookingDownScreenTopFixedZ', function () {
    const result = transformToWorldCoordinatesFixedZ(
      vec2.fromValues(0, 1),
      new PerspectiveParams(3, -Math.PI / 2, 1.0),
      /* z = */ 1
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(2);
    expect(result.z).toBeCloseTo(1);
  });
  it('lookingDownScreenTopFixedZ=2', function () {
    const result = transformToWorldCoordinatesFixedZ(
      vec2.fromValues(0, 1),
      new PerspectiveParams(3, -Math.PI / 2, 1.0),
      /* z = */ 2
    );
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(1);
    expect(result.z).toBeCloseTo(2);
  });
});
