'use strict';

(() => {
  const config = window.TIME2INCOME_PRICING_CONFIG;
  const dialog = document.getElementById('checkoutQuoteDialog');
  const form = document.getElementById('checkoutQuoteForm');
  const countrySelect = document.getElementById('checkoutCountry');
  const regionField = document.getElementById('checkoutRegionField');
  const regionSelect = document.getElementById('checkoutRegion');
  const categoryField = document.getElementById('checkoutServiceCategoryField');
  const categorySelect = document.getElementById('checkoutServiceCategory');
  const status = document.getElementById('checkoutQuoteStatus');
  let resolveQuote = null;
  let translateText = key => key;

  const copy = (key, fallback) => {
    const translated = translateText(key);
    return translated === key ? fallback : translated;
  };

  if (!config || !dialog || !form || !countrySelect || !regionSelect ||
      !categorySelect || !status) {
    console.error('Checkout quote could not initialize: required configuration or elements are missing.');
    return;
  }

  const elements = {
    fixed: document.getElementById('checkoutFixed'),
    serviceFee: document.getElementById('checkoutServiceFee'),
    platformFee: document.getElementById('checkoutPlatformFee'),
    subtotal: document.getElementById('checkoutSubtotal'),
    taxLabel: document.getElementById('checkoutTaxLabel'),
    tax: document.getElementById('checkoutTax'),
    gateway: document.getElementById('checkoutGateway'),
    total: document.getElementById('checkoutTotal'),
    currency: document.getElementById('checkoutCurrency'),
    gatewayNote: document.getElementById('checkoutGatewayNote'),
    assumptionNote: document.getElementById('checkoutAssumptionNote')
  };

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

  const fillOptions = (select, items, placeholder) => {
    select.replaceChildren(new Option(placeholder, ''));
    for (const item of items) select.add(new Option(item.name, item.code));
  };

  const selectedCountry = () => config.findCountry(countrySelect.value);

  const configureJurisdiction = country => {
    regionField.hidden = !country.regions;
    regionSelect.hidden = !country.regions;
    regionSelect.required = Boolean(country.regions);
    fillOptions(
      regionSelect,
      country.regions || [],
      country.regions
        ? copy('checkoutSelectRegionPlaceholder', 'Select state / province')
        : copy('checkoutNotRequired', 'Not required')
    );
    categoryField.hidden = !country.categories;
    categorySelect.hidden = !country.categories;
    categorySelect.required = Boolean(country.categories);
    fillOptions(
      categorySelect,
      country.categories || [],
      country.categories
        ? copy('checkoutSelectCategoryPlaceholder', 'Select service category')
        : copy('checkoutNotRequired', 'Not required')
    );
  };

  const clearQuote = currency => {
    for (const element of [
      elements.fixed,
      elements.serviceFee,
      elements.platformFee,
      elements.subtotal,
      elements.tax,
      elements.gateway,
      elements.total
    ]) element.textContent = '—';
    elements.taxLabel.textContent = copy('checkoutTax', 'Assumed local tax');
    elements.currency.textContent = currency || '';
    elements.gatewayNote.textContent = '';
    elements.assumptionNote.textContent = '';
  };

  const updateQuote = () => {
    const country = selectedCountry();
    if (!country) {
      clearQuote('');
      status.textContent = copy(
        'checkoutSelectCountry',
        'Choose a country to see the checkout breakdown.'
      );
      return null;
    }

    const taxRate = config.getTaxRate(
      country,
      regionSelect.value,
      categorySelect.value
    );
    const quote = config.quote(country, taxRate);
    if (!quote) {
      clearQuote(country.currency);
      status.textContent = country.regions
        ? copy(
          'checkoutSelectRegion',
          'Select a listed state or province to calculate the tax.'
        )
        : copy(
          'checkoutSelectCategory',
          'Select a service category to calculate the tax.'
        );
      return null;
    }

    elements.fixed.textContent = formatMoney(quote.fixed, country.currency);
    elements.serviceFee.textContent = formatMoney(quote.serviceFee, country.currency);
    elements.platformFee.textContent = formatMoney(quote.platformFee, country.currency);
    elements.subtotal.textContent = formatMoney(quote.feeSubtotal, country.currency);
    elements.taxLabel.textContent =
      `${copy('checkoutTax', 'Assumed local tax')} (${new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(taxRate)}%)`;
    elements.tax.textContent = formatMoney(quote.tax, country.currency);
    elements.gateway.textContent = formatMoney(quote.gatewayRecovery, country.currency);
    elements.total.textContent = formatMoney(quote.total, country.currency);
    elements.currency.textContent = country.currency;
    elements.gatewayNote.textContent = copy(
      'checkoutGatewayNote',
      '{rate}% assumed effective payment-gateway rate. The collected amount is rounded up to the currency’s supported minor unit.'
    ).replace('{rate}', (quote.gatewayRate * 100).toFixed(2));
    elements.assumptionNote.textContent = country.taxIsAssumption
      ? copy(
        'checkoutBrazilNote',
        'Brazil uses the 5% planning assumption from your pricing chart; this is not a confirmed statutory tax rate.'
      )
      : copy(
        'checkoutGeneralNote',
        'Tax and gateway rates follow the supplied planning chart and may require legal and payment-provider validation.'
      );
    status.textContent = '';
    return {
      country_code: country.code,
      currency: country.currency,
      ...(country.regions ? { region_code: regionSelect.value } : {}),
      ...(country.categories ? { service_category: categorySelect.value } : {}),
      amount_minor: Math.round(
        quote.total * 10 ** quote.minorDigits
      )
    };
  };

  for (const country of config.countries) {
    countrySelect.add(new Option(`${country.country} (${country.currency})`, country.code));
  }
  configureJurisdiction(config.findCountry(countrySelect.value) || config.countries[0]);

  const closeWith = result => {
    if (!dialog.open) return;
    dialog.close();
    const resolve = resolveQuote;
    resolveQuote = null;
    resolve?.(result);
  };

  countrySelect.addEventListener('change', () => {
    const country = selectedCountry();
    if (country) configureJurisdiction(country);
    updateQuote();
  });
  regionSelect.addEventListener('change', updateQuote);
  categorySelect.addEventListener('change', updateQuote);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const quote = updateQuote();
    if (!quote) return;
    closeWith(quote);
  });
  document.getElementById('cancelCheckoutQuote').addEventListener('click', () => closeWith(null));
  document.getElementById('cancelCheckoutQuoteIcon').addEventListener('click', () => closeWith(null));
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeWith(null);
  });

  window.TIME2INCOME_CHECKOUT = Object.freeze({
    requestQuote({
      countryName = '',
      purpose = 'task_action',
      translate = key => key
    } = {}) {
      if (resolveQuote) {
        return Promise.reject(new Error('A checkout quote is already open.'));
      }
      translateText = translate;
      document.getElementById('checkoutQuoteKicker').textContent =
        copy('checkoutQuoteKicker', 'CHECKOUT BREAKDOWN');
      document.getElementById('checkoutQuoteTitle').textContent =
        copy('checkoutQuoteTitle', 'Review your total');
      document.getElementById('checkoutQuoteIntro').textContent =
        copy(
          purpose === 'booking' ? 'checkoutQuoteIntro' : 'checkoutQuoteWalletIntro',
          purpose === 'booking'
            ? 'This is the full platform checkout fee for this action. Confirm to continue directly to secure payment.'
            : 'Any available wallet credit may be applied to this total first; the remaining balance goes to secure payment.'
        );
      document.getElementById('checkoutCountryLabel').textContent =
        copy('checkoutCountry', 'Your country');
      document.getElementById('checkoutRegionField').firstChild.textContent =
        copy('checkoutRegion', 'State / province');
      document.getElementById('checkoutServiceCategoryField').firstChild.textContent =
        copy('checkoutCategory', 'Malaysia service category');
      document.getElementById('checkoutFixedLabel').textContent =
        copy('checkoutFixed', 'Fixed charge');
      document.getElementById('checkoutServiceFeeLabel').textContent =
        copy('checkoutServiceFee', 'Service fee (5%)');
      document.getElementById('checkoutPlatformFeeLabel').textContent =
        copy('checkoutPlatformFee', 'Platform fee (5%)');
      document.getElementById('checkoutSubtotalLabel').textContent =
        copy('checkoutSubtotal', 'Fee subtotal');
      document.getElementById('checkoutGatewayLabel').textContent =
        copy('checkoutGateway', 'Gateway recovery (gross-up)');
      document.getElementById('checkoutTotalLabel').textContent =
        copy('checkoutTotal', 'Final checkout total');
      document.getElementById('cancelCheckoutQuote').textContent =
        copy('checkoutCancel', 'Cancel');
      document.getElementById('continueCheckoutQuote').textContent =
        copy('checkoutContinue', 'Continue to secure payment');
      document.getElementById('cancelCheckoutQuoteIcon').setAttribute(
        'aria-label',
        copy('close', 'Close')
      );
      const country = config.findCountryByName(countryName) || config.findCountry('IN');
      countrySelect.value = country.code;
      configureJurisdiction(country);
      updateQuote();
      return new Promise((resolve, reject) => {
        resolveQuote = resolve;
        try {
          dialog.showModal();
        } catch (error) {
          resolveQuote = null;
          reject(error);
        }
      });
    }
  });
})();
