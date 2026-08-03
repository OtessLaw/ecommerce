import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const currencies = {
  GHS: { code: 'GHS', symbol: 'GH₵', rate: 1.0, label: 'Ghana Cedi (GH₵)' },
  USD: { code: 'USD', symbol: '$', rate: 0.08, label: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.075, label: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.065, label: 'British Pound (£)' },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('GHS');

  const formatPrice = (amountInGHS) => {
    const numericAmount = Number(amountInGHS || 0);
    const currObj = currencies[currency] || currencies.GHS;
    const converted = numericAmount * currObj.rate;
    
    if (currObj.code === 'GHS') {
      return `${currObj.symbol} ${converted.toLocaleString()}`;
    }
    return `${currObj.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
