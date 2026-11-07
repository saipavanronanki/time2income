'use strict';

(() => {
  const config = window.TIME2INCOME_PRICING_CONFIG;
  const countrySelect = document.getElementById('pricingCountry');
  const regionField = document.getElementById('pricingRegionField');
  const regionSelect = document.getElementById('pricingRegion');
  const categoryField = document.getElementById('pricingServiceCategoryField');
  const categorySelect = document.getElementById('pricingServiceCategory');
  const detail = document.getElementById('pricingBreakdown');
  const countryTable = document.getElementById('pricingCountryRows');
  const packageCountryTable = document.getElementById('t2iPackageCountryRows');
  const jurisdictionBreakdown = document.getElementById('pricingJurisdictionBreakdown');
  const jurisdictionRows = document.getElementById('pricingJurisdictionRows');
  const status = document.getElementById('pricingEstimateStatus');
  const coverage = document.getElementById('pricingCountryCoverage');
  const profileCountries = window.TIME2INCOME_COUNTRIES;
  const packages = [
    { name: 'Mini', tokens: 100, price: 11 },
    { name: 'Basic', tokens: 600, price: 59 },
    { name: 'Popular', tokens: 1600, price: 145 },
    { name: 'Pro', tokens: 3500, price: 275 }
  ];

  if (!config || !countrySelect || !regionField || !regionSelect ||
      !categoryField || !categorySelect || !detail || !countryTable ||
      !packageCountryTable || !jurisdictionBreakdown || !jurisdictionRows ||
      !status || !coverage || !Array.isArray(profileCountries)) {
    console.error('Pricing estimate UI could not initialize: required configuration or elements are missing.');
    return;
  }

  const configuredCountries = new Map(config.countries.map(country => [country.code, country]));
  const euStandardVatRates = {
    AT: 20, BE: 21, BG: 20, CY: 19, CZ: 21, DE: 19, DK: 25, EE: 24,
    GR: 24, ES: 21, FI: 25.5, FR: 20, HR: 25, HU: 27, IE: 23, IT: 22,
    LT: 21, LU: 17, LV: 21, MT: 18, NL: 21, PL: 23, PT: 23, RO: 21,
    SE: 25, SI: 22, SK: 23
  };
  const euRateSource = {
    name: 'European Commission / Your Europe',
    type: 'Official EU published standard rate',
    url: 'https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm'
  };
  const publishedTaxReferences = new Map(Object.entries(euStandardVatRates).map(([code, rate]) => [
    code,
    { rate, taxType: 'VAT', ...euRateSource }
  ]));
  const officialNationalRates = [
    ['EE', 24, 'VAT', 'Estonian Tax and Customs Board', 'https://www.emta.ee/en/business-client/taxes-and-payment/value-added-tax/vat-rates-and-supply-exempt-tax'],
    ['FI', 25.5, 'VAT', 'Finnish Tax Administration', 'https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/vat/rates-of-vat/'],
    ['IE', 23, 'VAT', 'Irish Revenue', 'https://www.revenue.ie/en/vat/vat-rates/search-vat-rates/current-vat-rates.aspx'],
    ['SI', 22, 'VAT', 'Financial Administration of the Republic of Slovenia', 'https://www.fu.gov.si/en/taxes_and_other_duties/areas_of_work/value_added_tax_vat/']
  ];
  for (const [code, rate, taxType, name, url] of officialNationalRates) {
    publishedTaxReferences.set(code, {
      rate,
      taxType,
      name,
      type: 'Official national tax authority rate',
      url
    });
  }
  const secondaryPublishedRates = [
    ['AL', 20, 'VAT', 'albania'], ['AO', 14, 'VAT', 'angola'],
    ['AM', 20, 'VAT', 'armenia'], ['AZ', 18, 'VAT', 'azerbaijan'],
    ['BS', 10, 'VAT', 'the-bahamas'], ['BB', 17.5, 'VAT', 'barbados'],
    ['BO', 13, 'VAT', 'bolivia'], ['BA', 17, 'VAT', 'bosnia-and-herzegovina'],
    ['BW', 14, 'VAT', 'botswana'], ['CV', 15, 'VAT', 'cabo-verde'],
    ['KH', 10, 'VAT', 'cambodia'], ['CM', 19.25, 'VAT', 'republic-of-cameroon'],
    ['TD', 18, 'VAT', 'chad'], ['CL', 19, 'VAT', 'chile'],
    ['CO', 19, 'VAT', 'colombia'], ['CD', 16, 'VAT', 'democratic-republic-of-the-congo'],
    ['CR', 13, 'VAT', 'costa-rica'], ['DO', 18, 'VAT', 'dominican-republic'],
    ['EC', 15, 'VAT', 'ecuador'], ['SV', 13, 'VAT', 'el-salvador'],
    ['ET', 15, 'VAT', 'ethiopia'], ['GA', 18, 'VAT', 'gabon'],
    ['GE', 18, 'VAT', 'georgia'], ['GT', 12, 'VAT', 'guatemala'],
    ['GY', 14, 'VAT', 'guyana'], ['HN', 15, 'Sales tax', 'honduras'],
    ['IS', 24, 'VAT', 'iceland'], ['CI', 18, 'VAT', 'ivory-coast'],
    ['JM', 15, 'GCT', 'jamaica'], ['KZ', 16, 'VAT', 'kazakhstan'],
    ['LA', 10, 'VAT', 'lao-pdr'], ['LB', 11, 'VAT', 'lebanon'],
    ['LI', 8.1, 'VAT', 'liechtenstein'], ['MG', 20, 'VAT', 'madagascar'],
    ['MR', 16, 'VAT', 'mauritania'], ['MU', 15, 'VAT', 'mauritius'],
    ['MD', 20, 'VAT', 'moldova'], ['MN', 10, 'VAT', 'mongolia'],
    ['ME', 21, 'VAT', 'montenegro'], ['MA', 20, 'VAT', 'morocco'],
    ['MZ', 16, 'VAT', 'mozambique'], ['NA', 15, 'VAT', 'republic-of-namibia'],
    ['NC', 11, 'TGC', 'new-caledonia'], ['NI', 15, 'VAT', 'nicaragua'],
    ['MK', 18, 'VAT', 'north-macedonia'], ['PS', 16, 'VAT', 'palestinian-territories'],
    ['PA', 7, 'ITBMS', 'panama'], ['PG', 10, 'GST', 'papua-new-guinea'],
    ['PY', 10, 'VAT', 'paraguay'], ['PE', 18, 'IGV', 'peru'],
    ['RW', 18, 'VAT', 'rwanda'], ['LC', 12.5, 'VAT', 'saint-lucia'],
    ['SN', 18, 'VAT', 'senegal'], ['RS', 20, 'VAT', 'serbia'],
    ['TW', 5, 'VAT', 'taiwan'], ['TN', 19, 'VAT', 'tunisia'],
    ['UG', 18, 'VAT', 'uganda'], ['UY', 22, 'VAT', 'uruguay'],
    ['UZ', 12, 'VAT', 'republic-of-uzbekistan'], ['VE', 16, 'VAT', 'venezuela'],
    ['ZM', 16, 'VAT', 'zambia']
  ];
  for (const [code, rate, taxType, profile] of secondaryPublishedRates) {
    if (publishedTaxReferences.has(code)) continue;
    publishedTaxReferences.set(code, {
      rate,
      taxType,
      name: 'PwC Tax Summaries',
      type: 'Secondary published standard-rate reference',
      url: `https://taxsummaries.pwc.com/${profile}`
    });
  }
  const countries = profileCountries.map(profileCountry => {
    const configured = configuredCountries.get(profileCountry.code);
    const currency = profileCountry.code === 'BG' ? 'EUR' : profileCountry.currencyCode;
    return configured
      ? { ...configured, currency }
      : {
          code: profileCountry.code,
          country: profileCountry.name,
          currency,
          checkoutEstimateUnavailable: true
        };
  });
  for (const country of countries) {
    const taxReference = publishedTaxReferences.get(country.code);
    if (!taxReference) continue;
    country.taxReference = taxReference;
    country.taxRate = taxReference.rate;
    country.gatewayRate = country.code === 'IN'
      ? config.gatewayRates.indiaDomesticEffective
      : config.gatewayRates.internationalCardEffective;
    country.checkoutEstimateUnavailable = false;
  }
  const findCountry = code => countries.find(country => country.code === code) || null;

  const formatMoney = (amount, currency) => {
    const digits = config.fractionDigits[currency] ??
      new Intl.NumberFormat('en', { style: 'currency', currency })
        .resolvedOptions().maximumFractionDigits;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(amount);
  };

  const formatRate = rate =>
    `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(rate)}%`;

  const taxLabel = country => country.taxReference
    ? `${formatRate(country.taxRate)} ${country.taxReference.taxType} standard-rate reference`
    : country.regions
      ? 'Location-based'
      : country.categories
        ? 'Service category'
        : formatRate(country.taxRate);

  const makeOptions = (select, items, placeholder) => {
    select.replaceChildren(new Option(placeholder, ''));
    for (const item of items) select.add(new Option(item.name, item.code));
  };

  const getQuote = country => {
    const taxRate = config.getTaxRate(
      country,
      regionSelect.value,
      categorySelect.value
    );
    return taxRate === null ? null : config.quote(country, taxRate);
  };

  const getPreTaxQuote = country => config.quote({
    ...country,
    gatewayRate: country.code === 'IN'
      ? config.gatewayRates.indiaDomesticEffective
      : config.gatewayRates.internationalCardEffective
  }, 0);

  const renderBreakdown = country => {
    document.getElementById('pricingSelectedCountry').textContent =
      `${country.country} · ${country.currency}`;
    const totalLabel = document.getElementById('pricingTotalLabel');
    if (country.checkoutEstimateUnavailable) {
      const quote = getPreTaxQuote(country);
      if (!quote) {
        status.textContent = `A fee estimate cannot be formatted for ${country.currency}. This does not confirm that payments in this currency are supported.`;
        return;
      }
      totalLabel.textContent = 'Estimated subtotal before local tax';
      document.getElementById('pricingFixed').textContent = formatMoney(quote.fixed, country.currency);
      document.getElementById('pricingServiceFee').textContent = formatMoney(quote.serviceFee, country.currency);
      document.getElementById('pricingPlatformFee').textContent = formatMoney(quote.platformFee, country.currency);
      document.getElementById('pricingFeeSubtotal').textContent = formatMoney(quote.feeSubtotal, country.currency);
      document.getElementById('pricingTaxLine').textContent = 'Local tax (not verified or included)';
      document.getElementById('pricingTaxAmount').textContent = 'Not included';
      document.getElementById('pricingGatewayAmount').textContent =
        formatMoney(quote.gatewayRecovery, country.currency);
      document.getElementById('pricingTotal').textContent =
        `${formatMoney(quote.total, country.currency)} · before tax`;
      document.getElementById('pricingGatewayRate').textContent =
        `${(quote.gatewayRate * 100).toFixed(2)}% generic gateway planning assumption; not a country-specific provider quote.`;
      status.textContent =
        `${country.country}: service, platform and generic gateway planning fees for the provider booking charge are shown before local tax. Tax is not assumed to be zero. Currency listing does not confirm that payments are supported.`;
      return;
    }
    totalLabel.textContent = 'Estimated total';
    const quote = getQuote(country);
    if (!quote) {
      const fixed = config.fixedChargeLocalUnits;
      const serviceFee = fixed * config.serviceFeeRate;
      const platformFee = fixed * config.platformFeeRate;
      document.getElementById('pricingFixed').textContent = formatMoney(fixed, country.currency);
      document.getElementById('pricingServiceFee').textContent = formatMoney(serviceFee, country.currency);
      document.getElementById('pricingPlatformFee').textContent = formatMoney(platformFee, country.currency);
      document.getElementById('pricingFeeSubtotal').textContent =
        formatMoney(fixed + serviceFee + platformFee, country.currency);
      document.getElementById('pricingTaxLine').textContent = 'Assumed local tax';
      document.getElementById('pricingTaxAmount').textContent = 'Select location';
      document.getElementById('pricingGatewayAmount').textContent = 'Select location';
      document.getElementById('pricingTotal').textContent = 'Select location';
      document.getElementById('pricingGatewayRate').textContent =
        `${(country.gatewayRate * 100).toFixed(2)}% assumed effective payment-gateway rate.`;
      status.textContent = country.regions
        ? 'Select a listed state or province to calculate the tax and checkout total.'
        : 'Select a Malaysia service category to calculate the tax and checkout total.';
      return;
    }

    document.getElementById('pricingFixed').textContent = formatMoney(quote.fixed, country.currency);
    document.getElementById('pricingServiceFee').textContent = formatMoney(quote.serviceFee, country.currency);
    document.getElementById('pricingPlatformFee').textContent = formatMoney(quote.platformFee, country.currency);
    document.getElementById('pricingFeeSubtotal').textContent = formatMoney(quote.feeSubtotal, country.currency);
    document.getElementById('pricingTaxLine').textContent = country.taxReference
      ? `Published ${country.taxReference.taxType} standard-rate reference (${formatRate(quote.taxRate)}; applicability unverified)`
      : `Assumed local tax (${formatRate(quote.taxRate)})`;
    document.getElementById('pricingTaxAmount').textContent = formatMoney(quote.tax, country.currency);
    document.getElementById('pricingGatewayAmount').textContent = formatMoney(quote.gatewayRecovery, country.currency);
    document.getElementById('pricingTotal').textContent = formatMoney(quote.total, country.currency);
    document.getElementById('pricingGatewayRate').textContent =
      `${(quote.gatewayRate * 100).toFixed(2)}% assumed effective payment-gateway rate. Final checkout is rounded up to the currency's supported minor unit.`;
    status.textContent = country.taxReference
      ? `${country.taxReference.type}: ${formatRate(quote.taxRate)} ${country.taxReference.taxType} headline standard rate. It is used only as a planning proxy; whether it applies to this booking fee depends on local rules and is not determined here.`
      : country.taxIsAssumption
      ? 'Brazil uses the 5% planning assumption shown in the supplied chart; this is not a confirmed statutory tax rate.'
      : 'Tax and gateway rates follow the supplied planning chart and may require legal and payment-provider validation.';
  };

  const configureCountry = country => {
    coverage.textContent = country.checkoutEstimateUnavailable
      ? `${country.country} (${country.currency}): a pre-tax provider booking service/platform/gateway planning subtotal is shown; local tax is not verified or included.`
      : country.taxReference
        ? `${country.country} (${country.currency}): a published ${country.taxReference.taxType} standard-rate reference is included for planning only; applicability to this transaction is not determined.`
        : `${config.countries.length} of ${countries.length} profile countries/territories have provisional provider booking fee estimates. ${country.country} (${country.currency}) is on that estimate list; rates remain unverified.`;
    regionField.hidden = !country.regions;
    regionSelect.hidden = !country.regions;
    regionSelect.required = Boolean(country.regions);
    makeOptions(regionSelect, country.regions || [], 'Select state / province');
    categoryField.hidden = !country.categories;
    categorySelect.hidden = !country.categories;
    categorySelect.required = Boolean(country.categories);
    makeOptions(categorySelect, country.categories || [], 'Select service category');
    renderJurisdictionTable(country);
    renderBreakdown(country);
  };

  const renderJurisdictionTable = country => {
    const items = country.regions || country.categories;
    jurisdictionBreakdown.hidden = !items;
    jurisdictionRows.replaceChildren();
    if (!items) return;

    const fragment = document.createDocumentFragment();
    for (const item of items) {
      const quote = config.quote(country, item.taxRate);
      const row = document.createElement('tr');
      const nameCell = document.createElement('th');
      nameCell.scope = 'row';
      nameCell.textContent = item.name;
      const taxCell = document.createElement('td');
      taxCell.textContent = formatRate(item.taxRate);
      const totalCell = document.createElement('td');
      totalCell.textContent = formatMoney(quote.total, country.currency);
      row.append(nameCell, taxCell, totalCell);
      fragment.append(row);
    }
    jurisdictionRows.append(fragment);
  };

  for (const country of countries) {
    countrySelect.add(new Option(
      `${country.country} (${country.currency})${country.checkoutEstimateUnavailable ? ' — tax not verified; pre-tax estimate' : ''}`,
      country.code
    ));
  }

  const appendCountryRows = () => {
    const fragment = document.createDocumentFragment();
    for (const country of countries) {
      const row = document.createElement('tr');
      const countryCell = document.createElement('th');
      countryCell.scope = 'row';
      countryCell.textContent = country.country;
      const currencyCell = document.createElement('td');
      currencyCell.textContent = country.currency;
      const taxCell = document.createElement('td');
      if (country.checkoutEstimateUnavailable) {
        taxCell.textContent = 'Not verified; excluded';
      } else {
        taxCell.append(document.createTextNode(taxLabel(country)));
        if (country.taxReference) {
          taxCell.append(document.createTextNode(' · '));
          const sourceLink = document.createElement('a');
          sourceLink.href = country.taxReference.url;
          sourceLink.target = '_blank';
          sourceLink.rel = 'noopener noreferrer';
          sourceLink.textContent = country.taxReference.name;
          sourceLink.setAttribute('aria-label', `${country.taxReference.type} source for ${country.country}`);
          taxCell.append(sourceLink);
        }
      }
      const totalCell = document.createElement('td');

      if (country.checkoutEstimateUnavailable) {
        const quote = getPreTaxQuote(country);
        totalCell.textContent = quote
          ? `${formatMoney(quote.total, country.currency)} before tax`
          : 'Unable to estimate';
      } else if (country.regions) {
        const totals = country.regions.map(region =>
          config.quote(country, region.taxRate).total);
        const low = Math.min(...totals);
        const high = Math.max(...totals);
        totalCell.textContent = low === high
          ? formatMoney(low, country.currency)
          : `${formatMoney(low, country.currency)}–${formatMoney(high, country.currency)}`;
      } else if (country.categories) {
        const totals = country.categories.map(category =>
          config.quote(country, category.taxRate).total);
        const low = Math.min(...totals);
        const high = Math.max(...totals);
        totalCell.textContent = `${formatMoney(low, country.currency)}–${formatMoney(high, country.currency)}`;
      } else {
        totalCell.textContent = formatMoney(
          config.quote(country, country.taxRate).total,
          country.currency
        );
      }

      row.append(countryCell, currencyCell, taxCell, totalCell);
      fragment.append(row);
    }
    countryTable.append(fragment);
  };

  const appendPackageCountryRows = () => {
    const fragment = document.createDocumentFragment();
    for (const country of countries) {
      const row = document.createElement('tr');
      const nameCell = document.createElement('th');
      nameCell.scope = 'row';
      nameCell.textContent = country.country;
      const currencyCell = document.createElement('td');
      currencyCell.textContent = country.currency;
      row.append(nameCell, currencyCell);
      for (const item of packages) {
        const priceCell = document.createElement('td');
        priceCell.textContent = formatMoney(item.price, country.currency);
        row.append(priceCell);
      }
      fragment.append(row);
    }
    packageCountryTable.append(fragment);
  };

  appendCountryRows();
  appendPackageCountryRows();
  countrySelect.addEventListener('change', () => {
    const country = findCountry(countrySelect.value);
    if (country) configureCountry(country);
  });
  regionSelect.addEventListener('change', () => {
    const country = findCountry(countrySelect.value);
    if (country) renderBreakdown(country);
  });
  categorySelect.addEventListener('change', () => {
    const country = findCountry(countrySelect.value);
    if (country) renderBreakdown(country);
  });
  countrySelect.value = config.countries[0].code;
  configureCountry(findCountry(countrySelect.value));
})();
