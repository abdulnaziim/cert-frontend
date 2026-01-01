"use client";

import { useAccount, useReadContract } from "wagmi";
import { CERT_ABI, getCertAddress } from "../lib/contracts";
import { useMemo } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip
} from "@mui/material";
import {
  Token as TokenIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Wallet as WalletIcon
} from "@mui/icons-material";

export default function ReceivedCertificates() {
  const { address, isConnected } = useAccount();
  const contract = getCertAddress();
  const owner = useMemo(() => address || "0x", [address]);

  const { data: cids, isFetching, refetch } = useReadContract({
    abi: CERT_ABI,
    address: contract,
    functionName: "getCIDs",
    args: [owner as `0x${string}`],
    query: { enabled: Boolean(contract) && Boolean(address) },
  });

  if (!isConnected) {
    return (
      <Card variant="outlined" sx={{ bgcolor: 'transparent', borderStyle: 'dashed' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <WalletIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Connect Wallet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connect your wallet to view your on-chain certificates.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <ConnectButton />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight="700">Your Wallet Collection</Typography>
        <Button
          onClick={() => refetch()}
          disabled={!contract || isFetching}
          startIcon={<RefreshIcon />}
          size="small"
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        {Array.isArray(cids) && (cids as string[]).length ? (
          <List disablePadding>
            {(cids as string[]).map((cid, i) => (
              <ListItem
                key={i}
                divider={i !== (cids as string[]).length - 1}
                secondaryAction={
                  <IconButton edge="end" href={`https://ipfs.io/ipfs/${cid}`} target="_blank">
                    <OpenInNewIcon color="primary" />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <TokenIcon color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" fontFamily="monospace">{cid}</Typography>}
                  secondary="IPFS Content Identifier"
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No certificates found in this wallet.</Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}
