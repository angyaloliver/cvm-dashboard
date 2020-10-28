export const openVideoStream = async (url: string): Promise<MediaStream> => {
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  await video.play();
  return ("captureStream" in video
    ? (video as any).captureStream()
    : (video as any).mozCaptureStream()) as MediaStream;
};
