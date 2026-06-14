'use client';
import { createContext, useContext } from 'react';
import { CardPreferences, DEFAULT_CARD_PREFS } from '../types';

export const CardPrefsContext = createContext<CardPreferences>(DEFAULT_CARD_PREFS);
export const useCardPrefs = () => useContext(CardPrefsContext);
