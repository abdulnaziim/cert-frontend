"use client";

import { Suspense, useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { useSearchParams } from "next/navigation";
import { CERT_NFT_ABI, getCertNftAddress } from "../../lib/contracts";
import CertificatePreview from "../../components/CertificatePreview";

function VerifyContent() {
    const searchParams = useSearchParams();
    const [searchMode, setSearchMode] = useState<"token" | "ipfs" | "wallet" | "txn">("token");
    const [tokenId, setTokenId] = useState("");
    const [ipfsCid, setIpfsCid] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [txHash, setTxHash] = useState("");
    const [searching, setSearching] = useState(false);
    const nftAddress = getCertNftAddress();

    // Initialize from URL params
    useEffect(() => {
        const mode = searchParams.get("mode");
        const id = searchParams.get("id");
        const cid = searchParams.get("cid");
        const address = searchParams.get("address");
        const hash = searchParams.get("hash");

        if (mode === "token" || mode === "ipfs" || mode === "wallet" || mode === "txn") {
            setSearchMode(mode);
        }
        if (id) setTokenId(id);
        if (cid) setIpfsCid(cid);
        if (address) setWalletAddress(address);
        if (hash) setTxHash(hash);

        // Auto-search if params exist
        if (mode && (id || cid || address)) {
            // We need to wait for state to update or just trigger it manually. 
            // Since state updates are async, let's just use the values directly for a dedicated init effect
            // or rely on the user to click (safer to avoid loops). 
            // Actually, let's set a flag to auto-trigger? 
            // For simplicity, let's just pre-fill. The user can click Search.
            // OR: we can auto-trigger in a separate effect that depends on searching=false and params present?
            // Let's just pre-fill to verify intention for now.
        }
    }, [searchParams]);

    // Read token URI (only for token mode)
    const { data: tokenURI, isLoading: loadingURI } = useReadContract({
        abi: CERT_NFT_ABI,
        address: nftAddress,
        functionName: "tokenURI",
        args: tokenId ? [BigInt(tokenId)] : undefined,
        query: {
            enabled: Boolean(searchMode === "token" && nftAddress && tokenId && !isNaN(Number(tokenId))),
        },
    });

    // Read owner (only for token mode)
    const { data: owner, isLoading: loadingOwner } = useReadContract({
        abi: CERT_NFT_ABI,
        address: nftAddress,
        functionName: "ownerOf",
        args: tokenId ? [BigInt(tokenId)] : undefined,
        query: {
            enabled: Boolean(searchMode === "token" && nftAddress && tokenId && !isNaN(Number(tokenId))),
        },
    });

    // Read revocation status (only for token mode)
    const { data: isRevoked, isLoading: loadingRevoked } = useReadContract({
        abi: CERT_NFT_ABI,
        address: nftAddress,
        functionName: "revoked",
        args: tokenId ? [BigInt(tokenId)] : undefined,
        query: {
            enabled: Boolean(searchMode === "token" && nftAddress && tokenId && !isNaN(Number(tokenId))),
        },
    });

    const [metadata, setMetadata] = useState<any>(null);
    const [walletData, setWalletData] = useState<any>(null);
    const [txnData, setTxnData] = useState<any>(null);
    const [metadataError, setMetadataError] = useState("");

    const handleVerify = async () => {
        setMetadata(null);
        setWalletData(null);
        setTxnData(null);
        setMetadataError("");
        setSearching(true);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

        if (searchMode === "token") {
            if (!tokenId || isNaN(Number(tokenId))) { setSearching(false); return; }
            if (tokenURI) {
                try {
                    const response = await fetch(`/api/proxy-metadata?url=${encodeURIComponent(tokenURI as string)}`);
                    if (response.ok) {
                        const data = await response.json();
                        setMetadata(data);
                    } else {
                        setMetadataError("Failed to fetch metadata from IPFS");
                    }
                } catch (error) {
                    setMetadataError("Error fetching metadata");
                }
            }
        } else if (searchMode === "ipfs") {
            if (!ipfsCid) { setSearching(false); return; }
            try {
                const targetUrl = ipfsCid.startsWith("ipfs://") ? ipfsCid : `ipfs://${ipfsCid}`;
                const response = await fetch(`/api/proxy-metadata?url=${encodeURIComponent(targetUrl)}`);
                if (response.ok) {
                    const data = await response.json();
                    setMetadata(data);
                } else {
                    setMetadataError("Invalid IPFS Code or content not found");
                }
            } catch (error) {
                setMetadataError("Error fetching IPFS data");
            }
        } else if (searchMode === "wallet") {
            if (!walletAddress) { setSearching(false); return; }
            try {
                const response = await fetch(`${backendUrl}/api/wallet/${walletAddress}/certificates`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setWalletData(data);
                } else {
                    setMetadataError("Could not retrieve wallet data");
                }
            } catch (error) {
                setMetadataError("Error connecting to server");
            }
        } else if (searchMode === "txn") {
            if (!txHash) { setSearching(false); return; }
            try {
                const response = await fetch(`${backendUrl}/api/certificates/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transaction_hash: txHash })
                });
                if (response.ok) {
                    const data = await response.json();
                    setTxnData(data);
                    if (data.certificate) {
                        if (data.certificate.token_id) {
                            setTokenId(data.certificate.token_id.toString());
                        }
                    }
                } else {
                    setMetadataError("Transaction verification failed");
                }
            } catch (error) {
                setMetadataError("Error connecting to verification service");
            }
        }
        setSearching(false);
    };

    const selectCertificate = (id: string) => {
        setSearchMode("token");
        setTokenId(id);
        setTimeout(() => document.getElementById('search-btn')?.click(), 800);
    };

    const isLoading = loadingURI || loadingOwner || loadingRevoked || searching;

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "40px 24px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h1 style={{ fontSize: 36, fontWeight: 800, color: "white", textAlign: "center", marginBottom: 8 }}>
                    🔍 Certificate Portal
                </h1>
                <p style={{ color: "rgba(255,255,255,0.9)", textAlign: "center", marginBottom: 32 }}>
                    Verify authenticity via Blockchain Token ID or IPFS Code
                </p>

                {/* Mode Toggle */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
                    {[
                        { id: "token", label: "By Token ID" },
                        { id: "ipfs", label: "By IPFS Code" },
                        { id: "wallet", label: "By Wallet Address" },
                        { id: "txn", label: "By Transaction Hash" }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => { setSearchMode(mode.id as any); setMetadata(null); setWalletData(null); setTxnData(null); }}
                            style={{
                                padding: "10px 24px",
                                borderRadius: "30px",
                                border: "none",
                                background: searchMode === mode.id ? "white" : "rgba(255,255,255,0.2)",
                                color: searchMode === mode.id ? "#667eea" : "white",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontSize: 14
                            }}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>

                {/* Search Box */}
                <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", marginBottom: 32 }}>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#4b5563" }}>
                        {searchMode === "token" ? "NFT Token ID" : searchMode === "ipfs" ? "IPFS Content ID (CID)" : searchMode === "wallet" ? "Wallet Public Address" : "Ethereum Transaction Hash"}
                    </label>
                    <div style={{ display: "flex", gap: 16, flexDirection: searchMode === "wallet" ? "column" : "row" }}>
                        <input
                            id="search-input"
                            type={searchMode === "token" ? "number" : "text"}
                            value={searchMode === "token" ? tokenId : searchMode === "ipfs" ? ipfsCid : searchMode === "wallet" ? walletAddress : txHash}
                            onChange={(e) => {
                                let val = e.target.value.trim();
                                // Auto-extract hash from URL if pasted
                                if (val.includes("etherscan.io/tx/")) {
                                    const parts = val.split("tx/");
                                    if (parts[1]) val = parts[1].split("?")[0].split("/")[0];
                                }

                                if (searchMode === "token") setTokenId(val);
                                else if (searchMode === "ipfs") setIpfsCid(val);
                                else if (searchMode === "wallet") setWalletAddress(val);
                                else setTxHash(val);
                            }}
                            placeholder={searchMode === "token" ? "e.g. 4" : searchMode === "ipfs" ? "e.g. Qm..." : searchMode === "wallet" ? "0x..." : "0x..."}
                            style={{ flex: 1, padding: "16px 20px", border: "2px solid #f3f4f6", borderRadius: 16, fontSize: 16, outline: "none", background: "#f9fafb" }}
                            onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                        />
                        <button
                            id="search-btn"
                            onClick={handleVerify}
                            disabled={isLoading}
                            style={{
                                padding: "16px 40px",
                                background: "linear-gradient(135deg, #4f46e5 0%, #764ba2 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: 16,
                                fontSize: 16,
                                fontWeight: 700,
                                cursor: "pointer",
                                opacity: isLoading ? 0.7 : 1,
                                whiteSpace: "nowrap"
                            }}
                        >
                            {isLoading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                {(metadata || metadataError || walletData || txnData || (searchMode === "token" && owner)) && (
                    <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>

                        {/* Transaction Result */}
                        {searchMode === "txn" && txnData && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    padding: 16, borderRadius: 16, marginBottom: 24,
                                    background: txnData.verified ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                    color: "white", fontSize: 18, fontWeight: 800,
                                }}>
                                    {txnData.verified ? "✅ TRANSACTION VALID" : "❌ TRANSACTION INVALID"}
                                </div>

                                {txnData.certificate && (
                                    <div style={{ padding: 24, background: "#f9fafb", borderRadius: 16, border: "1px solid #e5e7eb", marginTop: 24 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Certificate Found</h3>
                                        <p style={{ color: "#4b5563", marginBottom: 16 }}>This transaction issued <strong>Token #{txnData.certificate.token_id}</strong></p>
                                        <button
                                            onClick={() => selectCertificate(txnData.certificate.token_id)}
                                            style={{ padding: "10px 24px", background: "#4f46e5", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}
                                        >
                                            View Certificate Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Blockchain Status (Token Mode) */}
                        {searchMode === "token" && isRevoked !== undefined && owner && (
                            <div style={{
                                padding: 16, borderRadius: 16, marginBottom: 24,
                                background: isRevoked ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "white", textAlign: "center", fontSize: 18, fontWeight: 800,
                            }}>
                                {isRevoked ? "⚠️ CERTIFICATE REVOKED" : "✅ BLOCKCHAIN VERIFIED"}
                            </div>
                        )}

                        {/* Wallet List Results */}
                        {searchMode === "wallet" && walletData && (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid #f3f4f6" }}>
                                    <h2 style={{ fontSize: 22, fontWeight: 800 }}>Found Certificates</h2>
                                    <span style={{ padding: "4px 12px", background: "#eef2ff", color: "#4f46e5", borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
                                        {walletData.count} Items
                                    </span>
                                </div>

                                {walletData.certificates.length > 0 ? (
                                    <div style={{ display: "grid", gap: 16 }}>
                                        {walletData.certificates.map((cert: any, idx: number) => (
                                            <div
                                                key={idx}
                                                onClick={() => selectCertificate(cert.token_id)}
                                                style={{
                                                    padding: 20, background: "#f9fafb", borderRadius: 16, border: "1px solid #e5e7eb",
                                                    cursor: "pointer", transition: "all 0.2s",
                                                    display: "flex", justifyContent: "space-between", alignItems: "center"
                                                }}
                                            >
                                                <div>
                                                    <p style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>TOKEN #{cert.token_id}</p>
                                                    <h4 style={{ fontSize: 18, fontWeight: 700 }}>{cert.metadata?.title || "Certificate"}</h4>
                                                    <p style={{ fontSize: 14, color: "#4b5563" }}>{cert.metadata?.recipient_name || "Unknown Owner"}</p>
                                                    {cert.on_chain_data?.hash && (
                                                        <a
                                                            href={`https://sepolia.etherscan.io/tx/${cert.on_chain_data.hash}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{ fontSize: 12, color: "#4f46e5", textDecoration: "none", marginTop: 8, display: "inline-block" }}
                                                        >
                                                            🔗 View Mint Transaction
                                                        </a>
                                                    )}
                                                </div>
                                                <div style={{ textAlign: "right", color: "#4f46e5", fontWeight: 700 }}>View Details →</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>No certificates found for this wallet on Sepolia.</div>
                                )}
                            </div>
                        )}

                        {/* IPFS Status (IPFS Mode) */}
                        {searchMode === "ipfs" && metadata && (
                            <div style={{
                                padding: 16, borderRadius: 16, marginBottom: 24,
                                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                color: "white", textAlign: "center", fontSize: 18, fontWeight: 800,
                            }}>
                                📁 IPFS DATA RETRIEVED
                            </div>
                        )}

                        {/* Owner Info (Token Mode) */}
                        {searchMode === "token" && owner && (
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                                    <h3 style={{ fontSize: 12, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase" }}>On-chain Owner</h3>
                                    <a
                                        href={`https://sepolia.etherscan.io/address/${owner as string}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ fontSize: 12, color: "#4f46e5", textDecoration: "none", fontWeight: 700 }}
                                    >
                                        Verify on Etherscan ↗
                                    </a>
                                </div>
                                <div style={{ padding: 12, background: "#f9fafb", borderRadius: 12, fontFamily: "monospace", fontSize: 14, wordBreak: "break-all", border: "1px solid #e5e7eb" }}>
                                    {owner as string}
                                </div>
                            </div>
                        )}

                        {/* Metadata Details */}
                        {metadata && (
                            <div>
                                <div style={{ marginBottom: 24, borderBottom: "1px solid #f3f4f6", paddingBottom: 16 }}>
                                    <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 4 }}>{metadata.name || metadata.title || "Certificate"}</h2>
                                    <p style={{ color: "#4b5563" }}>Issued to: <span style={{ fontWeight: 800, color: "#111827" }}>{metadata.recipient_name}</span></p>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 12, fontWeight: 800, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase" }}>IPFS Source</h3>
                                    <div style={{ padding: 12, background: "#f9fafb", borderRadius: 12, fontFamily: "monospace", fontSize: 12, wordBreak: "break-all", color: "#3b82f6", border: "1px solid #e5e7eb" }}>
                                        {searchMode === "token" ? (tokenURI as string) : (ipfsCid.startsWith("ipfs://") ? ipfsCid : `ipfs://${ipfsCid}`)}
                                    </div>
                                </div>

                                <div style={{ marginTop: 24 }}>
                                    {((metadata.image && metadata.image.includes('pdf')) ||
                                        (metadata.properties?.files?.[0]?.type === 'application/pdf')) ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden', boxShadow: "0 10px 40px rgba(0,0,0,0.2)", border: "1px solid #e5e7eb" }}>
                                                <iframe
                                                    src={metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                                                    width="100%"
                                                    height="600px"
                                                    style={{ border: "none", display: "block" }}
                                                    title="Certificate PDF"
                                                />
                                            </div>
                                            <a
                                                href={metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                                                target="_blank" rel="noopener noreferrer"
                                                style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", borderRadius: 12, textDecoration: "none", fontWeight: 800 }}
                                            >
                                                📄 Download PDF Certificate
                                            </a>
                                        </div>
                                    ) : metadata.image ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <img
                                                src={metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                                                alt="Certificate"
                                                style={{ maxWidth: "100%", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", marginBottom: 16 }}
                                            />
                                            <a
                                                href={metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                                                target="_blank" rel="noopener noreferrer"
                                                style={{ display: "inline-block", padding: "10px 28px", background: "#f3f4f6", color: "#374151", borderRadius: 12, textDecoration: "none", fontWeight: 700, border: "1px solid #d1d5db" }}
                                            >
                                                ⬇️ Download Image
                                            </a>
                                        </div>
                                    ) : (
                                        <CertificatePreview metadata={metadata} tokenId={searchMode === "token" ? tokenId : "Portal"} />
                                    )}
                                </div>
                            </div>
                        )}

                        {metadataError && (
                            <div style={{ padding: 16, background: "#fee2e2", borderRadius: 8, color: "#991b1b", textAlign: "center", marginTop: 24 }}>
                                {metadataError}
                            </div>
                        )}

                        {searchMode === "token" && !owner && !isLoading && tokenId && (
                            <div style={{ padding: 16, background: "#fee2e2", borderRadius: 8, color: "#991b1b", textAlign: "center", marginTop: 24 }}>
                                Token ID #{tokenId} does not exist on the Sepolia blockchain.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
