# JWKS Server

A simple JSON Web Key Set (JWKS) and authentication server built with **Node.js** and **Express**.  
This project demonstrates how to serve JWKS for verifying JSON Web Tokens (JWTs) and how to issue tokens signed by the server's keys.

---

## Features

- **JWKS Endpoint** – Serves public keys for JWT verification.
- **Auth Endpoint** – Issues signed JWTs using an unexpired key.
- **Expired Key Support** – Optionally issues expired tokens for testing.
- **Health Check** – Quick endpoint to verify the server is running.
- **Comprehensive Tests** – Includes unit and integration tests for endpoints.
- **Linting** – Enforces code style via ESLint.

---

## Endpoints

### `GET /.well-known/jwks.json`

Returns the JSON Web Key Set.

```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "key-123",
      "use": "sig",
      "alg": "RS256",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

### `GET /jwks`

Alias of the above endpoint.

### `POST /auth`

Returns a signed JWT using a valid, unexpired key.

**Example response:**

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6..."
}
```

### `POST /auth?expired=1`

Returns a signed JWT using an expired key (for testing).

### `GET /health`

Health check endpoint. Returns:

```json
{
  "status": "ok"
}
```

---

## Installation & Setup

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/jwks-server.git
   cd jwks-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the server:
   ```bash
   npm start
   ```

The server will start on [http://localhost:8080](http://localhost:8080).

---

## Development

Lint code with ESLint:

```bash
npm run lint
```

Run test suite:

```bash
npm test
```

---

## Project Structure

```
src/
  index.js       # App setup and routes
  handlers.js    # Route handlers
  keystore.js    # Key management
tests/
  auth.test.js   # Tests for /auth
  index.test.js  # Tests for app setup and routes
  jwks.test.js   # Tests for /jwks
```

---

## References

- [HTTP](https://en.wikipedia.org/wiki/HTTP)
- [REST](https://en.wikipedia.org/wiki/REST)
- [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token)
- [RFC 7517: JSON Web Key (JWK)](https://datatracker.ietf.org/doc/rfc7517/)

---

## Acknowledgments

- Assistance was received from **Copilot** to aid in development of this project, particularly in setting up testing and linting.
- Assistance was received from **ChatGPT** in regards to README formatting and review.
