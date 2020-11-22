export class PerspectiveParams {
    constructor(
    /** Height of the camera in meters (0 is the ground) */
    public height : number = 2.0,
    /** Angle of the camera from horizontal plane.
     * Positive is up, negative is down (probably angle is negative)
     * Phi in calculations.
     */
    public angle : number = 0,
    /** How many meters are visible in 1 meter distance of the camera.
     To be exact, let's say the camera is looking at a plane perpendicular to the camera's main axis, 1 meter away.
     the fov is the height of the visible portion of the plane.
    */
   public fov : number = 0.7,
    ) {}

}