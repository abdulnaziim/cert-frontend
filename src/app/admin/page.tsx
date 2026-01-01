"use client";

import { Alert, Box, Container, Tab, Tabs, Typography } from "@mui/material";
import Header from "../../components/Landing/Header";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import CertificatesApiClient from "../../components/CertificatesApiClient";

// Better to create a dedicated view or import the issued list logic. 
// For now, let's rebuild the specific "Issuer View" here to be cleaner.
import AdminIssuedList from "../../components/dapp/AdminIssuedList";

export default function AdminDashboard() {
    const { address, isConnected } = useAccount();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        if (!isConnected) {
            setIsAdmin(false);
            return;
        }
        if (address) {
            const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").toLowerCase().split(",");
            setIsAdmin(adminWallets.includes(address.toLowerCase()));
        }
    }, [address, isConnected]);

    if (isAdmin === null) return null; // Loading state

    if (!isAdmin) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
                <Header />
                <Container maxWidth="md" sx={{ py: 8 }}>
                    <Alert severity="error" variant="filled">
                        Access Denied. You are not an authorized issuer.
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Header />
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Issuer Dashboard
                    </Typography>
                    <Typography color="text.secondary">
                        Manage your credentials and issuance.
                    </Typography>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                        <Tab label="Issue New Certificate" />
                        <Tab label="Registry & Sync" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Box>
                        <CertificatesApiClient />
                    </Box>
                )}

                {tab === 1 && (
                    <Box>
                        <AdminIssuedList />
                    </Box>
                )}

            </Container>
        </Box>
    );
}
