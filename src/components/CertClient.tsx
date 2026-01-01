"use client";

import { useReadContract, useWriteContract } from "wagmi";
import { useState, useMemo } from "react";
import { CERT_ABI, getCertAddress } from "../lib/contracts";
import toast from "react-hot-toast";
import { useSmartAccount } from "../hooks/useSmartAccount";
import { useDevMode } from "../contexts/DevModeContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
  Link,
  IconButton
} from "@mui/material";
import {
  Sensors as SensorsIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  OpenInNew as OpenInNewIcon
} from "@mui/icons-material";

export default function CertClient() {
  const { address: connectedAddress, isConnected } = useSmartAccount();
  const { isDevMode } = useDevMode();
  const contractAddress = getCertAddress();

  const [owner, setOwner] = useState<string>("");
  const [cid, setCid] = useState<string>("");

  const targetOwner = useMemo(() => (owner || connectedAddress || "0x"), [owner, connectedAddress]);

  const { data: cids, refetch, isFetching } = useReadContract({
    abi: CERT_ABI,
    address: contractAddress,
    functionName: "getCIDs",
    args: [targetOwner as `0x${string}`],
    query: {
      enabled: !isDevMode && Boolean(contractAddress) && Boolean(targetOwner && targetOwner !== "0x"),
    },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  async function handleIssue() {
    if (!isConnected || !connectedAddress || !cid) return;
    try {
      if (isDevMode) {
        await toast.promise(
          new Promise((resolve) => setTimeout(resolve, 1000)),
          { loading: "Issuing (Simulated)...", success: "Issued (Simulated)", error: "Failed" }
        );
        setCid("");
        return;
      }

      if (!contractAddress) return;

      await toast.promise(
        writeContractAsync({
          abi: CERT_ABI,
          address: contractAddress,
          functionName: "issue",
          args: [connectedAddress, cid],
        }),
        {
          loading: "Issuing certificate...",
          success: "Certificate issued",
          error: (e) => e?.shortMessage || e?.message || "Failed to issue",
        }
      );
      setCid("");
      await refetch();
    } catch {
      // handled by toast
    }
  }

  return (
    <Card variant="outlined" sx={{ width: "100%", maxWidth: 640 }}>
      <CardContent>
        <Stack spacing={3}>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SensorsIcon color="primary" /> On-Chain Interaction
            </Typography>
            {!contractAddress && (
              <Chip label="Contract Not Set" color="error" size="small" variant="outlined" />
            )}
          </Box>

          {/* Read Section */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Check Wallet Holdings
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Owner Address (Empty = You)"
                sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
              />
              <Button
                variant="outlined"
                onClick={() => refetch()}
                disabled={!contractAddress || isFetching}
                startIcon={<RefreshIcon />}
              >
                Load
              </Button>
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, minHeight: 60, maxHeight: 200, overflowY: 'auto', border: '1px solid #e2e8f0' }}>
              {Array.isArray(cids) && cids.length > 0 ? (
                <Stack spacing={1}>
                  {(cids as string[]).map((val, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                      <Typography variant="caption" fontFamily="monospace" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                        {val}
                      </Typography>
                      {val.startsWith('bafybei') && val.length < 50 ? (
                        <Chip label="Sim" size="small" color="warning" sx={{ height: 20, fontSize: 10 }} />
                      ) : (
                        <IconButton
                          size="small"
                          href={`https://gateway.pinata.cloud/ipfs/${val}`}
                          target="_blank"
                        >
                          <OpenInNewIcon fontSize="inherit" color="primary" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.disabled" align="center" sx={{ mt: 1 }}>
                  No CIDs found on-chain for this address.
                </Typography>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Write Section */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Manual Issue (Advanced)
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                placeholder="IPFS CID String"
              />
              <Button
                variant="contained"
                onClick={handleIssue}
                disabled={!isConnected || !contractAddress || isPending || !cid}
                startIcon={<SendIcon />}
              >
                {isPending ? "..." : "Issue"}
              </Button>
            </Box>
          </Box>

        </Stack>
      </CardContent>
    </Card>
  );
}
