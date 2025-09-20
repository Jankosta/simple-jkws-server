const { generateKeyPair, exportJWK } = require('jose');

const TWO_HOURS = 2 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// Key list { kid, privateKey, publicJwk, expiresAt }
const keystore = [];

// Create and store a new RSA key pair
async function registerKey(kid, expiresAt) {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const publicJwk = await exportJWK(publicKey);
  publicJwk.kid = kid;
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';

  keystore.push({
    kid, privateKey, publicJwk, expiresAt,
  });
}

// Initialize with one valid and one expired key
async function init() {
  keystore.length = 0;
  const now = Date.now();
  await registerKey(`key-${now}`, now + TWO_HOURS); // Valid for 2h
  await registerKey(`expired-${now}`, now - ONE_HOUR); // Expired 1h ago
}

// Return public JWKs that are valid
function getUnexpiredPublicJwks() {
  const now = Date.now();
  return keystore.filter((k) => k.expiresAt > now).map((k) => k.publicJwk);
}

// Look up key by kid
function findKeyByKid(kid) {
  return keystore.find((k) => k.kid === kid);
}

// Get a expired key
function getAnExpiredKey() {
  const now = Date.now();
  return keystore.find((k) => k.expiresAt <= now);
}

// Get an unexpired key
function getAnUnexpiredKey() {
  const now = Date.now();
  return keystore.find((k) => k.expiresAt > now);
}

module.exports = {
  init,
  getUnexpiredPublicJwks,
  findKeyByKid,
  getAnExpiredKey,
  getAnUnexpiredKey,
};
