import { Event, events } from "ts-typed-events";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class EchoSocket<T = any> {
    public readonly events = events({
        newConnection: new Event<T>(),
        closedConnection: new Event<{
            from: T;
            hadError: boolean;
        }>(),
        sentData: new Event<{
            from: T;
            data: string;
        }>(),
    });

    constructor(public readonly port: number) {
        // pass
    }

    public abstract start(): Promise<void>;
    public abstract stop(): Promise<void>;
}
