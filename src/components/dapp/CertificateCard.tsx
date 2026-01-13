"use client";

import { useState } from "react";
import { Box, Button, Card, CardContent, Chip, Stack, Typography, CircularProgress } from "@mui/material";
import { Verified as VerifiedIcon, OpenInNew as OpenInNewIcon, CloudUpload as CloudUploadIcon, QrCodeScanner as QrCodeScannerIcon } from "@mui/icons-material";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { CERT_NFT_ABI, getCertNftAddress } from "../../lib/contracts";
import toast from "react-hot-toast";
import Link from "next/link";
import QRCodeModal from "./QRCodeModal";

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
    const [showQR, setShowQR] = useState(false);

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
            // Use connected wallet as recipient (required)
            const recipientAddress = cert.recipient_address || address;
            if (!recipientAddress) {
                toast.error("No recipient address available");
                setMinting(false);
                return;
            }

            const hash = await writeContractAsync({
                abi: CERT_NFT_ABI,
                address: nftAddress!,
                functionName: "mint",
                args: [recipientAddress as `0x${string}`, cert.ipfs_cid],
            });

            toast.success("Transaction sent! Waiting for confirmation...");

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

            toast.success("Anchored to Sepolia! Refreshing...");
            window.location.reload();
        } catch (e: any) {
            console.error(e);
            toast.error(e.shortMessage || e.message || "Minting failed");
        } finally {
            setMinting(false);
        }
    }
    return (
        <Card variant="outlined" sx={{ '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(255,255,255,0.02)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }, transition: 'all 0.2s', borderRadius: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="800" color="text.primary" sx={{ mb: 0.5 }}>
                            {cert.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Issued to <b style={{ color: '#e2e8f0' }}>{cert.recipient_name}</b> <span style={{ opacity: 0.7 }}>({cert.recipient_email})</span>
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

                {(cert.token_id || cert.on_chain_id) ? (
                    <Box sx={{ mt: 1, p: 2, bgcolor: 'rgba(34, 197, 94, 0.1)', borderRadius: 2, fontFamily: 'monospace', fontSize: 13, border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Blockchain Verified</span>
                        <a
                            href={`https://sepolia.etherscan.io/nft/${process.env.NEXT_PUBLIC_CERTNFT_ADDRESS}/${cert.token_id || cert.on_chain_id}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ color: '#4ade80', wordBreak: 'break-all', textDecoration: 'none', fontWeight: 600 }}
                        >
                            View NFT on Etherscan ↗
                        </a>
                    </Box>
                ) : cert.transaction_hash ? (
                    <Box sx={{ mt: 1, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, fontFamily: 'monospace', fontSize: 13, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Blockchain Evidence</span>
                        <a
                            href={`https://sepolia.etherscan.io/tx/${cert.transaction_hash}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ color: '#60a5fa', wordBreak: 'break-all', textDecoration: 'none' }}
                        >
                            {cert.transaction_hash} ↗
                        </a>
                    </Box>
                ) : (
                    <Box sx={{ mt: 1, p: 2, bgcolor: 'rgba(234, 179, 8, 0.1)', borderRadius: 2, border: '1px dashed rgba(234, 179, 8, 0.3)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#facc15' }}>
                            ⚠️ This certificate hasn&apos;t been anchored to the blockchain yet. Please re-issue or wait for sync.
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
                            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, color: '#94a3b8', borderColor: 'rgba(255,255,255,0.2)' }}
                        >
                            Verify IPFS Data
                        </Button>
                        {(cert.token_id || cert.on_chain_id) && (
                            <>
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
                                <Button
                                    size="small"
                                    variant="text"
                                    color="secondary"
                                    startIcon={<QrCodeScannerIcon />}
                                    onClick={() => setShowQR(true)}
                                    sx={{ fontWeight: 600, color: '#34d399' }}
                                >
                                    QR Code
                                </Button>
                            </>
                        )}
                    </Box>
                )}
            </CardContent>

            {/* QR Code Modal for Verification */}
            <QRCodeModal
                open={showQR}
                onClose={() => setShowQR(false)}
                url={typeof window !== 'undefined' ? `${window.location.origin}/verify?mode=token&id=${cert.token_id || cert.on_chain_id}` : ''}
                title={`Verify Token #${cert.token_id || cert.on_chain_id}`}
            />
        </Card>
    );
}
