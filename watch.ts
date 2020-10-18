import { watch } from "chokidar";
import { readFile, writeFileSync } from "fs";
import { resolve } from "path";
import { build } from "./build";

const watchFiles = () => {
  console.log("Watching files... \n");
  watch("src/", { usePolling: true }).on("change", () => {
    console.log("File changed. Rebuilding...");
    build()
      .then(() => appendLiveReload())
      .catch((err) => console.log(err));
  });
};

const appendLiveReload = () => {
  const script = `<script>
    document.write(
      '<script src="http://' +
        (location.host || "localhost").split(":")[0] +
        ':35729/livereload.js?snipver=1"></' +
        "script>"
    );
  </script>`;
  const file = resolve(__dirname, "./dist/index.html");
  readFile(file, "utf8", (err: any, data: string) => {
    if (err) return console.log(err);
    const regex = `href="styles.css?v=`;
    const replaceString = `href="styles.css?v=` + Math.random().toString();
    data = data.concat(script);
    data = data.replace(regex, replaceString);
    try {
      writeFileSync("./dist/index.html", data);
    } catch (err: any) {
      console.log(err);
    }
  });
};

watchFiles();
appendLiveReload();

const livereload = require("livereload");
const server = livereload.createServer({
  usePolling: true,
});
server.watch("./dist");
