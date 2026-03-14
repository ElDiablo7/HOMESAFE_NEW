/**
 * GRACE-X Auth - Token storage and API login/register
 */
(function() {
  'use strict';
  var TOKEN_KEY = 'gracex_token';
  var API_BASE = window.GRACEX_API_BASE || 'http://localhost:3000';

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function setToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }

  function authHeaders() {
    var t = getToken();
    var h = { 'Content-Type': 'application/json' };
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }

  window.GRACEX_Auth = {
    getToken: getToken,
    setToken: setToken,
    isLoggedIn: function() { return !!getToken(); },
    logout: function() { setToken(''); },
    authHeaders: authHeaders,
    login: function(email, password) {
      return fetch(API_BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.success && data.token) {
          setToken(data.token);
          return data;
        }
        throw new Error(data.error || 'Login failed');
      });
    },
    register: function(email, password, name) {
      return fetch(API_BASE + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password, name: name || '' })
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.success && data.token) {
          setToken(data.token);
          return data;
        }
        throw new Error(data.error || 'Register failed');
      });
    }
  };
})();
