import { Person } from "../person/person";

export function showBoundingBoxes(people: Person[]) {
  const parent = document.querySelector(".video-container");

  document.querySelectorAll(".box").forEach((elem) => {
    elem.remove();
  });

  people.forEach((person) => {
    const elem = document.createElement("div");
    elem.classList.add("box");

    const parentW = parent!.clientWidth;
    const parentH = parent!.clientHeight;

    const box = person.boundingBox;

    const x = (box.bottom.x * parentW) / 2 + parentW / 2;
    const y = (box.bottom.y * parentH) / 2 + parentH / 2;
    const height = box.height * parentH;

    elem.style.left = `${Math.round(x) - 10}px`;
    elem.style.bottom = `${Math.round(y)}px`;
    elem.style.height = `${Math.round(height)}px`;
    elem.innerHTML = `x: ${person.wPos.x.toFixed(
      1
    )}<br>y: ${person.wPos.y.toFixed(1)}<br>z: ${person.wPos.z.toFixed(
      1
    )}<br>cvm: ${person.cvm.toFixed(1)}<br>ttl: ${box.timeToLive}`;

    parent?.appendChild(elem);
  });
}
