'use client';
import { useState, useEffect, useCallback } from 'react';
import { CardPreferences, DEFAULT_CARD_PREFS } from '../types';

const STORAGE_KEY = 'video-manager-card-prefs';

export function useCardPreferences() {
  const [prefs, setPrefs] = useState<CardPreferences>(DEFAULT_CARD_PREFS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPrefs({ ...DEFAULT_CARD_PREFS, ...JSON.parse(stored) });
    } catch { /* ignore */ }
  }, []);

  const updatePref = useCallback(<K extends keyof CardPreferences>(key: K, value: CardPreferences[K]) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetPrefs = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPrefs(DEFAULT_CARD_PREFS);
  }, []);

  return { prefs, updatePref, resetPrefs };
}
