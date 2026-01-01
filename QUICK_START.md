# Frontend Quick Start Guide

## ✅ Your Current Setup

Your `.env.local` is configured with:
- ✅ Cert contract: `0x9E16B3c61bdE5De13458b8C8F6D3D6f025144B7F`
- ⚠️ CertificateNFT: `0x0000...` (needs deployment)
- ✅ Admin wallet: `0x9E16B3c61bdE5De13458b8C8F6D3D6f025144B7F`

## 🚀 Run the Frontend

```bash
cd cert-frontend
npm install  # If not done already
npm run dev
```

Open http://localhost:3000

## 📖 How to Access Contracts

### Option 1: Use Existing Components

The frontend already has ready-to-use components:

**1. View Certificates** (Home page `/`)
- Shows certificates for connected wallet
- Component: `ReceivedCertificates`

**2. Issue Certificates** 
- Use existing `CertClient` component
- Or create a custom component (see examples below)

**3. Admin Functions** (Admin pages `/admin`, `/nss`, `/ieee`)
- Only accessible to wallet: `0x9E16B3c61bdE5De13458b8C8F6D3D6f025144B7F`
- Can issue CIDs to any address
- Can revoke CertificateNFT tokens

### Option 2: Create Custom Component

**Simple Read Example:**
```tsx
"use client";

import { useAccount, useReadContract } from "wagmi";
import { CERT_ABI, getCertAddress } from "../lib/contracts";

export default function MyComponent() {
  const { address } = useAccount();
  const contractAddress = getCertAddress();
  
  const { data: cids } = useReadContract({
    abi: CERT_ABI,
    address: contractAddress,
    functionName: "getCIDs",
    args: [address],
    query: { enabled: Boolean(contractAddress) && Boolean(address) },
  });
  
  return <div>{cids?.join(", ")}</div>;
}
```

**Simple Write Example:**
```tsx
"use client";

import { useAccount, useWriteContract } from "wagmi";
import { CERT_ABI, getCertAddress } from "../lib/contracts";
import toast from "react-hot-toast";

export default function IssueCert() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  async function issue(cid: string) {
    if (!isConnected) return;
    
    await toast.promise(
      writeContractAsync({
        abi: CERT_ABI,
        address: getCertAddress(),
        functionName: "issue",
        args: [address, cid],
      }),
      { loading: "Issuing...", success: "Done!", error: "Failed" }
    );
  }
  
  return <button onClick={() => issue("bafy...")}>Issue</button>;
}
```

## 📝 Next Steps

1. **Deploy CertificateNFT** (if you need NFT functionality):
   ```bash
   cd cert-contracts
   npx hardhat run scripts/deploy.ts --network localhost
   ```
   Then update `.env.local` with the CertificateNFT address

2. **Get WalletConnect Project ID** (for production):
   - Visit https://cloud.walletconnect.com
   - Create project and get Project ID
   - Update `NEXT_PUBLIC_WC_PROJECT_ID` in `.env.local`

3. **Read the Full Guide**:
   - See `FRONTEND_ACCESS.md` for complete examples
   - See `HOW_TO_ACCESS.md` (in project root) for all access methods

## 🔗 Key Files

- `src/lib/contracts.ts` - Contract ABIs and address helpers
- `src/components/CertClient.tsx` - Example Cert.sol component
- `src/components/CertNftClient.tsx` - Example CertificateNFT component
- `src/app/providers.tsx` - Wagmi/RainbowKit configuration





