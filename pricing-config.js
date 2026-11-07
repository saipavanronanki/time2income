'use strict';

(() => {
  const internationalGatewayRate = 0.0354;
  const indiaGatewayRate = 0.0236;
  const fixedChargeLocalUnits = 11;
  const countries = [
    { code: 'IN', country: 'India', currency: 'INR', taxRate: 18 },
    { code: 'US', country: 'USA', currency: 'USD', regions: [
      { code: 'CA', name: 'California', taxRate: 7.25 },
      { code: 'NY', name: 'New York', taxRate: 4 },
      { code: 'TX', name: 'Texas', taxRate: 6.25 },
      { code: 'FL', name: 'Florida', taxRate: 6 },
      { code: 'OR', name: 'Oregon', taxRate: 0 },
      { code: 'DE', name: 'Delaware', taxRate: 0 },
      { code: 'MT', name: 'Montana', taxRate: 0 },
      { code: 'NH', name: 'New Hampshire', taxRate: 0 }
    ] },
    { code: 'GB', country: 'United Kingdom', currency: 'GBP', taxRate: 20 },
    { code: 'DE', country: 'Germany', currency: 'EUR', taxRate: 19 },
    { code: 'FR', country: 'France', currency: 'EUR', taxRate: 20 },
    { code: 'AE', country: 'United Arab Emirates', currency: 'AED', taxRate: 5 },
    { code: 'SA', country: 'Saudi Arabia', currency: 'SAR', taxRate: 15 },
    { code: 'QA', country: 'Qatar', currency: 'QAR', taxRate: 0 },
    { code: 'KW', country: 'Kuwait', currency: 'KWD', taxRate: 0 },
    { code: 'BH', country: 'Bahrain', currency: 'BHD', taxRate: 10 },
    { code: 'OM', country: 'Oman', currency: 'OMR', taxRate: 5 },
    { code: 'AU', country: 'Australia', currency: 'AUD', taxRate: 10 },
    { code: 'CA', country: 'Canada', currency: 'CAD', regions: [
      { code: 'AB', name: 'Alberta', taxRate: 5 },
      { code: 'BC', name: 'British Columbia', taxRate: 12 },
      { code: 'MB', name: 'Manitoba', taxRate: 12 },
      { code: 'ON', name: 'Ontario', taxRate: 13 },
      { code: 'QC', name: 'Quebec', taxRate: 14.975 },
      { code: 'SK', name: 'Saskatchewan', taxRate: 11 },
      { code: 'NS', name: 'Nova Scotia', taxRate: 14 },
      { code: 'NB', name: 'New Brunswick', taxRate: 15 },
      { code: 'NL', name: 'Newfoundland and Labrador', taxRate: 15 },
      { code: 'PE', name: 'Prince Edward Island', taxRate: 15 }
    ] },
    { code: 'NZ', country: 'New Zealand', currency: 'NZD', taxRate: 15 },
    { code: 'SG', country: 'Singapore', currency: 'SGD', taxRate: 9 },
    { code: 'CH', country: 'Switzerland', currency: 'CHF', taxRate: 8.1 },
    { code: 'JP', country: 'Japan', currency: 'JPY', taxRate: 10 },
    { code: 'CN', country: 'China', currency: 'CNY', taxRate: 6 },
    { code: 'HK', country: 'Hong Kong', currency: 'HKD', taxRate: 0 },
    { code: 'TW', country: 'Taiwan', currency: 'TWD', taxRate: 5 },
    { code: 'KR', country: 'South Korea', currency: 'KRW', taxRate: 10 },
    { code: 'BD', country: 'Bangladesh', currency: 'BDT', taxRate: 15 },
    { code: 'PK', country: 'Pakistan', currency: 'PKR', regions: [
      { code: 'PB', name: 'Punjab', taxRate: 16 },
      { code: 'SD', name: 'Sindh', taxRate: 15 },
      { code: 'KP', name: 'Khyber Pakhtunkhwa', taxRate: 15 },
      { code: 'BA', name: 'Balochistan', taxRate: 15 },
      { code: 'IS', name: 'Islamabad', taxRate: 15 }
    ] },
    { code: 'NP', country: 'Nepal', currency: 'NPR', taxRate: 13 },
    { code: 'LK', country: 'Sri Lanka', currency: 'LKR', taxRate: 18 },
    { code: 'ID', country: 'Indonesia', currency: 'IDR', taxRate: 11 },
    { code: 'MY', country: 'Malaysia', currency: 'MYR', categories: [
      { code: 'general', name: 'General taxable service', taxRate: 8 },
      { code: 'specified', name: 'Specified service', taxRate: 6 },
      { code: 'exempt', name: 'Exempt service', taxRate: 0 }
    ] },
    { code: 'TH', country: 'Thailand', currency: 'THB', taxRate: 7 },
    { code: 'PH', country: 'Philippines', currency: 'PHP', taxRate: 12 },
    { code: 'VN', country: 'Vietnam', currency: 'VND', taxRate: 10 },
    { code: 'TR', country: 'Turkey', currency: 'TRY', taxRate: 20 },
    { code: 'RU', country: 'Russia', currency: 'RUB', taxRate: 22 },
    { code: 'ZA', country: 'South Africa', currency: 'ZAR', taxRate: 15 },
    { code: 'BR', country: 'Brazil', currency: 'BRL', taxRate: 5, taxIsAssumption: true },
    { code: 'MX', country: 'Mexico', currency: 'MXN', taxRate: 16 },
    { code: 'AR', country: 'Argentina', currency: 'ARS', taxRate: 21 },
    { code: 'EG', country: 'Egypt', currency: 'EGP', taxRate: 14 },
    { code: 'NG', country: 'Nigeria', currency: 'NGN', taxRate: 7.5 },
    { code: 'KE', country: 'Kenya', currency: 'KES', taxRate: 16 },
    { code: 'GH', country: 'Ghana', currency: 'GHS', taxRate: 15 },
    { code: 'SE', country: 'Sweden', currency: 'SEK', taxRate: 25 },
    { code: 'NO', country: 'Norway', currency: 'NOK', taxRate: 25 },
    { code: 'DK', country: 'Denmark', currency: 'DKK', taxRate: 25 },
    { code: 'PL', country: 'Poland', currency: 'PLN', taxRate: 23 },
    { code: 'CZ', country: 'Czech Republic', currency: 'CZK', taxRate: 21 },
    { code: 'HU', country: 'Hungary', currency: 'HUF', taxRate: 27 },
    { code: 'RO', country: 'Romania', currency: 'RON', taxRate: 21 },
    { code: 'IL', country: 'Israel', currency: 'ILS', taxRate: 18 },
    { code: 'UA', country: 'Ukraine', currency: 'UAH', taxRate: 20 }
  ].map(country => ({
    ...country,
    gatewayRate: country.code === 'IN' ? indiaGatewayRate : internationalGatewayRate
  }));
  const fractionDigits = Object.freeze({
    BHD: 3, CLF: 4, IQD: 3, JOD: 3, KWD: 3, LYD: 3, OMR: 3, TND: 3,
    JPY: 0, KRW: 0, VND: 0, CLP: 0, XAF: 0, XOF: 0, XPF: 0
  });

  const roundUp = (amount, digits) => {
    const scale = 10 ** digits;
    return Math.ceil(amount * scale - Number.EPSILON * Math.max(1, amount * scale)) / scale;
  };
  const getTaxRate = (country, regionCode, serviceCategory) => {
    if (country.regions) {
      return country.regions.find(region => region.code === regionCode)?.taxRate ?? null;
    }
    if (country.categories) {
      return country.categories.find(category => category.code === serviceCategory)?.taxRate ?? null;
    }
    return country.taxRate;
  };
  const quote = (country, taxRate, baseAmount = fixedChargeLocalUnits) => {
    if (!country || !Number.isFinite(taxRate) || taxRate < 0 ||
        !Number.isFinite(baseAmount) || baseAmount <= 0 ||
        !Number.isFinite(country.gatewayRate) || country.gatewayRate < 0 ||
        country.gatewayRate >= 1) return null;
    const fixed = baseAmount;
    const serviceFee = fixed * 0.05;
    const platformFee = fixed * 0.05;
    const feeSubtotal = fixed + serviceFee + platformFee;
    const tax = feeSubtotal * taxRate / 100;
    const beforeGateway = feeSubtotal + tax;
    const digits = fractionDigits[country.currency] ??
      new Intl.NumberFormat('en', { style: 'currency', currency: country.currency })
        .resolvedOptions().maximumFractionDigits;
    const total = roundUp(beforeGateway / (1 - country.gatewayRate), digits);
    return {
      fixed,
      serviceFee,
      platformFee,
      feeSubtotal,
      tax,
      gatewayRate: country.gatewayRate,
      gatewayRecovery: total - beforeGateway,
      total,
      currency: country.currency,
      minorDigits: digits,
      taxRate
    };
  };

  window.TIME2INCOME_PRICING_CONFIG = Object.freeze({
    status: 'checkout_planning_rates',
    version: '2026-11-06-global-checkout-v5-package-bases',
    fixedChargeLocalUnits,
    serviceFeeRate: 0.05,
    platformFeeRate: 0.05,
    gatewayRates: Object.freeze({
      indiaDomesticEffective: indiaGatewayRate,
      internationalCardEffective: internationalGatewayRate
    }),
    countries: Object.freeze(countries),
    fractionDigits,
    findCountry(code) {
      return countries.find(country => country.code === code) || null;
    },
    findCountryByName(name) {
      const normalized = String(name || '').trim().toLocaleLowerCase();
      const aliases = { usa: 'US', 'united states': 'US', uk: 'GB', 'united kingdom': 'GB' };
      return countries.find(country =>
        country.code === aliases[normalized] ||
        country.code === normalized.toUpperCase() ||
        country.country.toLocaleLowerCase() === normalized) || null;
    },
    getTaxRate,
    quote
  });
})();
