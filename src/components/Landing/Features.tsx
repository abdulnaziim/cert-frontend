"use client";

import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BoltIcon from "@mui/icons-material/Bolt";

const items = [
  { icon: <SecurityIcon />, title: "Immutable records", desc: "Certificates stored as IPFS CIDs and NFTs" },
  { icon: <VerifiedUserIcon />, title: "Verifiable", desc: "On-chain proofs with transparent revocation" },
  { icon: <BoltIcon />, title: "Instant issuance", desc: "Admins issue credentials in seconds" },
];

export default function Features() {
  return (
    <Box id="features" sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          {items.map((it, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Paper sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(59,130,246,0.05)'
                }
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Box sx={{ color: 'primary.main' }}>{it.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{it.title}</Typography>
                </Box>
                <Typography color="text.secondary" lineHeight={1.6}>{it.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}





