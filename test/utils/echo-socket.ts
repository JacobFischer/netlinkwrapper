import { Event, events } from "ts-typed-events";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class EchoSocket<T> {
    public readonly events = events({
        newConnection: new Event<T>(),
        closedConnection: new Event<{
            from: T;
            hadError: boolean;
        }>(),
        sentData: new Event<{
            from: T;
            buffer: Buffer;
            str: string;
        }>(),
    });

    public abstract start(data: { host: string; port: number }): Promise<void>;
    public abstract stop(): Promise<void>;
}
