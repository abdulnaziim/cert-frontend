"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { School as SchoolIcon } from "@mui/icons-material";
import Header from "../components/Landing/Header";

export default function Home() {
    const { address, isConnected } = useAccount();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (isConnected && address) {
            const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").toLowerCase().split(",");
            setIsAdmin(adminWallets.includes(address.toLowerCase()));
        }
    }, [address, isConnected]);

    return (
        <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Header />

            {/* Main Content - Centered */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "120px 24px 60px",
                textAlign: "center",
                position: "relative",
                zIndex: 1
            }}>
                {/* Logo */}
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: 24,
                    background: "linear-gradient(135deg, #10b981 0%, #2dd4bf 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    marginBottom: 32,
                    boxShadow: "0 20px 60px rgba(16, 185, 129, 0.4)"
                }}>
                    <SchoolIcon sx={{ fontSize: 48, color: 'white' }} />
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: "clamp(36px, 6vw, 56px)",
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 16,
                    letterSpacing: "-0.03em"
                }}>
                    CertNFT
                </h1>

                {/* Subtitle */}
                <p style={{
                    fontSize: 18,
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: 48,
                    maxWidth: 400
                }}>
                    Blockchain-powered certificate verification
                </p>

                {/* Action Cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 24,
                    maxWidth: 700,
                    width: "100%"
                }}>
                    {/* Issuers/Students Card */}
                    <div className="glass-card" style={{
                        padding: 40,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minHeight: 320
                    }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            background: "rgba(59, 130, 246, 0.15)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            marginBottom: 20
                        }}>
                            👤
                        </div>
                        <h3 style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "white",
                            marginBottom: 8,
                            textAlign: "center"
                        }}>
                            Issuers & Students
                        </h3>
                        <p style={{
                            fontSize: 14,
                            color: "rgba(255,255,255,0.5)",
                            textAlign: "center",
                            flex: 1
                        }}>
                            Connect your wallet to access your dashboard
                        </p>

                        {isConnected ? (
                            <Link href={isAdmin ? "/admin" : "/student"} style={{ width: "100%", marginTop: 24 }}>
                                <button style={{
                                    width: "100%",
                                    height: 52,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 10,
                                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 12,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}>
                                    Go to Dashboard
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </Link>
                        ) : (
                            <div style={{ width: "100%", marginTop: 24 }}>
                                <ConnectButton.Custom>
                                    {({ openConnectModal }) => (
                                        <button
                                            onClick={openConnectModal}
                                            style={{
                                                width: "100%",
                                                height: 52,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 10,
                                                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 12,
                                                fontSize: 16,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="2" y="6" width="20" height="12" rx="2" />
                                                <path d="M22 10H2" />
                                            </svg>
                                            Connect Wallet
                                        </button>
                                    )}
                                </ConnectButton.Custom>
                            </div>
                        )}
                    </div>

                    {/* Verifiers Card */}
                    <div className="glass-card" style={{
                        padding: 40,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minHeight: 320
                    }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            background: "rgba(59, 130, 246, 0.15)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            marginBottom: 20
                        }}>
                            ✓
                        </div>
                        <h3 style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "white",
                            marginBottom: 8,
                            textAlign: "center"
                        }}>
                            Verifiers
                        </h3>
                        <p style={{
                            fontSize: 14,
                            color: "rgba(255,255,255,0.5)",
                            textAlign: "center",
                            flex: 1
                        }}>
                            Verify the authenticity of any certificate
                        </p>

                        <Link href="/verify" style={{ width: "100%", marginTop: 24 }}>
                            <button style={{
                                width: "100%",
                                height: 52,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 10,
                                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: 12,
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                                Verify Certificate
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                padding: "24px",
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: 13
            }}>
                © {new Date().getFullYear()} CertNFT
            </footer>
        </div>
    );
}
