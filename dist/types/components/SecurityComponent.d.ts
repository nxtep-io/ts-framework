import * as cors from "cors";
import * as Helmet from "helmet";
import { ComponentType, Component, LoggerInstance } from "ts-framework-common";
import Server from "../index";
export interface SecurityComponentOptions {
    logger?: LoggerInstance;
    helmet?: Helmet.IHelmetConfiguration | false;
    userAgent?: boolean;
    cors?: boolean | cors.CorsOptions;
    trustProxy?: boolean;
}
export default class SecurityComponent implements Component {
    options: SecurityComponentOptions;
    type: ComponentType.MIDDLEWARE;
    logger: LoggerInstance;
    constructor(options?: SecurityComponentOptions);
    describe(): {
        name: string;
    };
    onMount(server: Server): void;
    onInit(): Promise<void>;
    onUnmount(): void;
}
