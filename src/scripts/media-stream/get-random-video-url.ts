const videoPaths = [
  "/static/videos/crowded-street.mp4",
  "/static/videos/group-gathering.mp4",
  "/static/videos/people-walking-distanced.mp4",
  "/static/videos/person-walking-alone.mp4",
  "/static/videos/person-walking-past-group.mp4",
  "/static/videos/person-walking-past-pair.mp4",
  "/static/videos/walking-in-groups.mp4",
  "/static/videos/walking-in-pair.mp4",
];

export const getRandomVideoUrl = (): string => {
  return videoPaths[Math.floor(Math.random() * videoPaths.length)];
}