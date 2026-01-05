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
          <RainbowKitProvider modalSize="compact">
            <ThemeProvider
              theme={createTheme({
                palette: {
                  mode: "dark",
                  primary: { main: "#6366f1" },
                  secondary: { main: "#22d3ee" },
                  background: { default: "#0a0a0f", paper: "#111118" },
                  text: { primary: "#f8fafc", secondary: "#94a3b8" },
                  divider: "rgba(255,255,255,0.08)",
                },
                typography: {
                  fontFamily: "var(--font-geist-sans), 'Inter', sans-serif",
                  h1: { fontWeight: 800, letterSpacing: "-0.025em", color: "#f8fafc" },
                  h2: { fontWeight: 700, letterSpacing: "-0.025em", color: "#f8fafc" },
                  h3: { fontWeight: 700, letterSpacing: "-0.025em", color: "#f8fafc" },
                  h4: { fontWeight: 600, color: "#f8fafc" },
                  h6: { fontWeight: 600, color: "#f8fafc" },
                  button: { fontWeight: 600, textTransform: "none" },
                },
                shape: {
                  borderRadius: 12,
                },
                components: {
                  MuiButton: {
                    styleOverrides: {
                      root: {
                        borderRadius: 12,
                        boxShadow: "none",
                        ":hover": { boxShadow: "0 4px 20px rgba(99,102,241,0.3)" },
                      },
                      containedPrimary: {
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                        ":hover": { background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" },
                      },
                    },
                  },
                  MuiPaper: {
                    styleOverrides: {
                      root: {
                        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        backdropFilter: "blur(20px)",
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
                          backgroundColor: "rgba(255,255,255,0.03)",
                          borderRadius: 12,
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.1)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#6366f1",
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "#f8fafc",
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.5)",
                        },
                      },
                    },
                  },
                  MuiCard: {
                    styleOverrides: {
                      root: {
                        background: "rgba(255,255,255,0.03)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 20,
                      }
                    }
                  },
                  MuiChip: {
                    styleOverrides: {
                      root: {
                        borderRadius: 8,
                        background: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        color: "#818cf8",
                      }
                    }
                  },
                  MuiAlert: {
                    styleOverrides: {
                      root: {
                        borderRadius: 12,
                      }
                    }
                  }
                },
              })}
            >
              <CssBaseline />
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'rgba(17, 17, 24, 0.95)',
                    color: '#f8fafc',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(20px)',
                  }
                }}
              />
            </ThemeProvider>
          </RainbowKitProvider>
        </DevModeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


