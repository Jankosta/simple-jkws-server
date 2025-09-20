const { SignJWT } = require('jose');

const keystore = require('./keystore');

async function jwksHandler(req, res) { // Return current public keys in JWKS
  const jwks = { keys: keystore.getUnexpiredPublicJwks() };
  return res.status(200).json(jwks);
}

async function authHandler(req, res) { // Force use of an expired key
  const { expired } = req.query;

  let keyEntry = null;
  if (expired !== undefined) {
    keyEntry = keystore.getAnExpiredKey();
    if (!keyEntry) { // No expired key available
      return res.status(404).json({ error: 'No expired key available' });
    }
  } else {
    keyEntry = keystore.getAnUnexpiredKey();
    if (!keyEntry) {
      return res
        .status(503)
        .json({ error: 'No unexpired signing key available' });
    }
  }

  // Current time in seconds
  const now = Math.floor(Date.now() / 1000);

  // If using expired key, set token exp to expired timestamp
  const tokenExp = Math.floor(keyEntry.expiresAt / 1000);
  const payload = {
    sub: 'test-user',
    iss: 'jwks-server',
    iat: now,
    exp: tokenExp,
  };

  // Sign with RS256
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid: keyEntry.publicJwk.kid })
    .sign(keyEntry.privateKey);

  // Return token
  return res.status(200).json({ token: jwt });
}

module.exports = {
  jwksHandler,
  authHandler,
};
