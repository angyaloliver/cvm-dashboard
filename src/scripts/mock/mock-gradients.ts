import { vec2 } from "gl-matrix";
import { OverlayGradients } from "../ui/overlay-gradients";
import { UI } from "../ui/ui";

export const mockGradients = (ui: UI) => {
  const gradients: Array<{
    center: vec2;
    velocity: number;
    radius: number;
    cvm: number;
  }> = [];

  for (let i = 0; i < OverlayGradients.gradientCount; i++) {
    gradients.push({
      center: vec2.fromValues(Math.random(), Math.random()),
      velocity: (Math.random() - 0.5) * 1,
      radius: Math.random() * 400,
      cvm: Math.round(Math.random()),
    });
  }

  const animate = (current: number) => {
    ui.setCvmValuesForGradient(
      gradients.map((g) => {
        const rotated = vec2.rotate(
          vec2.create(),
          vec2.fromValues(g.radius, 0),
          vec2.create(),
          (g.velocity * current) / 1000
        );

        const translated = vec2.add(
          rotated,
          rotated,
          vec2.multiply(vec2.create(), g.center, ui.outputSize)
        );

        return {
          value: g.cvm,
          center: translated,
        };
      })
    );

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};
