"use client";

import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import QRCode from "react-qr-code";

interface QRCodeModalProps {
    open: boolean;
    onClose: () => void;
    url: string;
    title?: string;
}

export default function QRCodeModal({ open, onClose, url, title = "Scan to Verify" }: QRCodeModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    bgcolor: '#0f172a',
                    backgroundImage: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    maxWidth: 360,
                    width: '100%'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                pb: 2
            }}>
                <Typography variant="h6" fontWeight="700" color="white">
                    {title}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 3 }}>
                <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <QRCode value={url} size={200} />
                </Box>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                    Scan this QR code with any camera to verify the certificate authenticity on the blockchain.
                </Typography>

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={onClose}
                    sx={{
                        borderRadius: 1.5,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255, 255, 255, 0.05)'
                        }
                    }}
                >
                    Close
                </Button>
            </DialogContent>
        </Dialog>
    );
}
