export const getDemoVideoUrl = (): string =>
  document
    .querySelector("video")!
    .canPlayType('video/m4v; codecs="avc1.4D401E, mp4a.40.2"') === "probably"
    ? "/static/videos/demo.m4v"
    : "/static/videos/demo.webm";
