import BaseCommand from "../base/BaseCommand";
import Server, { ServerOptions } from "../server";
export default class ListenCommand extends BaseCommand<{
    entrypoint: string;
}> {
    /**
     * Loads a new Server module and initialize its instance from relative path.
     */
    load(relativePath: string, options?: ServerOptions): Promise<Server>;
    run({ entrypoint, env }: {
        entrypoint: any;
        env: any;
    }): Promise<void>;
}
