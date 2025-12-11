import { exec } from "child_process";

function run(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { env: process.env, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      console.log(stdout || "");
      if (stderr) console.error(stderr);
      if (err) {
        console.warn("⚠️ drizzle push returned an error (continuing):", err.message);
        // Do NOT exit non-zero; we want the build to continue and the server to run.
        return resolve(false);
      }
      resolve(true);
    });
  });
}

(async () => {
  console.log("-> Running npx drizzle-kit push (safe) ...");
  await run("npx drizzle-kit push");
  console.log("-> drizzle attempt finished (errors, if any, were logged above). Continuing build.");
})();
