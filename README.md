# cert-frontend

A Next.js dApp frontend for issuing simple certificate CIDs and managing CertificateNFT tokens.

## What was implemented

- Wallet connect with RainbowKit + Wagmi
- Multi-network support: mainnet, sepolia, localhost
- Toast notifications for contract actions
- Cert.sol integration
  - Read issued CIDs for an address
  - Issue a new CID to the connected wallet
- CertificateNFT.sol integration
  - Mint an NFT with an IPFS CID (issuer role required on-contract)
  - Revoke an NFT by tokenId (admin role required on-contract)

## Prerequisites

- Node.js 18+ and npm
- WalletConnect Cloud Project ID
  - Create one and copy its Project ID

## Environment variables

Create a `.env.local` file in `cert-frontend/` with:

```
NEXT_PUBLIC_WC_PROJECT_ID=<your_walletconnect_project_id>
NEXT_PUBLIC_CERT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CERTNFT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_ADMIN_WALLETS=0xAdmin1,0xAdmin2
```

Replace the two contract addresses with your deployed addresses.

## Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Usage (step-by-step)

1) Connect Wallet
- Click the Connect button and choose your wallet.
- If needed, switch to the network where your contracts are deployed (mainnet, sepolia, or localhost).

2) Configure Contract Addresses
- Set `NEXT_PUBLIC_CERT_ADDRESS` to your deployed `Cert` contract.
- Set `NEXT_PUBLIC_CERTNFT_ADDRESS` to your deployed `CertificateNFT` contract.
- Set `NEXT_PUBLIC_ADMIN_WALLETS` to a comma-separated list of admin wallet addresses.
- Restart the dev server after updating `.env.local`.
- Admin Panels
  - Visit `/admin`, `/nss`, or `/ieee`. Only wallets listed in `NEXT_PUBLIC_ADMIN_WALLETS` will have access.
  - Admin can:
    - View CIDs for an address
    - Issue a new CID to an address (Cert.sol)
    - Revoke an NFT by tokenId (CertificateNFT.sol)

3) Issue and Read CIDs (Cert.sol)
- Optional: enter an address in "Owner address" and click "Load CIDs" to view issued CIDs.
- To issue a CID to yourself, enter an IPFS CID in the input and click "Issue to me".
- A toast will display progress and success/failure.

4) Mint Certificate NFT (CertificateNFT.sol)
- Optional: enter a specific recipient (defaults to your connected address).
- Enter an IPFS CID and click "Mint".
- You must have the ISSUER_ROLE on the contract.

5) Revoke Certificate NFT (CertificateNFT.sol)
- Enter the tokenId you want to revoke and click "Revoke".
- You must have the DEFAULT_ADMIN_ROLE on the contract.

## Project structure (relevant files)

- `src/app/providers.tsx`: Wagmi/RainbowKit, QueryClient, toast provider setup
- `src/components/WalletConnect.tsx`: Connect button + connection status
- `src/components/CertClient.tsx`: Read/issue CIDs with `Cert.sol`
- `src/components/CertNftClient.tsx`: Mint/revoke with `CertificateNFT.sol`
- `src/lib/contracts.ts`: ABIs and helpers for reading env addresses
- `src/app/page.tsx`: Simple UI wiring the components together

## Notes

- Errors such as missing roles are surfaced via toasts or inline messages.
- Localhost is supported. If using Hardhat/Anvil, deploy contracts and set their addresses in `.env.local`.
- For production, use real WalletConnect Project ID and ensure you’ve deployed contracts to the target chain.
