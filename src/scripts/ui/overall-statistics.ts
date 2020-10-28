import { formatNumber } from "./format-number";
import { mix } from "./mix";

/**
 * @internal
 */
export class OverallStatistics {
  constructor(
    private readonly napiAtlagElem: HTMLElement,
    private readonly jelenlegiElem: HTMLElement,
    private readonly tendenciaElem: HTMLElement
  ) {}

  /**
   * `tendencia` should be in the range of [-1, 1]
   */
  public updateOverallStatistics({
    napiAtlag,
    jelenlegi,
    tendencia,
  }: {
    napiAtlag?: number;
    jelenlegi?: number;
    tendencia?: number;
  }): void {
    if (napiAtlag !== undefined) {
      this.napiAtlagElem.innerText = formatNumber(napiAtlag);
      this.napiAtlagElem.parentElement!.style.background = this.getBackgroundFromValue(
        napiAtlag
      );
    }

    if (jelenlegi !== undefined) {
      this.jelenlegiElem.innerText = formatNumber(jelenlegi);
      this.jelenlegiElem.parentElement!.style.background = this.getBackgroundFromValue(
        jelenlegi
      );
    }

    if (tendencia !== undefined) {
      this.tendenciaElem.style.transform = `rotate(${-45 * tendencia}deg)`;
      this.tendenciaElem.parentElement!.style.background = this.getBackgroundFromValue(
        tendencia,
        -1,
        1
      );
    }
  }

  private getBackgroundFromValue(value: number, min = 0, max = 1): string {
    const q = (value - min) / (max - min);
    return `rgb(${mix(29, 241, q)}, ${mix(189, 81, q)}, ${mix(230, 94, q)})`;
  }
}
