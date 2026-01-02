"use client";

import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  return (
    <AppBar position="sticky" elevation={0} sx={{
      borderBottom: "1px solid rgba(255,255,255,0.06)"
    }}>
      <Toolbar sx={{ gap: 2, py: 1.5 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: 24 }}>🎓</span> CertNFT
          </Typography>
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Button component={Link} href="/#features" sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main', bgcolor: 'rgba(30,58,138,0.04)' } }}>Features</Button>
          <Button component={Link} href="/#how" sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main', bgcolor: 'rgba(30,58,138,0.04)' } }}>How it works</Button>
          <Button component={Link} href="/verify" sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main', bgcolor: 'rgba(30,58,138,0.04)' } }}>Verify</Button>

          <DashboardLink />
        </Box>
        <Box sx={{ ml: 2 }}>
          <ConnectButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function DashboardLink() {
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

  if (!target) return null;

  return (
    <Button
      component={Link}
      href={target}
      variant="text"
      sx={{ fontWeight: 600, color: "#1e3a8a", bgcolor: "rgba(30,58,138,0.08)", '&:hover': { bgcolor: "rgba(30,58,138,0.15)" } }}
    >
      Dashboard
    </Button>
  );
}
