"use client";

import { Suspense, useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { useSearchParams } from "next/navigation";
import { CERT_NFT_ABI, getCertNftAddress } from "../../lib/contracts";
import Link from "next/link";

function VerifyContent() {
    const searchParams = useSearchParams();
    const [searchMode, setSearchMode] = useState<"token" | "ipfs" | "wallet" | "txn">("token");
    const [tokenId, setTokenId] = useState("");
    const [ipfsCid, setIpfsCid] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [txHash, setTxHash] = useState("");
    const [searching, setSearching] = useState(false);
    const nftAddress = getCertNftAddress();

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
    }, [searchParams]);

    const { data: tokenURI, isLoading: loadingURI } = useReadContract({
        abi: CERT_NFT_ABI,
        address: nftAddress,
        functionName: "tokenURI",
        args: tokenId ? [BigInt(tokenId)] : undefined,
        query: {
            enabled: Boolean(searchMode === "token" && nftAddress && tokenId && !isNaN(Number(tokenId))),
        },
    });

    const { data: owner, isLoading: loadingOwner } = useReadContract({
        abi: CERT_NFT_ABI,
        address: nftAddress,
        functionName: "ownerOf",
        args: tokenId ? [BigInt(tokenId)] : undefined,
        query: {
            enabled: Boolean(searchMode === "token" && nftAddress && tokenId && !isNaN(Number(tokenId))),
        },
    });

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
                    headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
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
                    if (data.certificate?.token_id) {
                        setTokenId(data.certificate.token_id.toString());
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

    const modes = [
        { id: "token", label: "Token ID", icon: "🔢", placeholder: "e.g. 42" },
        { id: "ipfs", label: "IPFS Hash", icon: "📁", placeholder: "Qm..." },
        { id: "wallet", label: "Wallet", icon: "👛", placeholder: "0x..." },
        { id: "txn", label: "Transaction", icon: "🔗", placeholder: "0x..." }
    ];

    return (
        <div className="gradient-bg" style={{ minHeight: "100vh", padding: "0 24px 60px" }}>
            {/* Header */}
            <header style={{
                padding: "20px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                maxWidth: 1200,
                margin: "0 auto",
                position: "relative",
                zIndex: 50
            }}>
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #10b981 0%, #2dd4bf 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20
                    }}>
                        🎓
                    </div>
                    <span style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "white"
                    }}>
                        CertNFT
                    </span>
                </Link>

            </header>

            {/* Hero */}
            <div style={{ textAlign: "center", padding: "60px 0 50px", position: "relative", zIndex: 1 }}>
                <div className="chip" style={{ marginBottom: 24 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2dd4bf" }} />
                    Blockchain Verification Portal
                </div>
                <h1 style={{
                    fontSize: "clamp(32px, 5vw, 52px)",
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 16,
                    letterSpacing: "-0.03em"
                }}>
                    Verify Any <span className="text-gradient">Certificate</span>
                </h1>
                <p style={{
                    fontSize: 18,
                    color: "rgba(255,255,255,0.6)",
                    maxWidth: 500,
                    margin: "0 auto"
                }}>
                    Instantly authenticate credentials using blockchain technology
                </p>
            </div>

            {/* Search Section */}
            <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
                {/* Mode Selector */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                    marginBottom: 24
                }}>
                    {modes.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => { setSearchMode(mode.id as any); setMetadata(null); setWalletData(null); setTxnData(null); setMetadataError(""); }}
                            style={{
                                padding: "16px 12px",
                                borderRadius: 16,
                                border: searchMode === mode.id ? "2px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                                background: searchMode === mode.id ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.03)",
                                color: searchMode === mode.id ? "#34d399" : "rgba(255,255,255,0.6)",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 13
                            }}
                        >
                            <span style={{ fontSize: 20 }}>{mode.icon}</span>
                            {mode.label}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                        <input
                            id="search-input"
                            type={searchMode === "token" ? "number" : "text"}
                            value={searchMode === "token" ? tokenId : searchMode === "ipfs" ? ipfsCid : searchMode === "wallet" ? walletAddress : txHash}
                            onChange={(e) => {
                                let val = e.target.value.trim();
                                if (val.includes("etherscan.io/tx/")) {
                                    const parts = val.split("tx/");
                                    if (parts[1]) val = parts[1].split("?")[0].split("/")[0];
                                }
                                if (searchMode === "token") setTokenId(val);
                                else if (searchMode === "ipfs") setIpfsCid(val);
                                else if (searchMode === "wallet") setWalletAddress(val);
                                else setTxHash(val);
                            }}
                            placeholder={modes.find(m => m.id === searchMode)?.placeholder}
                            className="input-modern"
                            style={{ flex: 1, background: "rgba(255,255,255,0.05)" }}
                            onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                        />
                        <button
                            id="search-btn"
                            onClick={handleVerify}
                            disabled={isLoading}
                            className="btn-primary"
                            style={{
                                padding: "18px 32px",
                                opacity: isLoading ? 0.7 : 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 8
                            }}
                        >
                            {isLoading ? (
                                <span className="shimmer" style={{ width: 80 }}>Searching...</span>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                    Verify
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results */}
                {(metadata || metadataError || walletData || txnData || (searchMode === "token" && owner)) && (
                    <div className="glass-card" style={{ marginTop: 24, padding: 32 }}>

                        {/* Transaction Result */}
                        {searchMode === "txn" && txnData && (
                            <div style={{ textAlign: 'center' }}>
                                <StatusBadge
                                    status={txnData.verified ? "success" : "error"}
                                    text={txnData.verified ? "TRANSACTION VERIFIED" : "TRANSACTION INVALID"}
                                />
                                {txnData.certificate && (
                                    <div style={{ marginTop: 24 }}>
                                        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                                            This transaction issued <strong style={{ color: "#2dd4bf" }}>Token #{txnData.certificate.token_id}</strong>
                                        </p>
                                        <button
                                            onClick={() => selectCertificate(txnData.certificate.token_id)}
                                            className="btn-primary"
                                            style={{ padding: "12px 28px" }}
                                        >
                                            View Certificate Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Token Mode Status */}
                        {searchMode === "token" && isRevoked !== undefined && owner && (
                            <StatusBadge
                                status={isRevoked ? "error" : "success"}
                                text={isRevoked ? "CERTIFICATE REVOKED" : "BLOCKCHAIN VERIFIED"}
                            />
                        )}

                        {/* Wallet Results */}
                        {searchMode === "wallet" && walletData && (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "white" }}>Certificates Found</h2>
                                    <span className="chip">{walletData.count} Items</span>
                                </div>
                                {walletData.certificates.length > 0 ? (
                                    <div style={{ display: "grid", gap: 12 }}>
                                        {walletData.certificates.map((cert: any, idx: number) => (
                                            <div
                                                key={idx}
                                                onClick={() => selectCertificate(cert.token_id)}
                                                className="glass-card-light"
                                                style={{
                                                    padding: 20,
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    transition: "all 0.2s"
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: 11, color: "#2dd4bf", fontWeight: 700, marginBottom: 4 }}>
                                                        TOKEN #{cert.token_id}
                                                    </div>
                                                    <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
                                                        {cert.metadata?.title || "Certificate"}
                                                    </div>
                                                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                                                        {cert.metadata?.recipient_name || "Unknown"}
                                                    </div>
                                                </div>
                                                <div style={{ color: "#34d399", fontWeight: 600, fontSize: 14 }}>
                                                    View →
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.5)" }}>
                                        No certificates found for this wallet
                                    </div>
                                )}
                            </div>
                        )}

                        {/* IPFS Status */}
                        {searchMode === "ipfs" && metadata && (
                            <StatusBadge status="info" text="IPFS DATA RETRIEVED" />
                        )}

                        {/* Owner Info */}
                        {searchMode === "token" && owner && (
                            <div style={{ marginBottom: 24, marginTop: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>
                                        On-Chain Owner
                                    </span>
                                    <a
                                        href={`https://sepolia.etherscan.io/address/${owner as string}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: 12, color: "#2dd4bf", textDecoration: "none" }}
                                    >
                                        Etherscan ↗
                                    </a>
                                </div>
                                <div style={{
                                    padding: 14,
                                    background: "rgba(255,255,255,0.03)",
                                    borderRadius: 12,
                                    fontFamily: "monospace",
                                    fontSize: 13,
                                    color: "rgba(255,255,255,0.8)",
                                    wordBreak: "break-all",
                                    border: "1px solid rgba(255,255,255,0.06)"
                                }}>
                                    {owner as string}
                                </div>
                            </div>
                        )}

                        {/* Metadata Display */}
                        {metadata && (
                            <div style={{ marginTop: 24 }}>
                                <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                    <h2 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 8 }}>
                                        {metadata.name || metadata.title || "Certificate"}
                                    </h2>
                                    <p style={{ color: "rgba(255,255,255,0.6)" }}>
                                        Issued to: <strong style={{ color: "white" }}>{metadata.recipient_name}</strong>
                                    </p>
                                </div>

                                {/* IPFS Source */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 700, textTransform: "uppercase" }}>
                                        IPFS Source
                                    </div>
                                    <div style={{
                                        padding: 12,
                                        background: "rgba(255,255,255,0.03)",
                                        borderRadius: 10,
                                        fontFamily: "monospace",
                                        fontSize: 12,
                                        color: "#2dd4bf",
                                        wordBreak: "break-all",
                                        border: "1px solid rgba(255,255,255,0.06)"
                                    }}>
                                        {searchMode === "token" ? (tokenURI as string) : (ipfsCid.startsWith("ipfs://") ? ipfsCid : `ipfs://${ipfsCid}`)}
                                    </div>
                                </div>

                                {/* Certificate Preview */}
                                {((metadata.image && metadata.image.includes('pdf')) ||
                                    (metadata.properties?.files?.[0]?.type === 'application/pdf')) ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
                                            <iframe
                                                src={metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                                                width="100%"
                                                height="500px"
                                                style={{ border: "none", display: "block", background: "white" }}
                                                title="Certificate PDF"
                                            />
                                        </div>
                                        <a
                                            href={metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary"
                                            style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                                        >
                                            📄 Download PDF
                                        </a>
                                    </div>
                                ) : metadata.image ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <img
                                            src={metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
                                            alt="Certificate"
                                            style={{ maxWidth: "100%", borderRadius: 16, marginBottom: 20, border: "1px solid rgba(255,255,255,0.1)" }}
                                        />
                                    </div>
                                ) : (
                                    <CertificateCard metadata={metadata} tokenId={searchMode === "token" ? tokenId : "Portal"} />
                                )}
                            </div>
                        )}

                        {/* Error Display */}
                        {metadataError && (
                            <div style={{
                                padding: 16,
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: 12,
                                color: "#f87171",
                                textAlign: "center",
                                marginTop: 16
                            }}>
                                {metadataError}
                            </div>
                        )}

                        {searchMode === "token" && !owner && !isLoading && tokenId && (
                            <div style={{
                                padding: 16,
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: 12,
                                color: "#f87171",
                                textAlign: "center"
                            }}>
                                Token #{tokenId} does not exist on the blockchain
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status, text }: { status: "success" | "error" | "info"; text: string }) {
    const colors = {
        success: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.4)", color: "#4ade80", icon: "✓" },
        error: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)", color: "#f87171", icon: "✕" },
        info: { bg: "rgba(45, 212, 191, 0.15)", border: "rgba(45, 212, 191, 0.4)", color: "#2dd4bf", icon: "ℹ" }
    };
    const c = colors[status];

    return (
        <div style={{
            padding: "16px 24px",
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 16,
            color: c.color,
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10
        }}>
            <span style={{ fontSize: 18 }}>{c.icon}</span>
            {text}
        </div>
    );
}

function CertificateCard({ metadata, tokenId }: { metadata: any; tokenId: string }) {
    return (
        <div className="glass-card-light" style={{ padding: 32, textAlign: "center" }}>
            <div style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: "linear-gradient(135deg, #10b981 0%, #2dd4bf 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                margin: "0 auto 24px"
            }}>
                🎓
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 8 }}>
                {metadata.title || metadata.name || "Certificate"}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Awarded to <strong>{metadata.recipient_name}</strong>
            </p>
            <div className="chip" style={{ marginBottom: 16 }}>
                Token #{tokenId}
            </div>
            {metadata.description && (
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                    {metadata.description}
                </p>
            )}
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="shimmer" style={{ fontSize: 18, color: "white" }}>Loading...</div>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
