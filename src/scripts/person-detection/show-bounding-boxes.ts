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

    console.log(person.wPos.x, person.wPos.y, person.wPos.z);

    elem.style.left = `${Math.round(x)}px`;
    elem.style.bottom = `${Math.round(y)}px`;
    elem.style.height = `${Math.round(height)}px`;
    elem.innerHTML = `${person.wPos.x.toFixed(1)}<br>${person.wPos.y.toFixed(
      1
    )}<br>${person.wPos.z.toFixed(1)}<br>${person.cvm.toFixed(1)}`;

    parent?.appendChild(elem);
  });
}
