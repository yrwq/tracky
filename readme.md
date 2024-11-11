# Tracky

## Setup Local Development

### Backend

Api is Hosted on [shuttle](https://www.shuttle.dev/)

```bash
# install
curl -sSfL https://www.shuttle.dev/install | bash
# login
shuttle login
```

Database is hosted on [supabase](https://supabase.com/)

Setup `.env` from `.env.example`

```bash
# run postgresql docker locally
docker compose up -d
# run shuttle backend
shuttle run
```

The api is now live on `localhost:8000`

### Frontend

- [ ] TODO [yew](https://yew.rs/)

## Deployment

### Backend

```bash
shuttle deploy
```
