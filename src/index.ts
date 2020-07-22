import * as types from "./types";
import bindings from "bindings";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mod: {
    NetLinkSocketBase: typeof types.NetLinkSocketBase;
    NetLinkSocketClientTCP: typeof types.NetLinkSocketClientTCP;
} = bindings("netlinksocket");

export const NetLinkSocketBase = mod.NetLinkSocketBase;
export const NetLinkSocketClientTCP = mod.NetLinkSocketClientTCP;
