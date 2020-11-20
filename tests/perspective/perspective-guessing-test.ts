import { BoundingBox } from "../../src/scripts/bounding-box/bounding-box";
import { BoundingBoxStorage } from "../../src/scripts/perspective-reverse/bounding-box-storage";
import { calculateError, guessParams } from "../../src/scripts/perspective-reverse/guess-params";
import { PerspectiveParams } from "../../src/scripts/perspective-reverse/perspective-params";
import { vec3 } from "../../src/scripts/perspective-reverse/perspective-reverse";

const createBoundingBox = (pers: PerspectiveParams, manWithHeight: vec3) : BoundingBox => {
    const cphi = Math.cos(pers.angle);
    const sphi = Math.sin(pers.angle);
    const fov = pers.fov;
    const xe = manWithHeight.x;
    const ze = manWithHeight.z;
    const yeFoot = 0;
    const yeHead = manWithHeight.y;

    // we know that:
    //  ye = pers.height + t*(sphi + sy * cphi)
    //  ze = t*(cphi - sy*sphi)
    // ye*sphi = pers.height*sphi + t*(sphi*sphi + sy*cphi*sphi)
    // ze*cphi = t*(cphi*cphi - sy*cphi*sphi)
    // (ye*sphi + ze*cphi) = pers.height*sphi + t
    const tFoot = (yeFoot - pers.height)*sphi + ze*cphi;
    const tHead = (yeHead - pers.height)*sphi + ze*cphi;
    // screen x might be different for feet and head, but that does not concern us...
    const sx = xe / tFoot / fov;
    const syFoot = ((yeFoot - pers.height) / tFoot - sphi) / cphi / fov;
    const syHead = ((yeHead - pers.height) / tHead - sphi) / cphi / fov;
    return new BoundingBox(sx, syFoot, syHead-syFoot);
}

/**
 * Tests whether guessing and related functions work as intended.
 * There are hidden dependencies from the implementations:
 *   1.7 is the height that is guessed by calculateError (and hence, guessParams)
 *   PerspectiveParams needs to be created in a way that guessParams checks the exact parameterset
 *     E.g. height can be 3, 3.15, etc. as of now...
 *    
 */
describe("perspective-guessing", function () {
    it("errorHandCrafted", function() {
        const pers = new PerspectiveParams(3, 0, 1.0);
        const storage = new BoundingBoxStorage();
        storage.registerBoundingBox(new BoundingBox(0, -1, 1.7/3)); // height, not y
        storage.registerBoundingBox(new BoundingBox(0, -0.5, 1.7/6));
        storage.registerBoundingBox(new BoundingBox(0, -1/3, 1.7/9));
        const result = calculateError(storage, pers);
        expect(result).toBeCloseTo(0);
    })
    it("error", function() {
        const pers = new PerspectiveParams(3, Math.PI/8, 0.6);
        const storage = new BoundingBoxStorage();
        storage.registerBoundingBox(createBoundingBox(pers, new vec3(1,1.7,1)));
        storage.registerBoundingBox(createBoundingBox(pers, new vec3(1,1.7,2)));
        storage.registerBoundingBox(createBoundingBox(pers, new vec3(1,1.7,4)));
        const result = calculateError(storage, pers);
        expect(result).toBeCloseTo(0);
    })
    it("guessParams", function() {
        const expectedResult = new PerspectiveParams(3.15, Math.PI/200, 0.7);
        const storage = new BoundingBoxStorage();
        // the guessParams should work as long as the height is 1.7 (that's what "guess" estimates)
        storage.registerBoundingBox(createBoundingBox(expectedResult, new vec3(1,1.7,1)));
        storage.registerBoundingBox(createBoundingBox(expectedResult, new vec3(-1,1.7,2)));
        storage.registerBoundingBox(createBoundingBox(expectedResult, new vec3(0.5,1.7,4)));
        const result = guessParams(storage);
        expect(result.height).toBeCloseTo(expectedResult.height);
        expect(result.fov).toBeCloseTo(expectedResult.fov);
        expect(result.angle).toBeCloseTo(expectedResult.angle);
    })
    it("guessParamsHandCrafted", function() {
        const expectedResult = new PerspectiveParams(3, 0, 1.0);
        const storage = new BoundingBoxStorage();
        storage.registerBoundingBox(new BoundingBox(0, -1, 1.7/3));
        storage.registerBoundingBox(new BoundingBox(0, -0.5, 1.7/6));
        storage.registerBoundingBox(new BoundingBox(0, -1/3, 1.7/9));
        const result = guessParams(storage);
        expect(result.height).toBeCloseTo(expectedResult.height);
        expect(result.fov).toBeCloseTo(expectedResult.fov);
        expect(result.angle).toBeCloseTo(expectedResult.angle);
    })
})