# Frontend Access Guide - Smart Contracts

Complete guide on how to access and interact with smart contracts from the Next.js frontend.

## 🚀 Quick Setup

### 1. Create Environment File

Create `cert-frontend/.env.local`:

```env
# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

# Contract addresses (from deployment)
NEXT_PUBLIC_CERT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CERTNFT_ADDRESS=0x0000000000000000000000000000000000000000

# Admin wallet addresses (comma-separated, for admin panels)
NEXT_PUBLIC_ADMIN_WALLETS=0xAdmin1,0xAdmin2
```

### 2. Install Dependencies

```bash
cd cert-frontend
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## 📖 How Contract Access Works

The frontend uses **Wagmi** and **RainbowKit** to interact with contracts:

1. **Wagmi Provider** - Wraps the app (configured in `src/app/providers.tsx`)
2. **Contract ABIs** - Defined in `src/lib/contracts.ts`
3. **Contract Addresses** - Loaded from environment variables
4. **Wagmi Hooks** - Used in components to read/write contracts

---

## 🔧 Accessing Contracts in Your Components

### Basic Pattern

All contract interactions follow this pattern:

```tsx
"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CERT_ABI, getCertAddress } from "../lib/contracts";

export default function MyComponent() {
  // Get contract address from environment
  const contractAddress = getCertAddress();
  
  // Get connected wallet info
  const { address, isConnected } = useAccount();
  
  // Read from contract
  const { data, isLoading } = useReadContract({
    abi: CERT_ABI,
    address: contractAddress,
    functionName: "getCIDs",
    args: [address],
  });
  
  // Write to contract
  const { writeContractAsync, isPending } = useWriteContract();
  
  // Your component JSX...
}
```

### Available Helper Functions

From `src/lib/contracts.ts`:

- `getCertAddress()` - Returns Cert contract address
- `getCertNftAddress()` - Returns CertificateNFT contract address
- `CERT_ABI` - Cert contract ABI (for useReadContract/useWriteContract)
- `CERT_NFT_ABI` - CertificateNFT contract ABI

---

## 📝 Reading Contract Data

Use `useReadContract` hook:

```tsx
import { useReadContract } from "wagmi";
import { CERT_ABI, getCertAddress } from "../lib/contracts";

