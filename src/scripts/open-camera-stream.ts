export const openCameraStream = async (): Promise<MediaStream> =>
  await navigator.mediaDevices.getUserMedia({
    video: true,
  });
