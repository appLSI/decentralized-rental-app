import { create } from "zustand";

type Theme = "light" | "dark";

export interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
    initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: "light",

    // Load theme on first render
    initializeTheme: () => {
        const savedTheme = localStorage.getItem("rentchain_theme") as Theme;
        const appliedTheme = savedTheme || "light";

        document.documentElement.classList.toggle("dark", appliedTheme === "dark");
        set({ theme: appliedTheme });
    },

    // Toggle theme
    toggleTheme: () => {
        const current = get().theme;
        const newTheme = current === "light" ? "dark" : "light";

        localStorage.setItem("rentchain_theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");

        set({ theme: newTheme });
    },
}));
