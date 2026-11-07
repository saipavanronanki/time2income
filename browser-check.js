/* ES5 only: must parse on very old browsers. Shows a message instead of a blank screen. */
(function () {
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var forced = isLocal && /[?&]legacytest=1/.test(location.search);
  var installedApp = false;
  try {
    installedApp = !!(window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches))
      || window.navigator.standalone === true
      || String(document.referrer).indexOf('android-app://') === 0;
  } catch (error) {}
  var legacy = forced;
  if (!forced && installedApp) {
    try {
      new Function('var a = {}; return a?.b ?? 1;');
    } catch (error) {
      legacy = true;
    }
  }
  if (!legacy) return;
  window.__t2iLegacyBrowser = true;
  function show() {
    var box = document.createElement('div');
    box.setAttribute('role', 'alert');
    box.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;background:#f1f3f7;color:#121e30;font-family:sans-serif;padding:24px;overflow:auto;line-height:1.5;text-align:center';
    box.innerHTML =
      '<h1 style="font-size:22px;margin:24px 0 8px">TIME2INCOME</h1>' +
      '<p style="font-size:16px;font-weight:700">Your browser is too old to run this app.</p>' +
      '<p style="font-size:15px">Update <b>Chrome</b> and <b>Android System WebView</b> from Google Play, then open this app again. You can also open <b>time2income.com</b> in an updated Chrome, Firefox, Edge or Samsung Internet.</p>' +
      '<p style="font-size:16px;font-weight:700;margin-top:20px">आपका ब्राउज़र बहुत पुराना है।</p>' +
      '<p style="font-size:15px">Google Play से <b>Chrome</b> और <b>Android System WebView</b> अपडेट करें, फिर ऐप दोबारा खोलें। या <b>time2income.com</b> को नए Chrome, Firefox, Edge या Samsung Internet में खोलें।</p>';
    document.body.appendChild(box);
  }
  if (document.body) show();
  else document.addEventListener('DOMContentLoaded', show);
})();
