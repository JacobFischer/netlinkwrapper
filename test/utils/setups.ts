import { setupTestingForClientTCP } from "./setup.tcp-client";
import { setupTestingForServerTCP } from "./setup.tcp-server";
import { setupTestingForUDP } from "./setup.udp";

export const testingClients = [
    {
        setup: setupTestingForClientTCP,
        isClient: true,
        isTCP: true,
    },
    {
        setup: setupTestingForUDP,
        isClient: true,
        isTCP: false,
    },
] as const;

export const setups = [
    ...testingClients,
    {
        setup: setupTestingForServerTCP,
        isClient: false,
        isTCP: true,
    },
] as const;
