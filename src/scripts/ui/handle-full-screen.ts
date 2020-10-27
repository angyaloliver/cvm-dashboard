export const handleFullScreen = (
  minimizeButton: HTMLElement,
  maximizeButton: HTMLElement,
  targetElement: HTMLElement
): void => {
  if (!document.fullscreenEnabled) {
    minimizeButton.style.visibility = "hidden";
    maximizeButton.style.visibility = "hidden";
    return;
  }

  let isInFullScreen = document.fullscreenElement !== null;

  const showButtons = () => {
    minimizeButton.style.visibility = isInFullScreen ? "visible" : "hidden";
    maximizeButton.style.visibility = isInFullScreen ? "hidden" : "visible";
  };

  showButtons();

  maximizeButton.addEventListener(
    "click",
    () => void targetElement.requestFullscreen()
  );
  minimizeButton.addEventListener(
    "click",
    () => void document.exitFullscreen()
  );

  document.addEventListener("fullscreenchange", () => {
    isInFullScreen = !isInFullScreen;
    showButtons();
  });
};
