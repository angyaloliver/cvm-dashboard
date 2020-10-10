import { watch } from "chokidar";
import { readFile, appendFile } from "fs";
import { resolve } from "path";
import { build } from "./build";

const watchFiles = () => {
  console.log("Watching files... \n");
  watch("src/", { usePolling: true }).on("change", () => {
    console.log("File changed. Rebuilding...");
    build().catch((err) => console.log(err));
  });
};

watchFiles();

const script = `<script>
    document.write(
      '<script src="http://' +
        (location.host || "localhost").split(":")[0] +
        ':35729/livereload.js?snipver=1"></' +
        "script>"
    );
  </script>`;
const file = resolve(__dirname, "./src/index.html");
readFile(file, "utf8", (err: any, data: string) => {
  if (err) {
    return console.log(err);
  }
  if (!data.toString().includes(script)) {
    appendFile(file, script, (err: any) => {
      if (err) return console.log(err);
    });
  }
});
const livereload = require("livereload");
const server = livereload.createServer({
  usePolling: true,
});
server.watch("./dist");
