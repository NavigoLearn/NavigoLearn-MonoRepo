import express, { Request, Response, NextFunction } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import {
  spawn,
  spawnSync,
  SpawnSyncReturns,
} from "child_process";
import path from "path";
import * as os from "os";
import cors from "cors";

let npm: string = os.platform() === "win32" ? "npm.cmd" : "npm";
const NODE_ENV: string = process.env.NODE_ENV || "dev";
const isProd: boolean = NODE_ENV === "prod";

// unified console logging with environment info.
const envConsoleLog = (message: string) => {
  console.log(`Starting Navigo in ${NODE_ENV} mode - ${message}`);
};

const installDependencies = (folderName: string) => {
  envConsoleLog(`installing ${folderName} dependencies...`);
  const currentPath: string = path.join(__dirname, folderName);
  const npmInstall: SpawnSyncReturns<Buffer> = spawnSync(npm, [ "install" ], { cwd: currentPath, stdio: "inherit" });

  if (npmInstall.status !== 0) {
    console.error(`Failed to install ${folderName} dependencies`);
    process.exit(1);
  }
};

const redirectWrite = (processType: any) => {
  const originalWrite = processType.write;
  processType.write = (chunk: string | Buffer, encoding?: BufferEncoding | undefined, callback?: () => void) => {
    const modifiedChunk: Buffer = Buffer.from("[Navigo] " + chunk.toString(), "utf-8");
    return originalWrite.call(processType, modifiedChunk, encoding, callback);
  };
};

const setUpHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "127.0.0.1:8080");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400");
  next();
};

const options: Options = {
  target: "http://localhost:4321",
  changeOrigin: true,
  router: { "/api/": "http://localhost:3001/" },
};

const redirector = (paths: string | string[]) => {
  return createProxyMiddleware(paths, options);
};

const logger = (prefix: string, data: any, isError: boolean = false) => {
  // uppercase prefix and pad it to 10 characters
  prefix = prefix.toUpperCase();
  prefix = prefix.padEnd(10, " ") + " ";

  // convert data to string and trim it
  data = data.toString().trim();
  data = data.replaceAll("\n", `\n${Array(prefix.length + 11).fill(" ").join("")}`);

  if (data !== "") {
    const coloredData = isError ? `\x1b[31m${prefix + data}\x1b[0m` : prefix + data; // `\x1b[31m` starts red color and `\x1b[0m` resets it
    console.log(coloredData);
  }
};

const spawnChild = (folderName: string, npmCMD: string) => {
  const cwd: string = path.join(__dirname, folderName);
  const child = spawn(npm, [ "run", npmCMD ], { cwd, stdio: [ "inherit", "pipe", "pipe" ] });

  if (!child || !child.stdout || !child.stderr) {
    console.error(`Failed to spawn child process for ${folderName}`);

    return process.exit(1);
  }
  child.stdout.on("data", (data) => logger(`[${folderName}]`, data));
  child.stderr.on("data", (data) => logger(`[${folderName}]`, data, true));

  return child;
};

envConsoleLog('Initializing...');
installDependencies("frontend");
installDependencies("api");
redirectWrite(process.stdout);
redirectWrite(process.stderr);

const app = express();
app.use(setUpHeaders);
app.use(cors());
app.use(redirector("/"));
app.listen(8080, '0.0.0.0', () => envConsoleLog(`Server listening on port ${8080}`));

const frontend = spawnChild("frontend", isProd ? "start" : "dev");
const api = spawnChild("api", isProd ? "start" : "dev");

process.on("exit", () => {
  frontend.kill();
  api.kill();
});