# Teams but (actually) good API

A small API to sync plugin data to MongoDB, allowing retrieval across browsers and devices. Authentication is handled via Discord OAuth2.

This projet is for [Teams but actually good](https://github.com/LeonimusTTV/teams-but-actually-good)

## Requirements

- [Bun](https://bun.sh) or Node.js
- [MongoDB](https://www.mongodb.com) instance
- [Infisical](https://infisical.com) instance (for secrets management)
- A Discord application (for OAuth2)

## Environment variables

Secrets are pulled at runtime from [Infisical](https://infisical.com). The following env vars must be set locally (e.g. in a `.env` file):

```env
INFISICAL_TOKEN=      # Infisical access token
INFISICAL_PROJECT_ID= # Infisical project ID
MODE=                 # Infisical environment (e.g. development, production)
```

The following secrets must exist in Infisical:

```env
MONGO_URI=                # MongoDB connection string
JWT_SECRET=               # Secret used to sign JWTs
DISCORD_CLIENT_ID=        # Discord application client ID
DISCORD_CLIENT_SECRET=    # Discord application client secret
DISCORD_REDIRECT_URI=     # OAuth2 redirect URI (e.g. http://localhost:3000/auth/discord/callback)
DISCORD_API_ENDPOINT=     # Discord API base URL (https://discord.com/api)
```

## Setup

**Install dependencies:**

```bash
bun install
```

**Start the server:**

```bash
bun start
```

The server runs on port `3000` by default.

## Docker

**Build the image:**

```bash
docker build -t teams-but-actually-good-api .
```

**Run the container:**

```bash
docker run -p 3000:3000 \
  -e INFISICAL_TOKEN=your_token \
  -e INFISICAL_PROJECT_ID=your_project_id \
  -e MODE=production \
  teams-but-actually-good-api
```

## API

### Auth

| Method | Path                     | Description                                |
| ------ | ------------------------ | ------------------------------------------ |
| `GET`  | `/auth/discord`          | Redirects to Discord OAuth2 login          |
| `GET`  | `/auth/discord/callback` | OAuth2 callback — returns a JWT on success |

### Sync

All sync routes require a `Authorization: Bearer <token>` header.

| Method | Path             | Description                                                                  |
| ------ | ---------------- | ---------------------------------------------------------------------------- |
| `POST` | `/sync/upload`   | Upload plugin data (JSON string, sent as `{ "data": "<json>" }` in the body) |
| `GET`  | `/sync/download` | Download stored plugin data                                                  |
