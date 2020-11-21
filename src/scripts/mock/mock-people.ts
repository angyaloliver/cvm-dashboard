import { vec2 } from 'gl-matrix';
import { BoundingBox } from '../bounding-box/bounding-box';
import { Person } from '../person/person';
import { BoundingBoxStorage } from '../perspective-reverse/bounding-box-storage';
import { guessParams } from '../perspective-reverse/guess-params';
import { transformToWorldCoordinates } from '../perspective-reverse/perspective-reverse';

export const mockPeople = (people: Array<Person>) => {
  const boundingBoxStorage = new BoundingBoxStorage();

  for (let i = 0; i < 8; i++) {
    let boundingBox = null;
    if (i % 2 === 0) {
      boundingBox = new BoundingBox(vec2.fromValues(0.2, i / 8), 1);
    } else {
      boundingBox = new BoundingBox(vec2.fromValues(0.8, i / 8), 1);
    }
    boundingBoxStorage.registerBoundingBox(boundingBox);
    people.push(new Person(boundingBox));
  }

  const perspectiveParams = guessParams(boundingBoxStorage);
  people.forEach((p) => {
    p.wPos = transformToWorldCoordinates(
      p.boundingBox.bottom,
      perspectiveParams
    );
    p.calculateCvm(people);
  });

  const animate = () => {
    people.forEach((p, i) => {
      if (i % 2 === 1) {
        p.moveLeft();
      } else {
        p.moveRight();
      }

      p.wPos = transformToWorldCoordinates(
        p.boundingBox.bottom,
        perspectiveParams
      );
      p.calculateCvm(people);
      // console.log('Bounding box: ', p.boundingBox);
      // console.log('World coordinates: ', p.wPos);
      //console.log('CVM: ', p.cvm);
    });
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
};
