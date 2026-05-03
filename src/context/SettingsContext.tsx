import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Currency = {
  code: string;
  symbol: string;
  rate: number; // rate relative to base USD
};

const currencies: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', rate: 1 },
  BDT: { code: 'BDT', symbol: '৳', rate: 120 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79 },
};

interface SettingsContextType {
  currency: Currency;
  setCurrency: (code: string) => void;
  formatAmount: (amount: number) => string;
  availableCurrencies: Currency[];
  language: string;
  setLanguage: (lang: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [currency, setCurrencyState] = useState<Currency>(currencies.USD);
  const [language, setLanguageState] = useState(i18n.language || 'en');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('app_currency');
    if (savedCurrency && currencies[savedCurrency]) {
      setCurrencyState(currencies[savedCurrency]);
    }
    
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
      setLanguageState(savedLang);
    }
  }, [i18n]);

  const setCurrency = (code: string) => {
    if (currencies[code]) {
      setCurrencyState(currencies[code]);
      localStorage.setItem('app_currency', code);
    }
  };

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  const formatAmount = (amount: number) => {
    const converted = amount * currency.rate;
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        formatAmount, 
        availableCurrencies: Object.values(currencies),
        language,
        setLanguage
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
