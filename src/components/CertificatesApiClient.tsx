"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { CERT_NFT_ABI, getCertNftAddress } from "../lib/contracts";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  LinearProgress,
  Alert,
  CircularProgress
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccountBalanceWallet as WalletIcon,
  CloudUpload as CloudUploadIcon,
  Verified as VerifiedIcon,
  PictureAsPdf as PdfIcon,
  OpenInNew as OpenInNewIcon
} from "@mui/icons-material";
import toast from "react-hot-toast";

type Certificate = {
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

type PaginatedResponse = {
  data: Certificate[];
  current_page: number;
  last_page: number;
};

export default function CertificatesApiClient() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const nftAddress = getCertNftAddress();

  const backendUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
  }, []);

  const [loading, setLoading] = useState<boolean>(false);
  const [minting, setMinting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [certs, setCerts] = useState<Certificate[]>([]);

  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  async function fetchCertificates() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${backendUrl}/api/certificates`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      const json: PaginatedResponse = await res.json();
      setCerts(json?.data || []);
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(e?.message || "Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMinting(true);

    try {
      if (!isConnected || !address) throw new Error("Please connect your wallet first.");
      if (!nftAddress) throw new Error("Contract address not configured.");

      // 1. Create on Backend (Metadata & PDF)
      const formData = new FormData();
      formData.append("recipient_name", recipientName);
      formData.append("recipient_email", recipientEmail);
      if (recipientAddress) formData.append("recipient_address", recipientAddress);
      else formData.append("recipient_address", address); // Default to issuer if not specified? Or require it? User said "defaults to connected" in other file, but typically cert is for student.
      // If student address is blank, we can't mint to them. Let's assume input or fallback.
      // Actually, if it's blank, the backend might complain if we try to mint.
      // For this flow, we need a target address. 
      const targetAddress = recipientAddress || address;

      formData.append("title", title);
      if (description) formData.append("description", description);
      if (file) formData.append("certificate_file", file);
      formData.append("skip_blockchain", "1"); // IMPORTANT: Don't mint on server

      const res = await fetch(`${backendUrl}/api/certificates`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Backend creation failed: ${res.status} ${t}`);
      }

      const certData = await res.json();
      const ipfsCid = certData.ipfs_cid;
      const certId = certData.id;

      if (!ipfsCid) throw new Error("Backend did not return IPFS CID.");

      // 2. Mint on Blockchain (User Signs)
      console.log("Minting for", targetAddress, "CID:", ipfsCid);

      const hash = await writeContractAsync({
        abi: CERT_NFT_ABI,
        address: nftAddress,
        functionName: "mint",
        args: [targetAddress as `0x${string}`, ipfsCid],
      });

      toast.success("Transaction sent! Waiting for confirmation...");

      // 3. Wait for Receipt
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // 4. Confirm to Backend
      await fetch(`${backendUrl}/api/certificates/${certId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_hash: hash })
      });

      toast.success("Certificate successfully issued & verified!");

      // Cleanup
      setRecipientName("");
      setRecipientEmail("");
      setRecipientAddress("");
      setTitle("");
      setDescription("");
      setFile(null);
      await fetchCertificates();

    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(e);
      setError(e?.shortMessage || e?.message || "Failed to create certificate");
      toast.error("Failed to issue certificate.");
    } finally {
      setMinting(false);
    }
  }

  useEffect(() => {
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  return (
    <Stack spacing={4} sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>

      {/* 1. Header & Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5" fontWeight="700">Certificate Manager</Typography>
          <Typography variant="body2" color="text.secondary">
            Issuing as: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchCertificates}
          disabled={loading || minting}
          size="small"
        >
          {loading ? "Syncing..." : "Refresh Data"}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <LinearProgress color="secondary" sx={{ borderRadius: 1 }} />}

      {/* 2. Create Certificate Form */}
      <Paper sx={{ p: 4, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
        {minting && (
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(255,255,255,0.8)', zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 2, fontWeight: 600 }}>Please sign the transaction in your wallet...</Typography>
          </Box>
        )}

        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
          Issue New Certificate
        </Typography>
        <form onSubmit={handleCreate}>
          <Grid container spacing={3}>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Recipient Name"
                fullWidth
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Recipient Email"
                type="email"
                fullWidth
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="action" /></InputAdornment> }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Student Wallet Address (0x...)"
                placeholder="Required for direct issuance"
                fullWidth
                required
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><WalletIcon fontSize="small" color="action" /></InputAdornment>,
                  sx: { fontFamily: 'monospace' }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Certificate Title"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ height: 50, borderStyle: 'dashed' }}
              >
                {file ? file.name : "Upload PDF Document (Optional)"}
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </Button>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || minting || !recipientName || !recipientEmail || !title || !isConnected || !recipientAddress}
                sx={{ mt: 1 }}
              >
                {minting ? "Processing Transaction..." : isConnected ? "Sign & Issue Certificate" : "Connect Wallet to Issue"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>


    </Stack>
  );
}
