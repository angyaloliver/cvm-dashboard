import { Person } from "../person/person";

const parent = document.querySelector(".video-container") as HTMLElement;
const videoElement = document.getElementById(
  "output-video"
) as HTMLVideoElement;

export function showBoundingBoxes(people: Person[]) {
  document.querySelectorAll(".box").forEach((elem) => {
    elem.remove();
  });

  people.forEach((person) => {
    const elem = document.createElement("div");
    elem.classList.add("box");

    const parentH = parent.clientHeight;
    const parentW =
      (videoElement.videoWidth / videoElement.videoHeight) * parentH;

    const box = person.boundingBox;

    const x =
      (box.bottom.x * parentW) / 2 +
      parentW / 2 -
      0.5 * (parentW - parent.clientWidth);
    const y = (box.bottom.y * parentH) / 2 + parentH / 2;
    const height = box.height * parentH;

    elem.style.left = `${x}px`;
    elem.style.bottom = `${y}px`;
    elem.style.height = `${height}px`;
    elem.innerText = `(${person.worldPosition.x.toFixed(
      1
    )}, ${person.worldPosition.y.toFixed(1)}, ${person.worldPosition.z.toFixed(
      1
    )}), cvm: ${person.cvm!.toFixed(1)}`;

    parent?.appendChild(elem);
  });
}
