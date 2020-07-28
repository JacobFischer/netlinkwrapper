import { EchoSocket } from "./echo-socket";
import { NetLinkSocketBase } from "../../lib";

export type TestingSetup<
    T extends NetLinkSocketBase,
    S extends EchoSocket | undefined
> = {
    netLink: T;
    echo: S;
    host: string;
    port: number;
};

export type TestingSetupFunction<
    T extends NetLinkSocketBase,
    S extends EchoSocket | undefined
> = (suite: Mocha.Suite) => TestingSetup<T, S>;

/**
 * LOL.
 *
 * @param createNetLinkConstr/**
 * LOL.
 *
 * @param createNetLinkConstructor
 * @param createNetLink
 * @param createEchoSocket
 * @param netLinkRequiresEchoer
 * @param netlinkBeforeEcho
export const createTestUtil = <
    TNetLinkCreator extends (host: string, port: number) => NetLinkSocketBase,
    TEchoSocketCreator extends (host: string, port: number) => EchoSocket
>(
    createNetLink: TNetLinkCreator,
    createEchoSocket: TEchoSocketCreator,
    netlinkBeforeEcho = false,
) => async (context: Mocha.Context) => {
    const runnable = context.test;
    if (!runnable) {
        throw new Error("No context to build test around");
    }.
    const id = runnable.fullTitle();
    if (!id) {
        throw new Error("Required id for Runnable tests");
    }.
    const [host, port] = testingAddress(id);
    const echoer = createEchoSocket(host, port) as ReturnType<
        TEchoSocketCreator
    >;
    if (!netlinkBeforeEcho) {
        await echoer.start();
    }.
    const netLink = createNetLink(host, port) as ReturnType<TNetLinkCreator>;
    if (netlinkBeforeEcho) {
        await echoer.start();
    }.

    const parent = runnable.parent;
    if (!parent) {
        throw new Error(`Cannot create test variable for runner`);
    }

    let tornDown = false;
    parent.afterEach(async () => {
        if (tornDown) {
            return;
        }

        if (!netLink.isDestroyed()) {
            netLink.disconnect();
        }
        await echoer.stop();
        tornDown = true;
    });

    return {
        host,
        port,
        str: id,
        netLink,
        echoer,
    };
};
*/