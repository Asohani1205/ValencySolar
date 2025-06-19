// Indian Currency Formatting Utilities
// Formats numbers according to Indian numbering system (Lakhs, Crores)

export function formatIndianCurrency(amount: number, options: {
  showSymbol?: boolean;
  precision?: number;
  showFullForm?: boolean;
} = {}): string {
  const { showSymbol = true, precision = 0, showFullForm = false } = options;
  
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? "₹0" : "0";
  }
  
  const symbol = showSymbol ? "₹" : "";
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;
  
  // Format according to Indian numbering system
  let formatted: string;
  
  if (absAmount >= 10000000) { // 1 Crore and above
    const crores = absAmount / 10000000;
    formatted = `${crores.toFixed(precision)} ${showFullForm ? 'Crore' : 'Cr'}`;
  } else if (absAmount >= 100000) { // 1 Lakh and above
    const lakhs = absAmount / 100000;
    formatted = `${lakhs.toFixed(precision)} ${showFullForm ? 'Lakh' : 'L'}`;
  } else if (absAmount >= 1000) { // 1 Thousand and above
    const thousands = absAmount / 1000;
    formatted = `${thousands.toFixed(precision)}K`;
  } else {
    formatted = absAmount.toFixed(precision);
  }
  
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export function formatIndianNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0";
  }
  
  // Convert to Indian number format with commas
  const parts = amount.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] ? '.' + parts[1] : '';
  
  // Indian number formatting: xx,xx,xxx pattern
  let formatted = '';
  const len = integerPart.length;
  
  if (len <= 3) {
    formatted = integerPart;
  } else {
    // Add commas in Indian format
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    
    if (remaining.length <= 2) {
      formatted = remaining + ',' + lastThree;
    } else {
      // Add commas every 2 digits for the remaining part
      let formattedRemaining = '';
      for (let i = remaining.length - 1; i >= 0; i -= 2) {
        const start = Math.max(0, i - 1);
        const chunk = remaining.slice(start, i + 1);
        formattedRemaining = ',' + chunk + formattedRemaining;
      }
      formatted = formattedRemaining.slice(1) + ',' + lastThree;
    }
  }
  
  return formatted + decimalPart;
}

export function parseIndianCurrency(value: string): number {
  // Remove currency symbol and common abbreviations
  let cleaned = value.replace(/[₹,\s]/g, '');
  
  // Handle Indian abbreviations
  if (cleaned.toLowerCase().includes('cr') || cleaned.toLowerCase().includes('crore')) {
    const number = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return number * 10000000;
  }
  
  if (cleaned.toLowerCase().includes('l') || cleaned.toLowerCase().includes('lakh')) {
    const number = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return number * 100000;
  }
  
  if (cleaned.toLowerCase().includes('k')) {
    const number = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return number * 1000;
  }
  
  return parseFloat(cleaned) || 0;
}

export function formatPercentage(value: number, precision: number = 1): string {
  return `${value.toFixed(precision)}%`;
}

export function formatKWh(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} MWh`;
  }
  return `${value.toFixed(0)} kWh`;
}

export function formatPower(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} MW`;
  }
  return `${value.toFixed(1)} kW`;
}