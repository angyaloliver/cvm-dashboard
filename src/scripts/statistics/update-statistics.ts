import { Person } from '../person/person';
import {
  calculateCurrentGlobalCvm,
  calculateDailyAverageCvm,
  calculateTendency,
} from './statistics-calculations';
import { UI } from '../ui/ui';

export const updateStatistics = (ui: UI, people: Array<Person>) => {
  const animate = () => {
    const current = calculateCurrentGlobalCvm(people);
    ui.updateOverallStatistics({
      napiAtlag: calculateDailyAverageCvm(ui.getChartCvmValues()),
      jelenlegi: current,
      tendencia: calculateTendency(ui.getChartCvmValues()),
    });
    ui.addTimeFrame(new Date(), current);
  };

  animate();
  setInterval(() => animate(), 1000);
};
