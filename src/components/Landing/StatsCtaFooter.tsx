"use client";

import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import Link from "next/link";

export default function StatsCtaFooter() {
  return (
    <>


      <Box sx={{ py: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Get started</Typography>
          <Typography sx={{ color: "#9ca3af", mt: 1 }}>Connect your wallet to view your certificates or proceed to the admin panel to issue.</Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
            <ConnectButton />
            <Button component={Link} href="/admin" variant="outlined" color="secondary">Go to Admin</Button>
          </Box>
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 4, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center", color: "#9ca3af" }}>
        © {new Date().getFullYear()} CertNFT — Built with love.
      </Box>
    </>
  );
}





