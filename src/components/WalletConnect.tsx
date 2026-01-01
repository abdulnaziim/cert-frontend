"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSmartAccount } from "../hooks/useSmartAccount";
import { useDevMode } from "../contexts/DevModeContext";

export default function WalletConnect() {
  const { address, chain, status } = useSmartAccount();
  const { isDevMode, toggleDevMode } = useDevMode();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
      {!isDevMode && <ConnectButton />}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        <input
          type="checkbox"
          id="devMode"
          checked={isDevMode}
          onChange={toggleDevMode}
          style={{ cursor: "pointer" }}
        />
        <label htmlFor="devMode" style={{ fontSize: 13, color: "#888", cursor: "pointer" }}>
          Simulate Wallet (Dev Mode)
        </label>
      </div>

      <div style={{ fontSize: 14, color: "#555" }}>
        <div>Status: {status}</div>
        {address && (
          <div>
            Connected: <span style={{ fontFamily: "monospace" }}>{address}</span>
          </div>
        )}
        {chain && <div>Network: {chain.name}</div>}
      </div>
    </div>
  );
}





