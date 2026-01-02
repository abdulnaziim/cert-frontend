"use client";

import { Box, Button, Card, CardContent, Container, Grid, Paper, Stack, Typography, useTheme, Zoom } from "@mui/material";
import Header from "../components/Landing/Header";
import { ArrowForward, School, VerifiedUser, Wallet } from "@mui/icons-material";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
    const { address, isConnected } = useAccount();
    const theme = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (isConnected && address) {
            const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").toLowerCase().split(",");
            setIsAdmin(adminWallets.includes(address.toLowerCase()));
        }
    }, [address, isConnected]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
            <Header />

            {/* Hero Section */}
            <Box sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                py: 8
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                                <Box>
                                    <ChipLatest />
                                    <Typography variant="h2" fontWeight="800" sx={{ mt: 3, mb: 2, background: 'linear-gradient(45deg, #1e40af 30%, #3b82f6 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
                                        The Trusted Standard <br /> for Digital Records
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 5, lineHeight: 1.6, maxWidth: 600, fontWeight: 500 }}>
                                        Empowering institutions to issue tamper-proof certificates that students own forever. Instant global verification, secured by Ethereum.
                                    </Typography>

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <Button
                                            component={Link}
                                            href="/verify"
                                            variant="contained"
                                            size="large"
                                            startIcon={<VerifiedUser />}
                                            sx={{ py: 1.5, px: 4, borderRadius: 2, fontSize: '1.1rem' }}
                                        >
                                            Verify a Certificate
                                        </Button>

                                        {isConnected ? (
                                            <Button
                                                component={Link}
                                                href={isAdmin ? "/admin" : "/student"}
                                                variant="outlined"
                                                size="large"
                                                endIcon={<ArrowForward />}
                                                sx={{ py: 1.5, px: 4, borderRadius: 2, fontSize: '1.1rem' }}
                                            >
                                                Go to {isAdmin ? "Issuer Dashboard" : "Student Dashboard"}
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                disabled
                                                startIcon={<Wallet />}
                                                sx={{ py: 1.5, px: 4, borderRadius: 2, fontSize: '1.1rem' }}
                                            >
                                                Connect Wallet to Begin
                                            </Button>
                                        )}
                                    </Stack>
                                </Box>
                            </Zoom>
                        </Grid>

                        {/* Feature Cards / Illustration */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                                <Stack spacing={3}>
                                    <FeatureCard
                                        icon={<School fontSize="large" color="primary" />}
                                        title="For Students"
                                        desc="Receive permanent, verifiable proof of your achievements directly to your wallet."
                                    />
                                    <FeatureCard
                                        icon={<VerifiedUser fontSize="large" color="secondary" />}
                                        title="For Verifiers"
                                        desc="Instantly validate credentials with cryptographic certainty. No intermediaries required."
                                    />
                                </Stack>
                            </Zoom>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={3} alignItems="flex-start">
                    <Box sx={{ p: 1.5, bgcolor: 'rgba(59, 130, 246, 0.08)', borderRadius: 3 }}>
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="700" gutterBottom>{title}</Typography>
                        <Typography variant="body2" color="text.secondary">{desc}</Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

function ChipLatest() {
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(59, 130, 246, 0.1)', px: 2, py: 0.8, borderRadius: 10, mb: 2 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
            <Typography variant="caption" fontWeight="700" color="primary">
                ENTERPRISE-GRADE INFRASTRUCTURE
            </Typography>
        </Box>
    );
}
