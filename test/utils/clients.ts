import { setupTestingForClientTCP } from "./setup.tcp-client";
import { setupTestingForClientUDP } from "./setup.udp-client";

export const testingClients = [
    {
        setup: setupTestingForClientTCP,
        isClient: true,
        isTCP: true,
    },
    {
        setup: setupTestingForClientUDP,
        isClient: true,
        isTCP: false,
    },
];
