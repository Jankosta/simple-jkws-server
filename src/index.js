// Jacob Pavlick - jmp0586

const express = require('express');

const keystore = require('./keystore');
const { jwksHandler, authHandler } = require('./handlers');

const PORT = process.env.PORT || 8080;

async function createApp() {
  await keystore.init(); // Create keys

  const app = express();
  app.use(express.json());

  // GET only endpoint
  app.get('/.well-known/jwks.json', jwksHandler);
  app.get('/jwks', jwksHandler);
  app.all(['/jwks', '/.well-known/jwks.json'], (req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  });

  // POST only endpoint
  app.post('/auth', authHandler);
  app.all('/auth', (req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
  });

  // GET only health check
  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
  app.all('/health', (req, res) => res.status(405).json({ error: 'Method Not Allowed' }));

  return app;
}

// Start the server
/* istanbul ignore next */
if (require.main === module) {
  createApp().then((app) => {
    app.listen(PORT, () => {
      console.log(`JWKS server listening on http://localhost:${PORT}`);
    });
  });
}

// Export for testing
module.exports = { createApp };
