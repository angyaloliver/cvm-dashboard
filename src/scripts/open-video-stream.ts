export const openVideoStream = (url: string): MediaStream => {
  const video = document.createElement("video");
  video.src = url;
  void video.play();
  return (video as any).captureStream() as MediaStream;
};
