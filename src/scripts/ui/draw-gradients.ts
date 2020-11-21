import { vec2 } from 'gl-matrix';
import { Person } from '../person/person';
import { UI } from './ui';

export const drawGradients = (ui: UI, people: Array<Person>) => {
  const animate = () => {
    if (ui.hasActiveStream) {
      ui.setCvmValuesForGradient(
        people.map((p) => {
          const translated = vec2.multiply(
            vec2.create(),
            p.boundingBox.bottom,
            ui.outputSize
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
