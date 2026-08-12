'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppearanceSettings, ThemePalette } from '@/types';
import { DEFAULT_APPEARANCE } from '@/types';
import { saveAppearance, getAppearance } from '@/lib/storage';

interface ThemeContextType {
  appearance: AppearanceSettings;
  setPalette: (palette: ThemePalette) => void;
  setFontSize: (size: number) => void;
  setFontWeight: (weight: number) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = getAppearance();
    if (saved) {
      setAppearance({
        palette: (saved.palette as ThemePalette) || DEFAULT_APPEARANCE.palette,
        fontSize: (saved.fontSize as number) || DEFAULT_APPEARANCE.fontSize,
        fontWeight: (saved.fontWeight as number) || DEFAULT_APPEARANCE.fontWeight,
      });
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute('data-theme', appearance.palette);
    root.style.setProperty('--app-font-size', `${appearance.fontSize}px`);
    root.style.setProperty('--app-font-weight', `${appearance.fontWeight}`);
    saveAppearance(appearance);
  }, [appearance, mounted]);

  const setPalette = useCallback((palette: ThemePalette) => {
    setAppearance((prev) => ({ ...prev, palette }));
  }, []);

  const setFontSize = useCallback((fontSize: number) => {
    setAppearance((prev) => ({ ...prev, fontSize }));
  }, []);

  const setFontWeight = useCallback((fontWeight: number) => {
    setAppearance((prev) => ({ ...prev, fontWeight }));
  }, []);

  return (
    <ThemeContext.Provider value={{ appearance, setPalette, setFontSize, setFontWeight }}>
      {children}
    </ThemeContext.Provider>
  );
}
