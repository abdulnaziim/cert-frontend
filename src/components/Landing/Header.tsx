"use client";

import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const { address, isConnected } = useAccount();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").toLowerCase().split(",");
      const isAdmin = adminWallets.includes(address.toLowerCase());
      setTarget(isAdmin ? "/admin" : "/student");
    } else {
      setTarget(null);
    }
  }, [address, isConnected]);

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: "transparent",
      borderBottom: "1px solid rgba(255,255,255,0.04)"
    }}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)",
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
            background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px"
          }}>
            CertNFT
          </span>
        </Link>

        {/* Navigation */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NavLink href="/#features">Features</NavLink>
          <NavLink href="/verify">Verify</NavLink>
          {target && <NavLink href={target} highlight>Dashboard</NavLink>}

          <div style={{ marginLeft: 16 }}>
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children, highlight }: { href: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 18px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        color: highlight ? "#818cf8" : "rgba(255,255,255,0.7)",
        background: highlight ? "rgba(99, 102, 241, 0.1)" : "transparent",
        border: highlight ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid transparent",
        textDecoration: "none",
        transition: "all 0.2s ease"
      }}
    >
      {children}
    </Link>
  );
}
