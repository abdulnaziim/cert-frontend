"use client";

import { useState } from "react";
import { Box, Button, Card, CardContent, Chip, Stack, Typography, CircularProgress } from "@mui/material";
import { Verified as VerifiedIcon, OpenInNew as OpenInNewIcon, CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { CERT_NFT_ABI, getCertNftAddress } from "../../lib/contracts";
import toast from "react-hot-toast";
import Link from "next/link";

export type Certificate = {
    id: number;
    recipient_name: string;
    recipient_email: string;
    recipient_address?: string | null;
    title: string;
    description?: string | null;
    issued_at?: string | null;
    transaction_hash?: string | null;
    ipfs_cid?: string | null;
    ipfs_url?: string | null;
    token_id?: number | null;
    on_chain_id?: string | null;
    skip_blockchain?: number | boolean | null;
    created_at?: string;
    updated_at?: string;
};

interface CertificateCardProps {
    cert: Certificate;
}

export default function CertificateCard({ cert }: CertificateCardProps) {
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const { isConnected, address } = useAccount();
    const nftAddress = getCertNftAddress();
    const [minting, setMinting] = useState(false);

    async function handleConfirmMint() {
        if (!isConnected) {
            toast.error("Connect wallet first");
            return;
        }
        if (!cert.ipfs_cid) {
            toast.error("Missing IPFS data");
            return;
        }

        setMinting(true);
        try {
            const hash = await writeContractAsync({
                abi: CERT_NFT_ABI,
                address: nftAddress!,
                functionName: "mint",
                args: [(cert.recipient_address || "0x0000000000000000000000000000000000000000") as `0x${string}`, cert.ipfs_cid],
            });

            toast.success("Transaction sent! Waiting...");

            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash });
            }

            // Update backend
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
            await fetch(`${backendUrl}/api/certificates/${cert.id}/confirm`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transaction_hash: hash })
            });

            toast.success("Anchored successfully! Please refresh.");
            window.location.reload();
        } catch (e: any) {
            console.error(e);
            toast.error(e.shortMessage || "Minting failed");
        } finally {
            setMinting(false);
        }
    }
    return (
        <Card variant="outlined" sx={{ '&:hover': { borderColor: 'primary.main', bgcolor: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }, transition: 'all 0.2s', borderRadius: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="800" color="text.primary">
                            {cert.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Issued to <b>{cert.recipient_name}</b> ({cert.recipient_email})
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        {(cert.token_id || cert.on_chain_id) ? (
                            <Chip
                                label={`NFT #${cert.token_id || cert.on_chain_id}`}
                                size="small"
                                color="primary"
                                icon={<VerifiedIcon />}
                                sx={{ fontWeight: 800, borderRadius: 1.5 }}
                            />
                        ) : cert.transaction_hash ? (
                            <Chip
                                label="Syncing..."
                                size="small"
                                variant="outlined"
                                color="warning"
                                sx={{ fontWeight: 700, borderRadius: 1.5 }}
                            />
                        ) : (
                            <Chip
                                label="Off-chain"
                                size="small"
                                variant="outlined"
                                color="default"
                                sx={{ fontWeight: 600, borderRadius: 1.5 }}
                            />
                        )}
                    </Stack>
                </Box>

                {cert.transaction_hash ? (
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f8fafb', borderRadius: 2, fontFamily: 'monospace', fontSize: 12, border: '1px solid #eef2f6', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>Blockchain Evidence</span>
                        <a
                            href={`https://sepolia.etherscan.io/tx/${cert.transaction_hash}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ color: '#3b82f6', wordBreak: 'break-all', textDecoration: 'none' }}
                        >
                            {cert.transaction_hash} ↗
                        </a>
                    </Box>
                ) : (cert.token_id || cert.on_chain_id) ? (
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, fontFamily: 'monospace', fontSize: 12, border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#166534', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>Blockchain Verified</span>
                        <a
                            href={`https://sepolia.etherscan.io/nft/${process.env.NEXT_PUBLIC_CERTNFT_ADDRESS}/${cert.token_id || cert.on_chain_id}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ color: '#15803d', wordBreak: 'break-all', textDecoration: 'none', fontWeight: 600 }}
                        >
                            View NFT on Etherscan ↗
                        </a>
                    </Box>
                ) : (
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#fff7ed', borderRadius: 2, border: '1px dashed #fdba74', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 600 }}>
                            ⚠️ This certificate hasn't been anchored to the blockchain yet. Please re-issue or wait for sync.
                        </Typography>
                        {address && (
                            <Button
                                size="small"
                                variant="contained"
                                color="warning"
                                startIcon={minting ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                                onClick={handleConfirmMint}
                                disabled={minting}
                            >
                                {minting ? "Minting..." : "Anchor to Blockchain Now"}
                            </Button>
                        )}
                    </Box>
                )}

                {(cert.ipfs_cid || cert.ipfs_url) && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            href={cert.ipfs_url || `https://gateway.pinata.cloud/ipfs/${cert.ipfs_cid}`}
                            target="_blank"
                            startIcon={<OpenInNewIcon />}
                            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                        >
                            Verify IPFS Data
                        </Button>
                        {(cert.token_id || cert.on_chain_id) && (
                            <Button
                                component={Link}
                                size="small"
                                variant="text"
                                color="primary"
                                href={`/verify?mode=token&id=${cert.token_id || cert.on_chain_id}`}
                                sx={{ fontWeight: 600 }}
                            >
                                Verify Publicly
                            </Button>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
