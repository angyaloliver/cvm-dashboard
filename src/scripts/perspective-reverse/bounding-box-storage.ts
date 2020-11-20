import { BoundingBox } from '../bounding-box/bounding-box';

// Store bounding boxes for finding out the perspective
export class BoundingBoxStorage {
    private storage : BoundingBox[] = [];

    public registerBoundingBox(a: BoundingBox): void {
        if (this.storage.length < 1000) {
            this.storage.push(a);
        }
    }

    public getBoxes = () : BoundingBox[] => this.storage;
}