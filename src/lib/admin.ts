export function getAdminWallets(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_WALLETS || "";
  return raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(address?: string | null): boolean {
  if (!address) return false;
  const admins = getAdminWallets();
  return admins.includes(address.toLowerCase());
}





