'use client';

import { useTheme } from '@/providers/ThemeProvider';
import type { ThemePalette } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PALETTES: { id: ThemePalette; name: string; desc: string; badge?: string }[] = [
  { id: 'dark', name: 'Oscuro Premium', desc: 'Fondo oscuro con acentos de color' },
  { id: 'light', name: 'Claro Limpio', desc: 'Fondo claro de alto contraste' },
  { id: 'protanopia', name: 'Protanopia', desc: 'Ajustado para insensibilidad al rojo', badge: 'Accesible' },
  { id: 'deuteranopia', name: 'Deuteranopia', desc: 'Ajustado para insensibilidad al verde', badge: 'Accesible' },
  { id: 'tritanopia', name: 'Tritanopia', desc: 'Ajustado para insensibilidad al azul', badge: 'Accesible' },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { appearance, setPalette, setFontSize, setFontWeight } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Apariencia y Accesibilidad</h2>
              <p className="text-xs text-[var(--text-muted)]">Personaliza el sistema a tu gusto</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Color Palette Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-[var(--text-primary)] block">
            Esquema de Color
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {PALETTES.map((p) => {
              const isSelected = appearance.palette === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPalette(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
                      : 'border-[var(--border)] bg-[var(--glass-bg)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--text-primary)]">
                        {p.name}
                      </span>
                      {p.badge && (
                        <span className="badge badge-warning text-[10px]">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{p.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography Controls */}
        <div className="space-y-4 pt-2 border-t border-[var(--border)]">
          <label className="text-sm font-semibold text-[var(--text-primary)] block">
            Tipografía
          </label>

          {/* Font Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Tamaño de Fuente</span>
              <span className="font-mono font-bold text-[var(--accent)]">{appearance.fontSize}px</span>
            </div>
            <input
              type="range"
              min="14"
              max="22"
              step="1"
              value={appearance.fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
              <span>Pequeño (14px)</span>
              <span>Normal (16px)</span>
              <span>Grande (22px)</span>
            </div>
          </div>

          {/* Font Weight Selector */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Grosor de Fuente</span>
              <span className="font-mono font-bold text-[var(--accent)]">{appearance.fontWeight}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Normal', value: 400 },
                { label: 'Medio', value: 500 },
                { label: 'Negrita', value: 700 },
              ].map((w) => (
                <button
                  key={w.value}
                  onClick={() => setFontWeight(w.value)}
                  className={`py-2 text-xs rounded-lg border transition-all ${
                    appearance.fontWeight === w.value
                      ? 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)] font-bold'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Box */}
        <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--border)] text-center">
          <p className="text-xs text-[var(--text-muted)] mb-1">Vista previa:</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Cálculo total: $150.00 MXN
          </p>
        </div>

        {/* Action Button */}
        <button onClick={onClose} className="btn btn-primary w-full py-3">
          Listo
        </button>
      </div>
    </div>
  );
}
