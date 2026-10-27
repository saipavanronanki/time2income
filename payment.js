'use strict';

const paymentMessage = document.getElementById('paymentMessage');
const activateButton = document.getElementById('activateButton');
const paymentCurrency = document.getElementById('paymentCurrency');
const supportedPaymentCurrencies = [
  'INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'QAR', 'OMR', 'BHD', 'KWD', 'SGD',
  'MYR', 'AUD', 'NZD', 'CAD', 'CHF', 'CNY', 'JPY', 'KRW', 'THB', 'IDR', 'PHP',
  'VND', 'PKR', 'BDT', 'LKR', 'NPR', 'ZAR', 'NGN', 'KES', 'EGP', 'TRY', 'BRL',
  'MXN', 'HKD', 'TWD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'RUB', 'ILS', 'CLP',
  'COP', 'ARS', 'GHS', 'MAD',
];

function populatePaymentCurrencies() {
  const currencies = window.TIME2INCOME_CURRENCY.currencies;
  const options = supportedPaymentCurrencies.map(code => {
    const currency = currencies.find(item => item.code === code);
    if (!currency) throw new Error(`Payment currency metadata is unavailable for ${code}.`);
    const amount = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: window.TIME2INCOME_CURRENCY.decimals(code),
      maximumFractionDigits: window.TIME2INCOME_CURRENCY.decimals(code),
    }).format(1);
    return new Option(`${currency.name} (${code}) — ${amount}`, code);
  });
  paymentCurrency.replaceChildren(...options);
}

function showPaymentMessage(message, isError = false) {
  paymentMessage.textContent = message;
  paymentMessage.dataset.error = String(isError);
}

async function paymentFunctionError(error) {
  if (!error) return new Error('An unknown payment error occurred.');
  if (error?.context instanceof Response) {
    const body = await error.context.clone().json().catch(() => null);
    if (body && typeof body.error === 'string') return new Error(body.error);
  }
  if (typeof error.message === 'string' && error.message.includes('Failed to send a request to the Edge Function')) {
    return new Error('Could not connect to payment service. Check your connection or deployment origin and try again.');
  }
  return error;
}

async function getPaymentStatus() {
  const { data: hasAccess, error } = await supabaseClient.rpc('has_active_platform_access');
  if (error) throw error;
  return { has_access: hasAccess };
}

async function initializePaymentPage() {
  populatePaymentCurrencies();
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  if (!data.session) {
    window.location.replace('auth.html?mode=signin');
    return;
  }

  const status = await getPaymentStatus();
  if (status.has_access) {
    window.location.replace('index.html');
    return;
  }

  try {
    const savedCurrency = localStorage.getItem('time2income_currency');
    const accountCurrency = data.session.user.user_metadata?.preferred_currency;
    const preferredCurrency = supportedPaymentCurrencies.includes(savedCurrency) ? savedCurrency : accountCurrency;
    if (supportedPaymentCurrencies.includes(preferredCurrency)) paymentCurrency.value = preferredCurrency;
  } catch (error) {
    console.warn('Could not read saved payment currency:', error);
  }
}

activateButton.addEventListener('click', async () => {
  if (!window.Razorpay) {
    showPaymentMessage('Secure checkout could not load. Check your connection and try again.', true);
    return;
  }

  activateButton.disabled = true;
  showPaymentMessage('Preparing secure checkout…');
  try {
    const { data: order, error } = await supabaseClient.functions.invoke('create-order', {
      body: { currency: paymentCurrency.value },
    });
    if (error) throw await paymentFunctionError(error);
    if (!order?.order_id || !order?.key_id) throw new Error('The payment order could not be created.');
    if (supportedPaymentCurrencies.includes(order.currency)) paymentCurrency.value = order.currency;

    const checkout = new Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'TIME2INCOME',
      description: 'One-time account activation',
      order_id: order.order_id,
      prefill: { email: order.user_email },
      theme: { color: '#17694f' },
      handler: async response => {
        showPaymentMessage('Verifying payment securely…');
        try {
          const { data, error: verifyError } = await supabaseClient.functions.invoke('verify-payment', {
            body: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
          });
          if (verifyError) throw await paymentFunctionError(verifyError);
          if (!data?.verified || !data?.has_access) throw new Error('Payment verification was not completed.');
          showPaymentMessage('Payment verified. Your account is activated.');
          window.location.replace('index.html');
        } catch (error) {
          console.error('Payment verification failed:', error);
          showPaymentMessage(error.message || 'Payment could not be verified. Contact support before trying again.', true);
          activateButton.disabled = false;
        }
      },
      modal: {
        ondismiss: () => {
          showPaymentMessage('Checkout was closed. You have not been charged unless your bank completed the payment.');
          activateButton.disabled = false;
        },
      },
    });

    checkout.on('payment.failed', event => {
      console.error('Razorpay payment failed:', event.error);
      showPaymentMessage(event.error?.description || 'Payment failed. Please try again.', true);
      activateButton.disabled = false;
    });
    checkout.open();
    showPaymentMessage('Complete payment in the secure Razorpay window.');
  } catch (error) {
    console.error('Could not start Razorpay checkout:', error);
    showPaymentMessage(error.message || 'Could not start checkout. Please try again.', true);
    activateButton.disabled = false;
  }
});

document.getElementById('signOutButton').addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    showPaymentMessage(error.message, true);
    return;
  }
  window.location.replace('auth.html?mode=signin');
});

initializePaymentPage().catch(error => {
  console.error('Could not load payment status:', error);
  showPaymentMessage(error.message || 'Could not verify account activation. Please refresh and try again.', true);
  activateButton.disabled = true;
});
