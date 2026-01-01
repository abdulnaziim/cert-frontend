"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Container,
    LinearProgress,
    Stack,
    Alert,
    Typography
} from "@mui/material";
import { Verified as VerifiedIcon } from "@mui/icons-material";
import CertificateCard, { Certificate } from "./CertificateCard";

type PaginatedResponse = {
    data: Certificate[];
    current_page: number;
    last_page: number;
};

export default function AdminIssuedList() {
    const backendUrl = useMemo(() => {
        return process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
    }, []);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [certs, setCerts] = useState<Certificate[]>([]);

    async function fetchCertificates(doSync = false) {
        setLoading(true);
        setError("");
        try {
            if (doSync) {
                const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "").split(",");
                // Also add the primary deployer wallet if not included
                const walletsToSync = [...new Set([...adminWallets, "0xB316c66113e78a5781600296229F6551832e8D79"])].filter(Boolean);

                for (const wallet of walletsToSync) {
                    try {
                        await fetch(`${backendUrl}/api/certificates/sync`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ address: wallet }),
                        });
                    } catch (e) {
                        console.warn("Sync failed for", wallet, e);
                    }
                }
            }

            const res = await fetch(`${backendUrl}/api/certificates`, { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
            const json: PaginatedResponse = await res.json();
            setCerts(json?.data || []);
        } catch (e: any) {
            setError(e?.message || "Failed to fetch certificates");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCertificates();
    }, [backendUrl]);

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    Global Registry Status
                </Typography>
                <Button
                    onClick={() => fetchCertificates(true)}
                    disabled={loading}
                    size="small"
                    variant="contained"
                    startIcon={<VerifiedIcon />}
                    sx={{ borderRadius: 2 }}
                >
                    {loading ? "Syncing..." : "Check Sync"}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {loading && <LinearProgress sx={{ mb: 3 }} />}

            {certs.length === 0 && !loading ? (
                <Typography color="text.secondary" align="center" sx={{ py: 8 }}>Registry is empty.</Typography>
            ) : (
                <Stack spacing={3}>
                    {certs.map((c) => (
                        <CertificateCard key={c.id} cert={c} />
                    ))}
                </Stack>
            )}
        </Box>
    );
}
