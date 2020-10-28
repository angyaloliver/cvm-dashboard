import { UI } from "../ui/ui";

export const mockStatistics = (ui: UI) => {
  let previous = 0.5;
  let i = 0;
  const animate = () => {
    ui.updateOverallStatistics({
      napiAtlag: Math.random(),
      jelenlegi: Math.random(),
      tendencia: Math.random() * 2 - 1,
    });

    const current = Math.min(
      1,
      Math.max(0, previous + (Math.random() - 0.5) / 2)
    );
    ui.addTimeFrame(new Date(2020, 10, 12, 10, i++), current);
    previous = current;
  };

  animate();
  setInterval(() => animate(), 1000);
};
