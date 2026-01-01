"use client";

import { useAccount } from "wagmi";
import { useDevMode } from "../contexts/DevModeContext";

export function useSmartAccount() {
    const { address, isConnected, chain, status, connector } = useAccount();
    const { isDevMode, mockAddress } = useDevMode();

    if (isDevMode) {
        return {
            address: mockAddress as `0x${string}`,
            isConnected: true,
            chain: { id: 31337, name: "Hardhat Local" }, // Fake chain
            status: "connected",
            connector: { name: "Dev Mode" },
            isDisconnected: false,
            isReconnecting: false,
            isConnecting: false,
        };
    }

    return { address, isConnected, chain, status, connector, isDisconnected: !isConnected, isReconnecting: false, isConnecting: status === "connecting" };
}
