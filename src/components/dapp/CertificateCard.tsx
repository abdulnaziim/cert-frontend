import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { Verified as VerifiedIcon, OpenInNew as OpenInNewIcon } from "@mui/icons-material";

export type Certificate = {
    id: number;
    recipient_name: string;
    recipient_email: string;
    title: string;
    description?: string | null;
    issued_at?: string | null;
    transaction_hash?: string | null;
    ipfs_cid?: string | null;
    ipfs_url?: string | null;
    token_id?: number | null;
    on_chain_id?: string | null;
    created_at?: string;
    updated_at?: string;
};

interface CertificateCardProps {
    cert: Certificate;
}

export default function CertificateCard({ cert }: CertificateCardProps) {
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
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#fff7ed', borderRadius: 2, border: '1px dashed #fdba74' }}>
                        <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 600 }}>
                            ⚠️ This certificate hasn't been anchored to the blockchain yet. Please re-issue or wait for sync.
                        </Typography>
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
