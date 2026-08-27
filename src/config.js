/**
 * config.js — Shared runtime configuration
 *
 * Centralizes the server's base URL so every module can build
 * correct absolute URLs (e.g. for the /watch proxy page).
 *
 * Priority order for base URL:
 *  1. RENDER_EXTERNAL_URL — automatically set by Render.com
 *  2. ADDON_URL           — manually set in .env (for other hosts)
 *  3. http://localhost:PORT — fallback for local development
 */

const os = require('os');

function getLocalIp() {
  // Hardcoding the exact Wi-Fi interface IP to guarantee Stremio on the phone connects properly
  return '192.168.0.123';
}

const PORT = parseInt(process.env.PORT, 10) || 7000;

const BASE_URL = (
  process.env.ADDON_URL ||                                      // Manual override for other hosts
  process.env.RENDER_EXTERNAL_URL ||                            // Render sets this automatically
  (process.env.WEBSITE_HOSTNAME ? `https://${process.env.WEBSITE_HOSTNAME}` : null) || // Azure automatically sets this
  `http://${getLocalIp()}:${PORT}`                              // Local dev fallback to LAN IP
).replace(/\/$/, '');                                           // Strip trailing slash if any

const CF_PROXY_URL = process.env.CF_PROXY_URL ? process.env.CF_PROXY_URL.replace(/\/$/, '') : null;

module.exports = { PORT, BASE_URL, CF_PROXY_URL };
