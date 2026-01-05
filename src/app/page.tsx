"use client";

import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import Header from "../components/Landing/Header";

export default function Home() {
    const { address, isConnected } = useAccount();
    const [isAdmin, setIsAdmin] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isConnected && address) {
            const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").toLowerCase().split(",");
            setIsAdmin(adminWallets.includes(address.toLowerCase()));
        }
    }, [address, isConnected]);

    // Interactive mouse glow effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                setMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="gradient-bg" style={{ minHeight: "100vh" }}>
            <Header />

            {/* Hero Section */}
            <div
                ref={heroRef}
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    padding: "100px 24px 40px",
                    overflow: "hidden"
                }}
            >
                {/* Interactive Glow Following Mouse */}
                <div style={{
                    position: "absolute",
                    left: mousePos.x - 200,
                    top: mousePos.y - 200,
                    width: 400,
                    height: 400,
                    background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
                    pointerEvents: "none",
                    transition: "left 0.3s ease-out, top 0.3s ease-out",
                    zIndex: 0
                }} />

                {/* Floating Orbs */}
                <div className="float" style={{
                    position: "absolute",
                    right: "10%",
                    top: "20%",
                    width: 300,
                    height: 300,
                    background: "radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(40px)",
                    animationDelay: "0s"
                }} />
                <div className="float" style={{
                    position: "absolute",
                    left: "5%",
                    bottom: "10%",
                    width: 200,
                    height: 200,
                    background: "radial-gradient(circle, rgba(244, 114, 182, 0.2) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(30px)",
                    animationDelay: "2s"
                }} />

                <div style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 80,
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1
                }}>
                    {/* Left: Content */}
                    <div style={{ maxWidth: 600 }}>
                        {/* Status Chip */}
                        <div className="chip" style={{ marginBottom: 32 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22d3ee", animation: "pulse-glow 2s infinite" }} />
                            Powered by Ethereum Blockchain
                        </div>

                        {/* Main Heading */}
                        <h1 style={{
                            fontSize: "clamp(40px, 5vw, 64px)",
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: 24,
                            letterSpacing: "-0.03em"
                        }}>
                            <span style={{ color: "white" }}>The Future of</span>
                            <br />
                            <span className="text-gradient">Academic Credentials</span>
                        </h1>

                        {/* Subtitle */}
                        <p style={{
                            fontSize: 18,
                            color: "rgba(255,255,255,0.7)",
                            lineHeight: 1.7,
                            marginBottom: 40,
                            maxWidth: 500
                        }}>
                            Issue tamper-proof certificates as NFTs. Verify instantly with
                            cryptographic certainty. No intermediaries, no forgery.
                        </p>

                        {/* CTA Buttons */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            <Link href="/verify">
                                <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12l2 2 4-4" />
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                    Verify Certificate
                                </button>
                            </Link>

                            {isConnected ? (
                                <Link href={isAdmin ? "/admin" : "/student"}>
                                    <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        {isAdmin ? "Issuer Dashboard" : "My Credentials"}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </Link>
                            ) : (
                                <button className="btn-secondary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
                                    Connect Wallet to Begin
                                </button>
                            )}
                        </div>

                        {/* Trust Indicators */}
                        <div style={{ marginTop: 48, display: "flex", gap: 32, opacity: 0.7 }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>10K+</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Certificates</div>
                            </div>
                            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>50+</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Institutions</div>
                            </div>
                            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>100%</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Verifiable</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: 3D Certificate Card Stack */}
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        perspective: "1000px"
                    }}>
                        <div style={{ position: "relative", width: 380, height: 480 }}>
                            {/* Background Card 2 */}
                            <div className="glass-card" style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                transform: "rotateY(-8deg) rotateX(5deg) translateZ(-40px) translateX(30px)",
                                opacity: 0.4,
                                background: "rgba(99, 102, 241, 0.1)"
                            }} />

                            {/* Background Card 1 */}
                            <div className="glass-card" style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                transform: "rotateY(-4deg) rotateX(2deg) translateZ(-20px) translateX(15px)",
                                opacity: 0.6,
                                background: "rgba(99, 102, 241, 0.08)"
                            }} />

                            {/* Main Card */}
                            <div className="glass-card glow-primary float" style={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                                padding: 32,
                                display: "flex",
                                flexDirection: "column",
                                animationDuration: "8s"
                            }}>
                                {/* Certificate Header */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: 24
                                }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 4 }}>
                                            CERTIFICATE OF ACHIEVEMENT
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>
                                            NFT #0042
                                        </div>
                                    </div>
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        background: "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{
                                    height: 1,
                                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                    marginBottom: 24
                                }} />

                                {/* Certificate Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>AWARDED TO</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>John Doe</div>
                                    </div>
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>PROGRAM</div>
                                        <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                                            Blockchain Development
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>ISSUED BY</div>
                                        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                                            Tech University
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingTop: 20,
                                    borderTop: "1px solid rgba(255,255,255,0.1)"
                                }}>
                                    <div>
                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>IPFS</div>
                                        <div style={{ fontSize: 12, fontFamily: "monospace", color: "#22d3ee" }}>
                                            Qm7x...k3n9
                                        </div>
                                    </div>
                                    <div className="chip" style={{
                                        background: "rgba(34, 197, 94, 0.2)",
                                        borderColor: "rgba(34, 197, 94, 0.4)",
                                        color: "#4ade80",
                                        fontSize: 10,
                                        padding: "6px 12px"
                                    }}>
                                        ✓ VERIFIED
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div style={{
                padding: "120px 24px",
                position: "relative",
                zIndex: 1
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 80 }}>
                        <h2 style={{
                            fontSize: 40,
                            fontWeight: 800,
                            color: "white",
                            marginBottom: 16
                        }}>
                            Why Choose <span className="text-gradient">CertNFT</span>?
                        </h2>
                        <p style={{
                            fontSize: 18,
                            color: "rgba(255,255,255,0.6)",
                            maxWidth: 600,
                            margin: "0 auto"
                        }}>
                            A revolutionary approach to credential verification
                        </p>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 24
                    }}>
                        <FeatureCard
                            icon="🔐"
                            title="Immutable & Secure"
                            desc="Certificates stored on Ethereum blockchain cannot be altered or forged."
                            gradient="linear-gradient(135deg, #6366f1, #818cf8)"
                        />
                        <FeatureCard
                            icon="⚡"
                            title="Instant Verification"
                            desc="Verify any credential in seconds with just a Token ID or IPFS hash."
                            gradient="linear-gradient(135deg, #22d3ee, #06b6d4)"
                        />
                        <FeatureCard
                            icon="🌐"
                            title="Decentralized Storage"
                            desc="Certificate metadata stored on IPFS ensures permanent availability."
                            gradient="linear-gradient(135deg, #f472b6, #ec4899)"
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                padding: "40px 24px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                textAlign: "center",
                color: "rgba(255,255,255,0.4)",
                fontSize: 14
            }}>
                © {new Date().getFullYear()} CertNFT — Built with ❤️ on Ethereum
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, gradient }: { icon: string; title: string; desc: string; gradient: string }) {
    return (
        <div className="glass-card" style={{
            padding: 32,
            transition: "all 0.3s ease",
            cursor: "default"
        }}>
            <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginBottom: 20,
                boxShadow: `0 10px 40px ${gradient.includes('6366f1') ? 'rgba(99,102,241,0.3)' : gradient.includes('22d3ee') ? 'rgba(34,211,238,0.3)' : 'rgba(244,114,182,0.3)'}`
            }}>
                {icon}
            </div>
            <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                color: "white",
                marginBottom: 12
            }}>
                {title}
            </h3>
            <p style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.6
            }}>
                {desc}
            </p>
        </div>
    );
}
