import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn, spawnSync } from "child_process";
import path from "path";
import * as os from "os";

let npm = os.platform.toString() === "win32" ? "npm.cmd" : "npm";
const env = process.env.NODE_ENV || "dev";
const isProd = env === "prod";

console.log("Starting Navigo in " + env + " mode");
// installing dependencies
console.log("Installing dependencies...");
const npmInstall = spawnSync(npm, ["install"], {
  cwd: path.join(__dirname, "frontend"),
  stdio: "inherit",
});

if (npmInstall.status !== 0) {
  console.error("Failed to install frontend dependencies");
  process.exit(1);
}
const npmInstall2 = spawnSync(npm, ["install"], {
  cwd: path.join(__dirname, "api"),
  stdio: "inherit",
});
if (npmInstall2.status !== 0) {
  console.error("Failed to install api dependencies");
  process.exit(1);
}

// setup prefix to stdout and stderr
const globalPrefix = "[Navigo] ";
const stdoutWrite = process.stdout.write;
// @ts-ignore
process.stdout.write = function (
  chunk: string | Buffer,
  encoding: BufferEncoding | undefined,
  callback?: () => void
): boolean {
  const modifiedChunk = Buffer.from(globalPrefix + chunk.toString(), "utf-8");
  return stdoutWrite.call(process.stdout, modifiedChunk, encoding, callback);
};

const stderrWrite = process.stderr.write;
// @ts-ignore
process.stderr.write = function (
  chunk: string | Buffer,
  encoding: BufferEncoding | undefined,
  callback?: () => void
): boolean {
  const modifiedChunk = Buffer.from(globalPrefix + chunk.toString(), "utf-8");
  return stderrWrite.call(process.stderr, modifiedChunk, encoding, callback);
};

const app = express();

app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:3000", // The URL for the front-end app
    changeOrigin: true,

    router: {
      // when / api goes to http://localhost:3001/api
      "/api/": "http://localhost:3001/",
    },
  })
);

app.listen(8080, '0.0.0.0', () => {
  console.log("Server listening on port " + 8080);
});

// logger
const logger = (prefix: string, data: any) => {
  // check if data toString is empty or new line
  data = data.toString().trim();
  // replace new line with new line + prefix
  data = data.replaceAll(
    "\n",
    `\n${Array(prefix.length + globalPrefix.length)
      .fill(" ")
      .join("")}`
  );

  if (data === "") return;
  console.log(prefix + data);
};

// spawn a child process in frontend folder
const frontend = spawn(npm, ["run", isProd ? "start" : "dev"], {
  cwd: path.join(__dirname, "frontend"),
  stdio: ["inherit", "pipe", "pipe"],
});
frontend.stdout.on("data", (data) => logger("[Frontend] ", data));
frontend.stderr.on("data", (data) => logger("[Frontend] ", data));

// spawn child process in api folder
const api = spawn(npm, ["run", isProd ? "start" : "dev"], {
  cwd: path.join(__dirname, "api"),
  stdio: ["inherit", "pipe", "pipe"],
});
api.stdout.on("data", (data) => logger("[API] ", data));
api.stderr.on("data", (data) => logger("[API] ", data));

// kill child processes on exit
process.on("exit", () => {
  frontend.kill();
  api.kill();
});
