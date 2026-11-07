(function () {
  'use strict';

  const LOCATION_KEY = 'time2income_selected_location';
  const GEOCODER_URL = 'https://photon.komoot.io';
  const gateway = document.getElementById('locationGateway');
  if (!gateway) return;

  const gpsButton = document.getElementById('detectCurrentLocation');
  const gpsStatus = document.getElementById('gpsLocationStatus');
  const searchInput = document.getElementById('manualLocationSearch');
  const searchStatus = document.getElementById('manualLocationStatus');
  const suggestions = document.getElementById('locationSuggestions');
  const clearSearchButton = document.getElementById('clearLocationSearch');
  const selectedPreview = document.getElementById('selectedLocationPreview');
  const continueButton = document.getElementById('continueWithLocation');
  const locationLink = document.getElementById('locationContextLink');
  let selectedLocation = null;
  let searchTimer = null;
  let searchController = null;
  let activeSuggestionIndex = -1;
  let suggestionsData = [];

  function readSelectedLocation() {
    for (const getStorage of [() => window.localStorage, () => window.sessionStorage]) {
      try {
        const storage = getStorage();
        const value = storage.getItem(LOCATION_KEY);
        if (!value) continue;
        const location = JSON.parse(value);
        if (location && typeof location.city === 'string' &&
            typeof location.country === 'string' && /^[A-Z]{2}$/.test(location.countryCode || '')) {
          return location;
        }
      } catch (error) {
        console.warn('Could not read the saved marketplace location:', error);
      }
    }
    return null;
  }

  function saveSelectedLocation(location) {
    const value = JSON.stringify(location);
    try {
      window.localStorage.setItem(LOCATION_KEY, value);
    } catch (error) {
      console.warn('Could not save marketplace location as a local preference:', error);
      try {
        window.sessionStorage.setItem(LOCATION_KEY, value);
      } catch (sessionError) {
        throw new Error('Your browser could not save this location. Please enable site storage and try again.');
      }
    }
  }

  function displayLocation(location) {
    return [location.city, location.state, location.country].filter(Boolean).join(', ');
  }

  function accountLocation(location) {
    return {
      city: location.city,
      state: location.state,
      country: location.country,
      country_code: location.countryCode,
      postal_code: location.postalCode || ''
    };
  }

  function setStatus(element, message, state) {
    element.textContent = message;
    if (state) element.dataset.state = state;
    else delete element.dataset.state;
  }

  function isMissingAuthSession(error) {
    return error?.name === 'AuthSessionMissingError' || error?.message === 'Auth session missing!';
  }

  function normalizedLocation(feature, source) {
    const properties = feature?.properties || {};
    const coordinates = feature?.geometry?.coordinates || [];
    const latitude = Number(coordinates[1]);
    const longitude = Number(coordinates[0]);
    const postalCode = String(properties.postcode || '').trim();
    const countryCode = String(properties.countrycode || '').trim().toUpperCase();
    const rawCountry = String(properties.country || '').trim();
    const country = window.TIME2INCOME_COUNTRIES?.find(entry => entry.code === countryCode)?.name || rawCountry;
    const city = String(
      properties.city || properties.town || properties.village || properties.locality ||
      properties.municipality || properties.district || properties.county ||
      properties.name || postalCode
    ).trim();
    const state = String(properties.state || properties.region || properties.province || '').trim();

    if (!city || !country || !/^[A-Z]{2}$/.test(countryCode)) {
      throw new Error('This result is missing a city or country code. Choose another location.');
    }

    return {
      city,
      state,
      country,
      countryCode,
      postalCode,
      latitude: Number.isFinite(latitude) ? Math.round(latitude * 100) / 100 : null,
      longitude: Number.isFinite(longitude) ? Math.round(longitude * 100) / 100 : null,
      source,
      displayName: [city, state, country].filter(Boolean).join(', '),
      confirmedAt: new Date().toISOString()
    };
  }

  function selectLocation(location) {
    selectedLocation = location;
    document.getElementById('selectedLocationName').textContent = displayLocation(location);
    document.getElementById('selectedLocationCity').textContent = location.city || '—';
    document.getElementById('selectedLocationState').textContent = location.state || '—';
    document.getElementById('selectedLocationCountry').textContent =
      `${location.country} (${location.countryCode})`;
    document.getElementById('selectedLocationPostal').textContent = location.postalCode || '';
    selectedPreview.hidden = false;
    continueButton.disabled = false;
    document.getElementById('selectedLocationName').scrollIntoView?.({ block: 'nearest' });
  }

  function updateLocationLink(location) {
    if (!locationLink || !location) return;
    locationLink.querySelector('small').textContent = [location.city, location.country].filter(Boolean).join(', ');
    locationLink.hidden = false;
  }

  function featureLabel(feature) {
    const properties = feature.properties || {};
    const place = properties.city || properties.town || properties.village ||
      properties.locality || properties.name || properties.postcode || '';
    const details = [properties.state, properties.country].filter(Boolean).join(', ');
    return {
      title: String(place || properties.country || 'Location').trim(),
      details: details || String(properties.country || '').trim()
    };
  }

  function closeSuggestions() {
    suggestions.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    activeSuggestionIndex = -1;
  }

  function renderSuggestions(features) {
    suggestionsData = features;
    activeSuggestionIndex = -1;
    suggestions.replaceChildren();
    features.forEach((feature, index) => {
      const label = featureLabel(feature);
      const option = document.createElement('button');
      option.className = 'location-gateway-suggestion';
      option.type = 'button';
      option.id = `location-suggestion-${index}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      const title = document.createElement('strong');
      title.textContent = label.title;
      const detail = document.createElement('small');
      detail.textContent = label.details;
      option.append(title, detail);
      option.addEventListener('click', () => {
        try {
          selectLocation(normalizedLocation(feature, 'manual'));
          searchInput.value = displayLocation(selectedLocation);
          clearSearchButton.hidden = false;
          closeSuggestions();
          setStatus(searchStatus, 'Location selected. Confirm it below to continue.', 'success');
          setStatus(gpsStatus, '', '');
        } catch (error) {
          setStatus(searchStatus, error.message, 'error');
        }
      });
      suggestions.append(option);
    });
    suggestions.hidden = features.length === 0;
    searchInput.setAttribute('aria-expanded', String(features.length > 0));
  }

  async function searchLocations(query, signal) {
    if (signal === undefined) {
      if (searchController) searchController.abort();
      searchController = new AbortController();
      signal = searchController.signal;
    }
    const language = (() => {
      try {
        return localStorage.getItem('time2income_language') || navigator.language.split('-')[0] || 'en';
      } catch (error) {
        return navigator.language.split('-')[0] || 'en';
      }
    })();
    const endpoint = new URL(`${GEOCODER_URL}/api/`);
    endpoint.searchParams.set('q', query);
    endpoint.searchParams.set('limit', '6');
    endpoint.searchParams.set('lang', language);
    const response = await fetch(endpoint, {
      signal,
      headers: { Accept: 'application/geo+json, application/json' }
    });
    if (!response.ok) throw new Error(`Location search is temporarily unavailable (${response.status}). Try again shortly.`);
    const data = await response.json();
    return Array.isArray(data.features) ? data.features : [];
  }

  async function reverseGeocode(latitude, longitude) {
    const language = (() => {
      try {
        return localStorage.getItem('time2income_language') || navigator.language.split('-')[0] || 'en';
      } catch (error) {
        return navigator.language.split('-')[0] || 'en';
      }
    })();
    const endpoint = new URL('https://nominatim.openstreetmap.org/reverse');
    endpoint.searchParams.set('lat', String(latitude));
    endpoint.searchParams.set('lon', String(longitude));
    endpoint.searchParams.set('format', 'jsonv2');
    endpoint.searchParams.set('addressdetails', '1');
    endpoint.searchParams.set('zoom', '10');
    endpoint.searchParams.set('accept-language', language);
    let response;
    try {
      response = await fetch(endpoint, {
        headers: { Accept: 'application/json' }
      });
    } catch (error) {
      if (error?.name !== 'TypeError') throw error;
      throw new Error('Could not look up your location. Search for a city or postal code instead.');
    }
    if (!response.ok) {
      throw new Error(`Could not look up your location (${response.status}). Search for a city or postal code instead.`);
    }
    const data = await response.json();
    const address = data.address || {};
    const countryName = String(address.country || '').trim();
    const countryCode = address.country_code || data.country_code ||
      window.TIME2INCOME_COUNTRIES?.find(entry =>
        String(entry.name || '').toLowerCase() === countryName.toLowerCase()
      )?.code;
    return normalizedLocation({
      properties: {
        city: address.city || address.town || address.village || address.municipality ||
          address.city_district || address.suburb || address.county ||
          address.state_district || data.name,
        state: address.state || address.province || address.region,
        country: countryName,
        countrycode: countryCode,
        postcode: address.postcode
      },
      geometry: {
        coordinates: [Number(data.lon), Number(data.lat)]
      }
    }, 'gps');
  }

  function geolocationError(error) {
    if (error.code === 1) return 'Location permission was denied. Search for a city or postal code instead.';
    if (error.code === 2) return 'Your current location is unavailable. Search for a city or postal code instead.';
    if (error.code === 3) return 'Location detection timed out. Try again or search for a location manually.';
    return 'Could not detect your location. Search for a city or postal code instead.';
  }

  async function detectCurrentLocation() {
    if (!navigator.geolocation) {
      setStatus(gpsStatus, 'This browser does not support GPS location. Search for a city or postal code instead.', 'error');
      return;
    }
    gpsButton.disabled = true;
    gpsButton.setAttribute('aria-busy', 'true');
    setStatus(gpsStatus, 'Checking your location…', '');
    setStatus(searchStatus, '', '');
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          maximumAge: 60000,
          timeout: 15000
        });
      });
      setStatus(gpsStatus, 'Finding your city and country…', '');
      const location = await reverseGeocode(position.coords.latitude, position.coords.longitude);
      selectLocation(location);
      searchInput.value = displayLocation(location);
      clearSearchButton.hidden = false;
      setStatus(gpsStatus, 'Location detected. Confirm it below or change it in the search box.', 'success');
    } catch (error) {
      setStatus(gpsStatus, error?.code ? geolocationError(error) : error.message, 'error');
    } finally {
      gpsButton.disabled = false;
      gpsButton.removeAttribute('aria-busy');
    }
  }

  async function continueWithSelectedLocation() {
    if (!selectedLocation) {
      setStatus(searchStatus, 'Select a location before continuing.', 'error');
      return;
    }
    continueButton.disabled = true;
    continueButton.setAttribute('aria-busy', 'true');
    setStatus(searchStatus, 'Saving your location preference…', '');
    try {
      saveSelectedLocation(selectedLocation);
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      if (!data.session?.user) {
        window.location.replace('auth.html?mode=signin');
        return;
      }

      const { error: updateError } = await supabaseClient.auth.updateUser({
        data: { marketplace_location: accountLocation(selectedLocation) }
      });
      if (updateError) throw updateError;
      window.location.replace('index.html?page=marketplace');
    } catch (error) {
      if (isMissingAuthSession(error)) {
        console.warn('Location was saved on this device, but the sign-in session has expired. Redirecting to sign in.');
        window.location.replace('auth.html?mode=signin');
        return;
      }
      console.error('Could not continue with the selected location:', error);
      setStatus(searchStatus, error.message || 'Could not save the selected location. Please try again.', 'error');
      continueButton.disabled = false;
    } finally {
      continueButton.removeAttribute('aria-busy');
    }
  }

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    clearSearchButton.hidden = query.length === 0;
    selectedLocation = null;
    selectedPreview.hidden = true;
    continueButton.disabled = true;
    setStatus(gpsStatus, '', '');
    setStatus(searchStatus, '', '');
    if (searchTimer) clearTimeout(searchTimer);
    if (searchController) searchController.abort();
    if (query.length < 2) {
      closeSuggestions();
      return;
    }
    setStatus(searchStatus, 'Searching locations…', '');
    searchTimer = setTimeout(async () => {
      try {
        const features = await searchLocations(query);
        if (searchInput.value.trim() !== query) return;
        renderSuggestions(features);
        setStatus(searchStatus, features.length ? '' : 'No locations found. Try a nearby city, region or postal code.', features.length ? '' : 'error');
      } catch (error) {
        if (error.name === 'AbortError') return;
        setStatus(searchStatus, error.message || 'Location search failed. Please try again.', 'error');
        closeSuggestions();
      }
    }, 350);
  });

  searchInput.addEventListener('keydown', event => {
    if (suggestions.hidden) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex + (event.key === 'ArrowDown' ? 1 : -1) + suggestionsData.length) % suggestionsData.length;
      suggestions.querySelectorAll('[role="option"]').forEach((option, index) => {
        const active = index === activeSuggestionIndex;
        option.setAttribute('aria-selected', String(active));
        if (active) option.scrollIntoView({ block: 'nearest' });
      });
      searchInput.setAttribute('aria-activedescendant', `location-suggestion-${activeSuggestionIndex}`);
    } else if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
      event.preventDefault();
      suggestions.querySelectorAll('[role="option"]')[activeSuggestionIndex]?.click();
    } else if (event.key === 'Escape') {
      closeSuggestions();
    }
  });

  clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    selectedLocation = null;
    selectedPreview.hidden = true;
    continueButton.disabled = true;
    clearSearchButton.hidden = true;
    setStatus(searchStatus, '', '');
    setStatus(gpsStatus, '', '');
    closeSuggestions();
  });

  document.getElementById('editSelectedLocation').addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    selectedLocation = null;
    selectedPreview.hidden = true;
    continueButton.disabled = true;
    clearSearchButton.hidden = true;
    setStatus(searchStatus, 'Search for another city, area or postal code.', '');
  });

  gpsButton.addEventListener('click', detectCurrentLocation);
  continueButton.addEventListener('click', continueWithSelectedLocation);
  document.addEventListener('pointerdown', event => {
    if (!suggestions.contains(event.target) && event.target !== searchInput) closeSuggestions();
  });

  const existingLocation = readSelectedLocation();
  if (existingLocation) {
    selectedLocation = existingLocation;
    selectLocation(existingLocation);
    searchInput.value = displayLocation(existingLocation);
    clearSearchButton.hidden = false;
    updateLocationLink(existingLocation);
  }

  gateway.hidden = !document.documentElement.classList.contains('location-gateway-active');
  window.TIME2INCOME_LOCATION = {
    getSelected: readSelectedLocation,
    saveSelected: saveSelectedLocation,
    formatLabel: displayLocation,
    formatSearchLabel: location => [
      location.city,
      location.postalCode && location.postalCode !== location.city ? location.postalCode : '',
      location.state,
      location.country
    ].filter(Boolean).join(', '),
    search: async (query, signal) => {
      const features = await searchLocations(query, signal);
      return features.map(feature => normalizedLocation(feature, 'manual'));
    }
  };
})();
