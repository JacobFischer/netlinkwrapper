import { setupTestingForClientTCP } from "./setup.tcp-client";
import { createTestingSetupClientUDP } from "./setup.udp-client";

export const testingClients = [
    {
        setup: setupTestingForClientTCP,
        isClient: true,
        isTCP: true,
    },
    {
        setup: createTestingSetupClientUDP,
        isClient: true,
        isTCP: false,
    },
];
