export const CERT_ABI = [
  {
    type: "event",
    name: "Issued",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "cid", type: "string", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "function",
    name: "issue",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "cid", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getCIDs",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "string[]" }],
  },
] as const;

export function getCertAddress(): `0x${string}` | undefined {
  const addr = process.env.NEXT_PUBLIC_CERT_ADDRESS;
  return addr && addr.startsWith("0x") ? (addr as `0x${string}`) : undefined;
}

export const CERT_NFT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "ipfsCid", type: "string" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "revoke",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "revoked",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
] as const;

export function getCertNftAddress(): `0x${string}` | undefined {
  const addr = process.env.NEXT_PUBLIC_CERTNFT_ADDRESS;
  return addr && addr.startsWith("0x") ? (addr as `0x${string}`) : undefined;
}


