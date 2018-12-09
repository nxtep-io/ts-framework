import * as fs from "fs";
import * as Path from "path";
import { exec } from "child_process";
import { BaseError } from "ts-framework-common";
import BaseCommand from "../base/BaseCommand";
import Server, { ServerOptions } from "../server";

export default class ListenCommand extends BaseCommand<{ entrypoint: string }> {
  /**
   * Loads a new Server module and initialize its instance from relative path.
   */
  public async load(relativePath: string, options?: ServerOptions): Promise<Server> {
    const pathToServer = Path.resolve(process.cwd(), relativePath);
    try {
      const Module = await import(pathToServer);

      if (!Module || !Module.default) {
        throw new Error("Module has no default export");
      }

      return new Module.default(options);
    } catch (exception) {
      throw new BaseError("Could not load Server instance: " + exception.message, exception);
    }
  }

  public async run({ entrypoint, env }) {
    let distributionFile;
    const sourceFile = Path.resolve(process.cwd(), entrypoint);

    if (Path.extname(sourceFile) === ".ts") {
      // Try to find transpiled directory using tsconfig
      const tsConfigPath = Path.resolve(process.cwd(), "tsconfig.json");
      const relativePath = Path.relative(process.cwd(), sourceFile);
      const tsConfig = require(tsConfigPath);
      const distributionPath = Path.resolve(process.cwd(), tsConfig.compilerOptions.outDir);

      if (env !== "development" && !fs.existsSync(distributionPath)) {
        this.logger.debug("Building typescript source into plain javascript files...", { distributionPath });
        const compiler = () =>
          new Promise<void>((resolve, reject) => {
            exec("yarn tsc", (error, stdout, stderr) => {
              if (error || stderr) {
                this.logger.error(stdout);
                this.logger.error(stderr);
                reject(error);
              } else {
                resolve();
              }
            });
          });

        await compiler();
      }

      if (env === "development") {
        distributionFile = sourceFile;
      } else {
        distributionFile = Path.resolve(distributionPath, relativePath);
      }

      if (!fs.existsSync(distributionFile)) {
        // Try to find in root, as a last attempt to make it work
        this.logger.verbose(`Could not find transpiled server in "${distributionFile}"`);
        const fileName = Path.basename(sourceFile, ".ts");
        distributionFile = Path.join(distributionPath, fileName + ".js");

        if (fs.existsSync(distributionFile)) {
          // Runs from transpiled file
          this.logger.verbose(`Found transpiled server in "${distributionFile}"`);
        }
      } else if (Path.extname(distributionFile) === ".ts") {
        // Runs directly from typescript file
        this.logger.verbose(`Found typescript source file in "${distributionFile}"`);
      } else {
        // Runs from transpiled file
        this.logger.verbose(`Found transpiled server in "${distributionFile}"`);
      }
    } else {
      distributionFile = sourceFile;
      this.logger.verbose(`Found transpiled server in "${distributionFile}", skipping compilation`);
    }

    this.logger.debug(`Starting server in "${env}" environment from ${distributionFile}`);

    if (env !== "development") {
      // Force production environment
      process.env.NODE_ENV = "production";
    }

    const options = { port: process.env.PORT || 3000 };
    const instance = await this.load(distributionFile, {
      ...options
    });

    await instance.listen();
  }
}
