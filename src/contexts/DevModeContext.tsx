"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type DevModeContextType = {
    isDevMode: boolean;
    toggleDevMode: () => void;
    mockAddress: string;
};

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export function DevModeProvider({ children }: { children: ReactNode }) {
    const [isDevMode, setIsDevMode] = useState(false);
    // Default Hardhat Account #0
    const mockAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    useEffect(() => {
        // optional: persist dev mode preference
        const stored = localStorage.getItem("dev_mode");
        if (stored === "true") setIsDevMode(true);
    }, []);

    const toggleDevMode = () => {
        setIsDevMode((prev) => {
            const next = !prev;
            localStorage.setItem("dev_mode", String(next));
            return next;
        });
    };

    return (
        <DevModeContext.Provider value={{ isDevMode, toggleDevMode, mockAddress }}>
            {children}
        </DevModeContext.Provider>
    );
}

export function useDevMode() {
    const context = useContext(DevModeContext);
    if (!context) {
        throw new Error("useDevMode must be used within a DevModeProvider");
    }
    return context;
}
