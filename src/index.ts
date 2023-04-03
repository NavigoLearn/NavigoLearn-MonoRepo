import express from 'express';
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "child_process";
const env = process.env.NODE_ENV || "dev";
const isProd = env === "prod";

// setup prefix to stdout and stderr
const prefix = '[Navigo] '
const stdoutWrite = process.stdout.write;
// @ts-ignore
process.stdout.write = function (
  chunk: string | Buffer,
  encoding: BufferEncoding | undefined,
  callback?: () => void): boolean {
  const modifiedChunk = Buffer.from(prefix + chunk.toString(), 'utf-8');
  return stdoutWrite.call(process.stdout, modifiedChunk, encoding, callback);
};

const stderrWrite = process.stderr.write;
// @ts-ignore
process.stderr.write = function (
  chunk: string | Buffer,
  encoding: BufferEncoding | undefined,
  callback?: () => void): boolean {
  const modifiedChunk = Buffer.from(prefix + chunk.toString(), 'utf-8');
  return stderrWrite.call(process.stderr, modifiedChunk, encoding, callback);
}

const app = express();

app.use("/",
  createProxyMiddleware({
    target: "http://localhost:3000", // The URL for the front-end app
    changeOrigin: true,

    router: {
      // when / api goes to http://localhost:3001/api
      "/api": "http://localhost:3001/api",
    },
  })
);

app.listen(env === "prod" ? 80 : 8080, () => {
  console.log("Server listening on port " + (isProd ? 80 : 8080));
});

// spawn child process in frontend folder
const frontendPrefix = '[Frontend] '
const frontend = spawn("npm", ["run", isProd ? "start" : "dev"], {
  cwd: "./frontend",
  stdio: ["inherit", "pipe", "pipe"],
});
const frontendLog = (data: any) => {
  console.log(frontendPrefix + data.toString());
};
frontend.stdout.on("data", frontendLog);
frontend.stderr.on("data", frontendLog);

// spawn child process in api folder
const apiPrefix = '[API] '
const api = spawn("npm", ["run", isProd ? "start" : "dev"], {
  cwd: "./api",
  stdio: ["inherit", "pipe", "pipe"],
});
const apiLog = (data: any) => {
  console.log(apiPrefix + data.toString());
}
api.stdout.on("data", apiLog);
api.stderr.on("data", apiLog);