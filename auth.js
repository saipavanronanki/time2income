'use strict';

const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const authSubmit = document.getElementById('authSubmit');
const signInTab = document.getElementById('signInTab');
const signUpTab = document.getElementById('signUpTab');
let authMode = 'signin';

function showAuthMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.dataset.error = String(isError);
}

function setAuthMode(mode) {
  authMode = mode === 'signup' ? 'signup' : 'signin';
  document.body.classList.toggle('auth-only-signup', authMode === 'signup');
  document.body.classList.toggle('auth-only-signin', authMode === 'signin');
  signInTab.setAttribute('aria-selected', String(authMode === 'signin'));
  signUpTab.setAttribute('aria-selected', String(authMode === 'signup'));
  document.getElementById('authTitle').textContent = authMode === 'signup' ? 'Create your account' : 'Welcome back';
  document.getElementById('authDescription').textContent = authMode === 'signup'
    ? 'Join the marketplace to hire help or offer your skills.'
    : 'Sign in to continue to your marketplace.';
  document.getElementById('authSubmit').textContent = authMode === 'signup' ? 'Create account' : 'Sign in';
  document.getElementById('authPassword').autocomplete = authMode === 'signup' ? 'new-password' : 'current-password';
  document.getElementById('authName').required = authMode === 'signup';
  document.getElementById('authCountry').required = authMode === 'signup';
  showAuthMessage('');
}

async function continueAuthenticatedUser() {
  const { data: hasAccess, error } = await supabaseClient.rpc('has_active_platform_access');
  if (error) {
    console.error('Platform access status check failed:', error);
    showAuthMessage('Your sign-in succeeded, but account access could not be checked. Please refresh or contact support.', true);
    return;
  }
  window.location.replace(hasAccess ? 'index.html' : 'payment.html');
}

async function submitAuth(event) {
  event.preventDefault();
  if (!authForm.reportValidity()) return;

  authSubmit.disabled = true;
  showAuthMessage('');
  try {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    if (authMode === 'signin') {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await continueAuthenticatedUser();
      return;
    }

    let preferredLanguage = 'en';
    try {
      preferredLanguage = localStorage.getItem('time2income_language') || 'en';
    } catch (error) {
      console.warn('Could not read saved language preference:', error);
    }

    const signup = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: document.getElementById('authName').value.trim(),
          role: document.getElementById('authRole').value,
          country: document.getElementById('authCountry').value.trim(),
          city: document.getElementById('authCity').value.trim(),
          primary_skill: document.getElementById('authSkill').value.trim(),
          hourly_rate: '',
          work_preference: 'Local',
          category: document.getElementById('authCategory').value,
          preferred_language: preferredLanguage,
          preferred_currency: window.TIME2INCOME_CURRENCY.suggestCurrency(document.getElementById('authCountry').value) || 'INR',
          languages: ''
        },
        emailRedirectTo: window.location.origin
      }
    });
    if (signup.error) throw signup.error;
    if (signup.data.session) {
      await continueAuthenticatedUser();
      return;
    }
    setAuthMode('signin');
    showAuthMessage('Account created. Check your email to confirm your account, then sign in.');
  } catch (error) {
    showAuthMessage(error.message || 'Unable to access your account. Please try again.', true);
  } finally {
    authSubmit.disabled = false;
  }
}

signInTab.addEventListener('click', () => setAuthMode('signin'));
signUpTab.addEventListener('click', () => setAuthMode('signup'));
document.getElementById('authRole').addEventListener('change', event => {
  document.getElementById('authProviderFields').hidden = event.target.value === 'client';
});
document.getElementById('forgotPasswordBtn').addEventListener('click', async () => {
  const email = document.getElementById('authEmail').value.trim();
  if (!email) {
    showAuthMessage('Enter your email address first.', true);
    document.getElementById('authEmail').focus();
    return;
  }
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    showAuthMessage('If an account exists for this address, password reset instructions will be sent.');
  } catch (error) {
    showAuthMessage(error.message || 'Unable to send password reset instructions.', true);
  }
});
authForm.addEventListener('submit', submitAuth);

signInTab.setAttribute('aria-controls', 'authForm');
signUpTab.setAttribute('aria-controls', 'authForm');
setAuthMode(new URLSearchParams(window.location.search).get('mode'));
supabaseClient.auth.getSession().then(({ data, error }) => {
  if (error) throw error;
  if (data.session) return continueAuthenticatedUser();
}).catch(error => {
  console.error('Session or platform access check failed:', error);
  showAuthMessage('Your session or account access could not be checked. Please refresh and try again.', true);
});
