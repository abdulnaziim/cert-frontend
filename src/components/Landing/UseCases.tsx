"use client";

import { Box, Container, Grid, Paper, Typography } from "@mui/material";

const cases = [
  { title: "Universities", desc: "Issue academic certificates and transcripts" },
  { title: "Hackathons", desc: "Mint participation and winner badges" },
  { title: "Corporate", desc: "Training completion and compliance proofs" },
  { title: "Events", desc: "Attendance and access credentials" },
];

export default function UseCases() {
  return (
    <Box id="use-cases" sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Use cases</Typography>
        <Grid container spacing={2}>
          {cases.map((s, i) => (
            // @ts-expect-error Grid props type mismatch
            <Grid item xs={12} md={3} key={i}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{s.title}</Typography>
                <Typography sx={{ color: "#9ca3af", mt: 1 }}>{s.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}





