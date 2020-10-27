import { formatNumber } from "./format-number";

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
    }
    if (jelenlegi !== undefined) {
      this.jelenlegiElem.innerText = formatNumber(jelenlegi);
    }
    if (tendencia !== undefined) {
      this.tendenciaElem.style.transform = `rotate(${-45 * tendencia}deg)`;
    }
  }
}
