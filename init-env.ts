import { startService } from "esbuild";
import { watch } from "chokidar";
import { copyFile } from "fs";

const copyToDist = () => {
  copyFile(`src/index.html`, `dist/index.html`, (err) => {
    if (err) throw err;
  });
};

const build = async () => {
  const service = await startService();
  try {
    const timerStart = Date.now();
    await service.build({
      color: true,
      entryPoints: ["./src/index.ts", "./src/styles.css"],
      outdir: "./dist",
      minify: true,
      bundle: true,
      logLevel: "error",
      platform: "node",
    });
    const timerEnd = Date.now();
    console.log(`Built in ${timerEnd - timerStart}ms.`);
    copyToDist();
  } catch (e) {
    console.log(`ERROR: ${e}`);
  } finally {
    service.stop();
  }
};

const watchFiles = () => {
  console.log("Watching files... \n");
  watch("src/", { usePolling: true }).on("change", (event, path) => {
    console.log("File changed. Rebuilding...");
    build();
  });
};

watchFiles();
build();

var liveServer = require("live-server");

var params = {
  port: 8080, // Set the server port. Defaults to 8080.
  host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  root: "/workspaces/cvm-dashboard/dist", // Set root directory that's being served. Defaults to cwd.
  open: false, // When false, it won't load your browser by default.
  ignore: "", // comma-separated string for paths to ignore
  file: "", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
  wait: 3, // Waits for all changes, before reloading. Defaults to 0 sec.
  mount: [["/components", "./node_modules"]], // Mount a directory to a route.
  logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
  middleware: [
    function (req, res, next) {
      next();
    },
  ], // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
};
liveServer.start(params);
