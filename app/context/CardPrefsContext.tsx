'use client';
import { createContext, useContext } from 'react';
import { CardPreferences, DEFAULT_CARD_PREFS } from '../types';
import { useAuth } from './AuthContext';

export const CardPrefsContext = createContext<CardPreferences>(DEFAULT_CARD_PREFS);

export function useCardPrefs(): CardPreferences {
  const prefs = useContext(CardPrefsContext);
  const { role } = useAuth();
  if (role === 'clipper') return { ...prefs, showPrecio: false };
  return prefs;
}
