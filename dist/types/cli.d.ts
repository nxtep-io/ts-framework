import { LoggerInstance } from "ts-framework-common";
import * as yargs from "yargs";
import BaseCommand from "./base/BaseCommand";
import { WatchCommand } from "./commands";
export interface CommandLineOptions {
    logger?: LoggerInstance;
    commands?: (typeof BaseCommand)[];
}
export declare const DEFAULT_ENTRYPOINT: string;
export declare const DEFAULT_ENV: string;
export declare const DEFAULT_PORT: string | number;
export default class CommandLine {
    options: CommandLineOptions;
    logger: LoggerInstance;
    commands: BaseCommand[];
    yargs: yargs.Argv;
    static readonly DEFAULT_OPTS: {
        entrypoint: string;
        port: string | number;
        env: string;
    };
    static readonly DEFAULT_COMMANDS: (typeof WatchCommand)[];
    constructor(options?: CommandLineOptions);
    static initialize(options?: CommandLineOptions): {
        [x: string]: unknown;
        _: string[];
        $0: string;
    };
    onError(error: any): void;
    onMount(): Promise<void>;
}
