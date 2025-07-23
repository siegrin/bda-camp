
"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  // Initialize state from localStorage or system preference, defaulting to 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const [mounted, setMounted] = useState(false);

  // useEffect runs only on the client, after the initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };
  
  // Render a placeholder on the server and during the initial client render
  if (!mounted) {
    return (
        <Button variant="ghost" size="icon" disabled className="h-10 w-10">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100" />
        </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
