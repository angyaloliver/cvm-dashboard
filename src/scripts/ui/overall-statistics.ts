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
      if (Number.isNaN(napiAtlag)) {
        napiAtlag = 1;
      }
      this.napiAtlagElem.innerText = formatNumber(napiAtlag);
      this.napiAtlagElem.parentElement!.style.background = this.getBackgroundFromValue(
        napiAtlag
      );
    }

    if (jelenlegi !== undefined) {
      if (Number.isNaN(jelenlegi)) {
        jelenlegi = 1;
      }
      this.jelenlegiElem.innerText = formatNumber(jelenlegi);
      this.jelenlegiElem.parentElement!.style.background = this.getBackgroundFromValue(
        jelenlegi
      );
    }

    if (tendencia !== undefined) {
      if (Number.isNaN(tendencia)) {
        tendencia = 0;
      }
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
    return `rgb(${mix(241, 29, q)}, ${mix(81, 189, q)}, ${mix(94, 230, q)})`;
  }
}
