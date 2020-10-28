export const openCameraStream = async (): Promise<MediaStream> => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
  } catch {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
    });
  }
};
