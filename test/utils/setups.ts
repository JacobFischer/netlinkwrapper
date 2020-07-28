import { setupTestingForClientTCP } from "./setup.tcp-client";
import { setupTestingForServerTCP } from "./setup.tcp-server";
import { setupTestingForUDP } from "./setup.udp";

export const setups = {
    tcpClient: {
        setup: setupTestingForClientTCP,
        isClient: true,
        isTCP: true,
    },
    tcpServer: {
        setup: setupTestingForServerTCP,
        isClient: false,
        isTCP: true,
    },
    udp: {
        setup: setupTestingForUDP,
        isClient: true,
        isTCP: false,
    },
} as const;
