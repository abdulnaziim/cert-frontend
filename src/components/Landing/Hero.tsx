"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Hero() {
  return (
    <Box sx={{
      py: { xs: 8, md: 16 },
      background: "radial-gradient(circle at 10% 20%, rgba(30,58,138,0.05) 0%, transparent 20%), radial-gradient(circle at 90% 10%, rgba(202,138,4,0.05) 0%, transparent 20%)"
    }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', textAlign: "center", mb: 2, color: "primary.main" }}>
          Verifiable Academic Credentials
        </Typography>
        <Typography variant="h5" sx={{ color: "text.secondary", textAlign: "center", maxWidth: 600, mx: 'auto', mb: 6, lineHeight: 1.5, fontWeight: 500 }}>
          The global standard for immutable university records.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
          <ConnectButton />
        </Box>
      </Container>
    </Box>
  );
}





