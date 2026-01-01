"use client";

import { Alert, Box, Container, LinearProgress, Stack, Typography, Button } from "@mui/material";
import Header from "../../components/Landing/Header";
import { useEffect, useState, useMemo } from "react";
import { useAccount } from "wagmi";
import CertificateCard, { Certificate } from "../../components/dapp/CertificateCard";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function StudentDashboard() {
    const { address, isConnected } = useAccount();
    const [loading, setLoading] = useState(false);
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [error, setError] = useState("");

    const backendUrl = useMemo(() => {
        return process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
    }, []);

    useEffect(() => {
        async function fetchMyCerts() {
            if (!address) return;
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${backendUrl}/api/wallet/${address}/certificates`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch wallet data");
                const json = await res.json();

                // Map the response to our Certificate type
                // json.certificates is array of { token_id, on_chain_data, metadata }
                const validCerts = json.certificates
                    .filter((item: any) => item.metadata) // Only show ones we know about
                    .map((item: any) => ({
                        ...item.metadata,
                        token_id: item.token_id, // Ensure token_id comes from on-chain data
                        transaction_hash: item.on_chain_data?.hash || item.metadata.transaction_hash
                    }));

                setCerts(validCerts);
            } catch (e: any) {
                console.error(e);
                setError("Could not load your certificates. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        if (isConnected && address) {
            fetchMyCerts();
        }
    }, [address, isConnected, backendUrl]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Header />
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Student Dashboard
                    </Typography>
                    <Typography color="text.secondary">
                        View and manage your verified academic credentials.
                    </Typography>
                </Box>

                {!isConnected ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                        <Typography>Please connect your wallet to view your certificates.</Typography>
                        <ConnectButton />
                    </Box>
                ) : (
                    <Box>
                        {loading && <LinearProgress sx={{ mb: 4 }} />}
                        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                        {!loading && certs.length === 0 && (
                            <Alert severity="info" variant="outlined" sx={{ py: 2 }}>
                                No certificates found for wallet {address?.slice(0, 6)}...{address?.slice(-4)}.
                                If you were just issued one, please wait a few minutes for the blockchain to sync.
                            </Alert>
                        )}

                        <Stack spacing={3}>
                            {certs.map((c) => (
                                <CertificateCard key={c.id} cert={c} />
                            ))}
                        </Stack>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
