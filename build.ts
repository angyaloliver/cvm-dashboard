import { startService } from "esbuild";
import { copyFile } from "fs";

const copyToDist = () => {
  copyFile(`src/index.html`, `dist/index.html`, (err) => {
    if (err) throw err;
  });
};

export const build = async (): Promise<void> => {
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
    console.log(`ERROR: ${e as string}`);
  } finally {
    service.stop();
  }
};

build().catch((err) => console.log(err));