function CertificatesList() {
  const { address } = useAccount();
  const contractAddress = getCertAddress();
  
  const { data: cids, isLoading, refetch } = useReadContract({
    abi: CERT_ABI,
    address: contractAddress,
    functionName: "getCIDs",
    args: [address as `0x${string}`],
    query: {
      enabled: Boolean(contractAddress) && Boolean(address),
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {cids?.map((cid, i) => <div key={i}>{cid}</div>)}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

**Key points:**
- `enabled` - Only fetch when conditions are met
- `refetch()` - Manually refresh data
- `isLoading` - Loading state
- Type cast addresses as `0x${string}` for TypeScript

---

## ✍️ Writing to Contracts

Use `useWriteContract` hook:

```tsx
import { useWriteContract } from "wagmi";
import { CERT_ABI, getCertAddress } from "../lib/contracts";
import toast from "react-hot-toast";

function IssueCertificate() {
  const { address, isConnected } = useAccount();
  const contractAddress = getCertAddress();
  const { writeContractAsync, isPending } = useWriteContract();
  
  async function handleIssue(cid: string) {
    if (!isConnected || !contractAddress || !address) return;
    
    try {
      await toast.promise(
        writeContractAsync({
          abi: CERT_ABI,
          address: contractAddress,
          functionName: "issue",
          args: [address, cid],
        }),
        {
          loading: "Issuing certificate...",
          success: "Certificate issued!",
          error: (e) => e?.shortMessage || "Failed",
        }
      );
      
      // Optionally refetch data after transaction
      // await refetch();
    } catch (e) {
      // Error handled by toast
    }
  }
  
  return (
    <button 
      onClick={() => handleIssue("bafy...")}
      disabled={isPending || !isConnected}
    >
      {isPending ? "Processing..." : "Issue Certificate"}
    </button>
  );
}
```

**Key points:**
- `toast.promise()` - Shows loading/success/error notifications
- `isPending` - Transaction is being processed
- Check `isConnected` before allowing writes
- Handle errors gracefully

---

## 🎯 Available Components

### 1. CertClient (`src/components/CertClient.tsx`)

**Purpose:** Issue and view certificates from `Cert.sol`

**Features:**
- View CIDs for any address
- Issue new certificate CID to connected wallet

**Usage:**
```tsx
import CertClient from "../components/CertClient";

export default function Page() {
  return <CertClient />;
}
```

### 2. CertNftClient (`src/components/CertNftClient.tsx`)

**Purpose:** Mint and revoke CertificateNFT tokens

**Features:**
- Mint NFT with IPFS CID (requires ISSUER_ROLE)
- Revoke NFT by tokenId (requires admin role)

**Usage:**
```tsx
import CertNftClient from "../components/CertNftClient";

export default function Page() {
  return <CertNftClient />;
}
```

### 3. AdminPanel (`src/components/AdminPanel.tsx`)

**Purpose:** Admin-only functions

**Features:**
- View CIDs for any address
- Issue CID to any address
- Revoke CertificateNFT tokens

**Usage:**
```tsx
import AdminPanel from "../components/AdminPanel";

export default function AdminPage() {
  return <AdminPanel />;
}
```

**Access Control:**
- Only wallets listed in `NEXT_PUBLIC_ADMIN_WALLETS` can access
- Uses `isAdmin()` from `src/lib/admin.ts`

### 4. ReceivedCertificates (`src/components/ReceivedCertificates.tsx`)

**Purpose:** Display certificates received by connected wallet

**Features:**
- Auto-loads CIDs for connected wallet
- Shows connection prompt if wallet not connected

**Usage:**
```tsx
import ReceivedCertificates from "../components/ReceivedCertificates";

export default function Page() {
  return <ReceivedCertificates />;
}
```

---

## 🔐 Access Control

### Admin Access

Admin wallets are configured via environment variable:

```env
NEXT_PUBLIC_ADMIN_WALLETS=0x123...,0x456...
```

Check if a wallet is admin:

```tsx
import { useAccount } from "wagmi";
import { isAdmin } from "../lib/admin";

function MyComponent() {
  const { address } = useAccount();
  const hasAccess = isAdmin(address);
  
  if (!hasAccess) {
    return <div>Access denied</div>;
  }
  
  return <div>Admin content</div>;
}
```

---

## 🌐 Network Configuration

Supported networks (configured in `src/app/providers.tsx`):

- **Mainnet** - Ethereum mainnet
- **Sepolia** - Sepolia testnet
- **Localhost** - Local Hardhat node (http://localhost:8545)

Users can switch networks via RainbowKit connect button.

**Important:** Contract addresses must match the selected network!

---

## 📋 Contract Function Reference

### Cert.sol Functions

**Read:**
- `getCIDs(address owner) → string[]` - Get all CIDs for an address

**Write:**
- `issue(address to, string cid)` - Issue a certificate CID
  - No access control - anyone can call
  - Emits `Issued(to, cid)` event

**Example:**
```tsx
// Read
const { data: cids } = useReadContract({
  abi: CERT_ABI,
  address: getCertAddress(),
  functionName: "getCIDs",
  args: ["0x..."],
});

// Write
await writeContractAsync({
  abi: CERT_ABI,
  address: getCertAddress(),
  functionName: "issue",
  args: ["0x...", "bafy..."],
});
```

### CertificateNFT.sol Functions

**Read:**
- `tokenURI(uint256 tokenId) → string` - Get token URI
  - Reverts if token is revoked

**Write:**
- `mint(address to, string ipfsCid) → uint256` - Mint a certificate NFT
  - Requires `ISSUER_ROLE` on contract
  - Returns tokenId
  
- `revoke(uint256 tokenId)` - Revoke a certificate
  - Requires `DEFAULT_ADMIN_ROLE` on contract

**Example:**
```tsx
// Mint (requires ISSUER_ROLE)
await writeContractAsync({
  abi: CERT_NFT_ABI,
  address: getCertNftAddress(),
  functionName: "mint",
  args: ["0x...", "bafy..."],
});

// Revoke (requires admin role)
await writeContractAsync({
  abi: CERT_NFT_ABI,
  address: getCertNftAddress(),
  functionName: "revoke",
  args: [BigInt(1)], // tokenId
});
```

---

## 🎨 Available Pages

### `/` - Home Page
- Landing page with features
- Received certificates component

### `/admin` - Admin Panel
- Access controlled (admin wallets only)
- Full admin functions

### `/nss` - NSS Admin
- Admin panel (access controlled)

### `/ieee` - IEEE Admin
- Admin panel (access controlled)

---

## 🔄 Complete Example: Custom Component

Here's a complete example of a custom component that interacts with contracts:

```tsx
"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CERT_ABI, getCertAddress } from "../lib/contracts";
import toast from "react-hot-toast";

export default function CustomCertComponent() {
  const { address, isConnected } = useAccount();
  const contractAddress = getCertAddress();
  const [newCid, setNewCid] = useState("");
  
  // Read certificates
  const { data: cids, isLoading, refetch } = useReadContract({
    abi: CERT_ABI,
    address: contractAddress,
    functionName: "getCIDs",
    args: [address as `0x${string}`],
    query: {
      enabled: Boolean(contractAddress) && Boolean(address),
    },
  });
  
  // Write contract
  const { writeContractAsync, isPending } = useWriteContract();
  
  async function handleIssue() {
    if (!isConnected || !contractAddress || !address || !newCid) {
      toast.error("Please connect wallet and enter CID");
      return;
    }
    
    try {
      await toast.promise(
        writeContractAsync({
          abi: CERT_ABI,
          address: contractAddress,
          functionName: "issue",
          args: [address, newCid],
        }),
        {
          loading: "Issuing...",
          success: "Certificate issued!",
          error: (e) => e?.shortMessage || "Failed to issue",
        }
      );
      
      setNewCid("");
      await refetch(); // Refresh the list
    } catch (e) {
      // Error handled by toast
    }
  }
  
  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }
  
  return (
    <div style={{ padding: 20 }}>
      <h2>My Certificates</h2>
      
      {/* Input form */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={newCid}
          onChange={(e) => setNewCid(e.target.value)}
          placeholder="Enter IPFS CID"
          style={{ padding: 8, marginRight: 8 }}
        />
        <button
          onClick={handleIssue}
          disabled={isPending || !newCid}
        >
          {isPending ? "Issuing..." : "Issue Certificate"}
        </button>
      </div>
      
      {/* Certificate list */}
      {isLoading ? (
        <div>Loading certificates...</div>
      ) : (
        <div>
          <h3>Your Certificates:</h3>
          {cids && cids.length > 0 ? (
            <ul>
              {cids.map((cid, i) => (
                <li key={i}>
                  <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank">
                    {cid}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No certificates yet</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### "Contract address not set"
- Check `.env.local` exists and has `NEXT_PUBLIC_CERT_ADDRESS`
- Restart dev server after changing `.env.local`
- Verify address starts with `0x`

### "Transaction failed" or "User rejected"
- User needs to approve transaction in wallet
- Check wallet has enough ETH/gas
- Verify contract address matches current network

### "Access denied" for CertificateNFT functions
- For `mint()`: Wallet must have `ISSUER_ROLE` on contract
- For `revoke()`: Wallet must have `DEFAULT_ADMIN_ROLE` on contract
- Grant roles using Hardhat console (see main README)

### "Invalid address" error
- Ensure address is valid Ethereum address
- Type cast as `0x${string}` for TypeScript
- Check address matches network (localhost vs testnet vs mainnet)

### Contract not found on network
- Verify contract is deployed to the selected network
- Check contract address is correct
- Switch to correct network in wallet

---

## 🔗 Related Files

- **Contract ABIs:** `src/lib/contracts.ts`
- **Admin helpers:** `src/lib/admin.ts`
- **Wagmi config:** `src/app/providers.tsx`
- **Example components:** `src/components/CertClient.tsx`, `CertNftClient.tsx`

---

## 📚 Additional Resources

- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com)
- [Ethers.js Documentation](https://docs.ethers.org)





