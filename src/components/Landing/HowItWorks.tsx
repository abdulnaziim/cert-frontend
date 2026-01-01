"use client";

import { Box, Container, Grid, Paper, Typography } from "@mui/material";

const steps = [
  { step: "01", title: "Connect", desc: "Admins connect wallets to access issuance tools" },
  { step: "02", title: "Issue", desc: "Provide recipient and IPFS CID to issue" },
  { step: "03", title: "Verify", desc: "Recipients view their issued CIDs instantly" },
  { step: "04", title: "Revoke", desc: "Admins can revoke tokens when needed" },
];

export default function HowItWorks() {
  return (
    <Box id="how" sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>How it works</Typography>
        <Grid container spacing={2}>
          {steps.map((s, i) => (
            <Grid size={{ xs: 12, md: 3 }} key={i}>
              <Paper sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'secondary.main',
                  bgcolor: 'rgba(139,92,246,0.05)'
                }
              }}>
                <Typography sx={{ fontSize: 12, color: "secondary.main", fontWeight: 700, mb: 1 }}>{s.step}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{s.title}</Typography>
                <Typography color="text.secondary" lineHeight={1.6}>{s.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}





