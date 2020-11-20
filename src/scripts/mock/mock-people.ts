import { vec2, vec3 } from 'gl-matrix';
import { BoundingBox } from '../bounding-box/bounding-box';
import { Person } from '../person/person';
import { UI } from '../ui/ui';

export const mockPeople = (ui: UI) => {
  const person1 = new Person(
    new BoundingBox(vec2.fromValues(0.8, 0.8), 1),
    vec3.fromValues(1.6, 0.8, 0.5)
  );
  const person2 = new Person(
    new BoundingBox(vec2.fromValues(0.8, 0.2), 1),
    vec3.fromValues(0.8, 0.2, 0.5)
  );
  const person3 = new Person(
    new BoundingBox(vec2.fromValues(0.2, 0.5), 1),
    vec3.fromValues(0.2, 0.5, 0.5)
  );

  person1.addNeighbor(person2);
  person1.addNeighbor(person3);
  person2.addNeighbor(person1);
  person2.addNeighbor(person3);
  person3.addNeighbor(person1);
  person3.addNeighbor(person2);

  console.log('first person');
  person1.calculateCvm();
  console.log('second person');
  person2.calculateCvm();
  console.log('third person');
  person3.calculateCvm();

  const people = new Array<Person>(person1, person2, person3);

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
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};
