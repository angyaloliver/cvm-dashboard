export class OrientationProvider {
  private orientation: number | null;
  constructor() {
    this.orientation = null;
    window.addEventListener(
      "deviceorientation",
      (event) => {
        //const alpha    = event.alpha; // this is for ARs
        const beta = event.beta;
        const gamma = event.gamma;
        if (beta == null || gamma == null) {
          return;
        }
        // to support both orientations, the important data might be either beta or gamma

        // if one is closer to 0° or 90°, then choose the other
        const beta2 = Math.abs(Math.min(beta, 90 - beta));
        const gamma2 = Math.abs(Math.min(gamma, 90 - gamma));
        this.orientation = (-Math.PI / 180) * Math.max(beta2, gamma2);
      },
      true
    );
  }

  /**
   * Returns the orientation (yaw) of the phone or null, if it cannot be provided
   */
  getOrientation(): number | null {
    return this.orientation;
  }
}
