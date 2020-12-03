import { startService } from "esbuild";
import { copyFileSync } from "fs";

export const build = async (): Promise<void> => {
  const service = await startService();
  try {
    const timerStart = Date.now();
    await service.build({
      color: true,
      entryPoints: ["./src/index.ts", "./src/worker.ts", "./src/styles.css"],
      outdir: "./dist",
      minify: true,
      bundle: true,
      logLevel: "error",
      platform: "node",
    });
    const timerEnd = Date.now();
    console.log(`Built in ${timerEnd - timerStart}ms.`);
    copyFileSync(`src/index.html`, `dist/index.html`);
  } catch (e) {
    console.log(`ERROR: ${e as string}`);
  } finally {
    service.stop();
  }
};
