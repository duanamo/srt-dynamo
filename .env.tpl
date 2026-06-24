# internal-webapp-template — local development environment (1Password template)
#
# COMMITTED file, NO secrets — only 1Password references resolved at runtime from
# the "Innovation" 1Password vault. For LOCAL DEV ONLY; EC2 envs come from
# GitHub Secrets at deploy time (see CLAUDE.md → Environment Variables).
#
# NOTE: this is the scaffold template. When you spin up a NEW app from it,
# replace "internal-webapp-template" in the refs below with the new app's
# 1Password item name (e.g. the path Innovation/<new-app>/SUPABASE_SECRET_KEY).
#
# One-time:  brew install 1password-cli && op signin
# Run app (secrets injected, nothing written to disk):
#   op run --env-file=.env.tpl -- npm run dev
# Or materialize a gitignored .env:
#   op inject -i .env.tpl -o .env

# Supabase
PUBLIC_SUPABASE_URL=op://Innovation/internal-webapp-template/PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_PUBLISHABLE_KEY=op://Innovation/internal-webapp-template/PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY=op://Innovation/internal-webapp-template/SUPABASE_SECRET_KEY

# App (local-dev constant — not a secret)
ORIGIN=http://localhost:3000
