"use client";

import { useAccount, useWriteContract } from "wagmi";
import { useState } from "react";
import { CERT_NFT_ABI, getCertNftAddress } from "../lib/contracts";
import toast from "react-hot-toast";

export default function CertNftClient() {
  const { address, isConnected } = useAccount();
  const contract = getCertNftAddress();
  const { writeContractAsync, isPending } = useWriteContract();

  const [to, setTo] = useState<string>("");
  const [cid, setCid] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleMint() {
    setError("");
    try {
      const recipient = to || address;
      if (!isConnected || !contract || !recipient || !cid) return;
      await toast.promise(
        writeContractAsync({
          abi: CERT_NFT_ABI,
          address: contract,
          functionName: "mint",
          args: [recipient as `0x${string}`, cid],
        }),
        {
          loading: "Minting...",
          success: "Certificate minted",
          error: (e) => e?.shortMessage || e?.message || "Failed to mint",
        }
      );
      setCid("");
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(e?.shortMessage || e?.message || "Failed to mint");
    }
  }

  async function handleRevoke() {
    setError("");
    try {
      if (!isConnected || !contract || !tokenId) return;
      await toast.promise(
        writeContractAsync({
          abi: CERT_NFT_ABI,
          address: contract,
          functionName: "revoke",
          args: [BigInt(tokenId)],
        }),
        {
          loading: "Revoking...",
          success: "Certificate revoked",
          error: (e) => e?.shortMessage || e?.message || "Failed to revoke",
        }
      );
      setTokenId("");
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(e?.shortMessage || e?.message || "Failed to revoke");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 640 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>CertificateNFT</h2>
      {!contract && (
        <div style={{ color: "#b91c1c" }}>
          Set <code>NEXT_PUBLIC_CERTNFT_ADDRESS</code> in <code>.env.local</code> to interact.
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient (defaults to connected)"
          style={{ flex: 1, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <input
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          placeholder="IPFS CID"
          style={{ flex: 1, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <button onClick={handleMint} disabled={!isConnected || !contract || isPending || !cid} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6 }}>
          {isPending ? "Minting..." : "Mint"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          placeholder="Token ID to revoke"
          style={{ flex: 1, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <button onClick={handleRevoke} disabled={!isConnected || !contract || isPending || !tokenId} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6 }}>
          {isPending ? "Revoking..." : "Revoke"}
        </button>
      </div>

      {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
    </div>
  );
}


