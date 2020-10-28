export const openVideoStream = (url: string): MediaStream => {
  const video = document.createElement("video");
  video.src = url;
  video.loop = true;
  video.muted = true;
  void video.play();
  return ("captureStream" in video
    ? (video as any).captureStream()
    : (video as any).mozCaptureStream()) as MediaStream;
};
