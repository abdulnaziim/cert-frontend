"use client";

import { useReadContract, useWriteContract } from "wagmi";
import { useMemo, useState } from "react";
import { CERT_ABI, CERT_NFT_ABI, getCertAddress, getCertNftAddress } from "../lib/contracts";
import { isAdmin } from "../lib/admin";
import toast from "react-hot-toast";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSmartAccount } from "../hooks/useSmartAccount";
import { useDevMode } from "../contexts/DevModeContext";

export default function AdminPanel() {
  const { address, isConnected } = useSmartAccount();
  const { isDevMode } = useDevMode();
  const hasAccess = isDevMode || isAdmin(address); // Allow dev mode to be admin

  const cert = getCertAddress();
  const nft = getCertNftAddress();

  const [owner, setOwner] = useState("");
  const [cid, setCid] = useState("");
  const [tokenId, setTokenId] = useState("");

  const queryOwner = useMemo(() => (owner || address || "0x"), [owner, address]);

  const { data: cids, refetch } = useReadContract({
    abi: CERT_ABI,
    address: cert,
    functionName: "getCIDs",
    args: [queryOwner as `0x${string}`],
    query: { enabled: !isDevMode && Boolean(cert) && hasAccess && Boolean(queryOwner && queryOwner !== "0x") },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  async function issue() {
    if (!hasAccess || !isConnected || !owner || !cid) return;

    if (isDevMode) {
      await toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        { loading: "Issuing (Simulated)...", success: "Issued (Simulated)", error: "Failed" }
      );
      setCid("");
      // In dev mode, we can't really refetch from chain if we didn't write to it.
      // But we could pretend.
      return;
    }

    if (!cert) {
      toast.error("Contract not found");
      return;
    }

    await toast.promise(
      writeContractAsync({ abi: CERT_ABI, address: cert, functionName: "issue", args: [owner as `0x${string}`, cid] }),
      { loading: "Issuing...", success: "Issued", error: (e) => e?.shortMessage || e?.message || "Failed" }
    );
    setCid("");
    await refetch();
  }

  async function revoke() {
    if (!hasAccess || !isConnected || !tokenId) return;

    if (isDevMode) {
      await toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        { loading: "Revoking (Simulated)...", success: "Revoked (Simulated)", error: "Failed" }
      );
      setTokenId("");
      return;
    }

    if (!nft) {
      toast.error("Contract not found");
      return;
    }

    await toast.promise(
      writeContractAsync({ abi: CERT_NFT_ABI, address: nft, functionName: "revoke", args: [BigInt(tokenId)] }),
      { loading: "Revoking...", success: "Revoked", error: (e) => e?.shortMessage || e?.message || "Failed" }
    );
    setTokenId("");
  }

  if (!isConnected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ color: "#6b7280" }}>Connect a wallet to continue.</div>
        {/* We rely on WalletConnect component elsewhere or show it here? 
            AdminPanel is usually inside a page that has the wallet connect button.
            But the original code had ConnectButton here. 
            In DevMode, isConnected is true, so we check !isConnected first.
        */}
        <ConnectButton />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{ color: "#b91c1c", display: "flex", flexDirection: "column", gap: 8 }}>
        <div>Access denied. Connect an admin wallet.</div>
        <div style={{ color: "#6b7280" }}>
          Connected: <code>{address || "(none)"}</code>
        </div>
        <div style={{ color: "#6b7280" }}>
          Admin list: <code>{(process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").trim() || "(empty)"}</code>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{
        position: "relative",
        padding: 24,
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(15,17,23,0.8), rgba(10,11,15,0.8))",
        border: "1px solid rgba(0,229,255,0.2)",
        boxShadow: "0 0 0 1px rgba(124,77,255,0.15), 0 20px 60px rgba(0,0,0,0.5)",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          inset: -2,
          background: "radial-gradient(600px 200px at 20% -10%, rgba(0,229,255,0.15), transparent), radial-gradient(600px 200px at 120% 120%, rgba(124,77,255,0.15), transparent)"
        }} />
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, letterSpacing: 0.5 }}>Admin Panel</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", marginTop: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Owner address</label>
              <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="0x..." style={{ width: "100%", padding: 12, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, background: "rgba(255,255,255,0.03)", color: "#e5e7eb" }} />
            </div>
            <button onClick={() => refetch()} disabled={!cert} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(0,229,255,0.3)", background: "linear-gradient(90deg, rgba(0,229,255,0.1), rgba(124,77,255,0.1))", color: "#e5e7eb" }}>View CIDs</button>
          </div>

          <div style={{ marginTop: 16, padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {Array.isArray(cids) && (cids as string[]).length ? (
                (cids as string[]).map((x, i) => (
                  <li key={i} style={{ wordBreak: "break-all", padding: "6px 0" }}>
                    {x}
                    {x.startsWith('bafybei') && x.length < 50 && <span style={{ color: "#fbbf24", fontSize: 12, marginLeft: 8 }}>[Mock]</span>}
                  </li>
                ))
              ) : (
                <li style={{ color: "#9ca3af" }}>No CIDs for this owner or not loaded.</li>
              )}
            </ul>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", marginTop: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>New IPFS CID</label>
              <input value={cid} onChange={(e) => setCid(e.target.value)} placeholder="bafy..." style={{ width: "100%", padding: 12, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, background: "rgba(255,255,255,0.03)", color: "#e5e7eb" }} />
            </div>
            <button onClick={issue} disabled={!owner || !cid || isPending} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(0,229,255,0.3)", background: "linear-gradient(90deg, rgba(0,229,255,0.15), rgba(124,77,255,0.15))", color: "#e5e7eb" }}>{isPending ? "Issuing..." : "Issue"}</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", marginTop: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Token ID to revoke</label>
              <input value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="123" style={{ width: "100%", padding: 12, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, background: "rgba(255,255,255,0.03)", color: "#e5e7eb" }} />
            </div>
            <button onClick={revoke} disabled={!tokenId || isPending} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(124,77,255,0.3)", background: "linear-gradient(90deg, rgba(124,77,255,0.15), rgba(0,229,255,0.15))", color: "#e5e7eb" }}>{isPending ? "Revoking..." : "Revoke"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}


