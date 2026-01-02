"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import { ReactNode, useMemo } from "react";
import { Toaster } from "react-hot-toast";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { DevModeProvider } from "../contexts/DevModeContext";

type AppProvidersProps = {
  children: ReactNode;
};

const queryClient = new QueryClient();

export function AppProviders({ children }: AppProvidersProps) {
  const config = useMemo(
    () =>
      getDefaultConfig({
        appName: "Cert Frontend",
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo",
        chains: [sepolia, mainnet, localhost],
        transports: {
          [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
          [mainnet.id]: http(),
          [localhost.id]: http(),
        },
        ssr: true,
      }),
    []
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DevModeProvider>
          <RainbowKitProvider>
            <ThemeProvider
              theme={createTheme({
                palette: {
                  mode: "light",
                  primary: { main: "#1e3a8a" }, // Academic Navy Blue
                  secondary: { main: "#ca8a04" }, // Gold Accent
                  background: { default: "#f8fafc", paper: "#ffffff" },
                  text: { primary: "#0f172a", secondary: "#475569" },
                  divider: "#e2e8f0",
                },
                typography: {
                  fontFamily: "var(--font-geist-sans), 'Inter', sans-serif",
                  h1: { fontWeight: 800, letterSpacing: "-0.025em", color: "#1e3a8a" },
                  h2: { fontWeight: 700, letterSpacing: "-0.025em", color: "#1e3a8a" },
                  h3: { fontWeight: 700, letterSpacing: "-0.025em", color: "#1e3a8a" },
                  h4: { fontWeight: 600, color: "#1e293b" },
                  h6: { fontWeight: 600, color: "#1e293b" },
                  button: { fontWeight: 600, textTransform: "none" },
                },
                shape: {
                  borderRadius: 4,
                },
                components: {
                  MuiButton: {
                    styleOverrides: {
                      root: {
                        borderRadius: 6,
                        boxShadow: "none",
                        ":hover": { boxShadow: "0 2px 8px rgba(30,58,138,0.15)" },
                      },
                      containedPrimary: {
                        background: "#1e3a8a",
                        ":hover": { background: "#172554" },
                      },
                    },
                  },
                  MuiPaper: {
                    styleOverrides: {
                      root: {
                        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                        border: "1px solid #e2e8f0",
                      },
                      elevation0: {
                        boxShadow: "none",
                        border: "none",
                        backgroundColor: "transparent",
                      }
                    },
                  },
                  MuiTextField: {
                    defaultProps: {
                      variant: "outlined",
                      size: "small",
                    },
                    styleOverrides: {
                      root: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#fff",
                        },
                      },
                    },
                  },
                  MuiAppBar: {
                    styleOverrides: {
                      root: {
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                        background: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(8px)",
                        borderBottom: "1px solid #e2e8f0",
                      }
                    }
                  }
                },
              })}
            >
              <CssBaseline />
              {children}
              <Toaster position="top-right" />
            </ThemeProvider>
          </RainbowKitProvider>
        </DevModeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


