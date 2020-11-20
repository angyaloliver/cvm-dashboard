import { vec2 } from 'gl-matrix';
import { BoundingBox } from '../bounding-box/bounding-box';
import { Person } from '../person/person';
import { BoundingBoxStorage } from '../perspective-reverse/bounding-box-storage';
import { guessParams } from '../perspective-reverse/guess-params';
import { transformToWorldCoordinates } from '../perspective-reverse/perspective-reverse';
import { UI } from '../ui/ui';

export const mockPeople = (ui: UI) => {
  const people = new Array<Person>();
  const boundingBoxStorage = new BoundingBoxStorage();

  for (let i = 0; i < 16; i++) {
    const boundingBox = new BoundingBox(
      vec2.fromValues(Math.random(), Math.random()),
      1
    );
    boundingBoxStorage.registerBoundingBox(boundingBox);
    people.push(new Person(boundingBox));
  }

  const perspectiveParams = guessParams(boundingBoxStorage);
  people.forEach((p) => {
    p.wPos = transformToWorldCoordinates(
      p.boundingBox.center,
      perspectiveParams
    );
    p.calculateCvm(people);
  });

  const updatePeople = () => {
    people.forEach((p, i) => {
      if (i % 2 === 1) {
        p.moveLeft();
      } else {
        p.moveRight();
      }

      p.wPos = transformToWorldCoordinates(
        p.boundingBox.center,
        perspectiveParams
      );
      p.calculateCvm(people);
      // console.log('Bounding box: ', p.boundingBox);
      // console.log('World coordinates: ', p.wPos);
      //console.log('CVM: ', p.cvm);
    });
  };

  const animate = (current: number) => {
    if (ui.hasActiveStream) {
      ui.setCvmValuesForGradient(
        people.map((p) => {
          const rotated = vec2.rotate(
            vec2.create(),
            vec2.fromValues(10, 0),
            vec2.create(),
            0
          );

          const translated = vec2.add(
            rotated,
            rotated,
            vec2.multiply(vec2.create(), p.boundingBox.center, ui.outputSize)
          );
          return {
            value: 1 - p.cvm,
            center: translated,
          };
        })
      );
    } else {
      ui.clearGradients();
    }
    requestAnimationFrame(updatePeople);
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};
