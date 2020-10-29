import { PerspectiveParams } from "./perspective-params";

// 0,0,0 is the place of the cameraman's foot
// 1,y,0 is next to the cameraman
// 0,y,1 is in front of it
export class vec3 {
    constructor (
        public x : number,
        public y : number,
        public z : number
    ){}
}

// x=0,y=0 is the middle of screen
// -1=<y<=1; y=1 is the top of screen;
// x=1,y=1 is the same distance on screen from axes x=0 and y=0
// y represents the bottom of the bounding box
// all three in camera view space
export class vec2 {
    constructor (
        public x : number,
        public y : number
    ){}
}

/**
 * Computes world coordinates from the screen coordinates based on perspective parameters.
 * Asserts that the point is located on the ground in the world.
 */
export const transformToWorldCoordinates = (screen: vec2, pers : PerspectiveParams): vec3 => {
    const cphi = Math.cos(pers.angle);
    const sphi = Math.sin(pers.angle);
    // screen coordinates multiplied by fov
    const fov = pers.fov;
    const sx = fov * screen.x;
    const sy = fov * screen.y;
    const t = -(pers.height /* - ye */) / (sy * cphi + sphi);
    const ze = t*(cphi - sy*sphi);
    const xe = t*sx;
    // const ye = pers.height + t*(sphi + sy * cphi);
    return new vec3(xe,/* ye */ 0,ze);
}

/**
 * Computes world coordinates from the screen coordinates based on perspective parameters.
 * Asserts that the point is located in a fixed distance from the camera (more precisely the Z component).
 */
export const transformToWorldCoordinatesFixedZ = (screen: vec2, pers : PerspectiveParams, ze : number): vec3 => {
    const cphi = Math.cos(pers.angle);
    const sphi = Math.sin(pers.angle);
    // screen coordinates multiplied by fov
    const fov = pers.fov;
    const sx = fov * screen.x;
    const sy = fov * screen.y;
    const t = ze / (cphi - sy*sphi);
    const xe = t*sx;
    const ye = pers.height + t*(sphi + sy * cphi);
    // const ze2 = t*(cphi - sy*sphi);
    return new vec3(xe,ye,ze);
}