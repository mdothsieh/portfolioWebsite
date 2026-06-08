#!/usr/bin/env bash
# Syncs Claude usage data and pushes to trigger a Vercel redeploy.
# Runs daily via launchd (~/Library/LaunchAgents/com.martinhsieh.portfolio-sync.plist)
set -euo pipefail

REPO="$HOME/Documents/claudeWork/portfolioWebsite"
LOG="$REPO/scripts/sync-deploy.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

log "Starting Claude usage sync"

cd "$REPO"

# Regenerate snapshot from local transcripts
node scripts/sync-claude-usage.mjs >> "$LOG" 2>&1

# Only commit + push if the snapshot actually changed
if git diff --quiet data/claude-usage.json; then
  log "No changes in claude-usage.json — skipping push"
  exit 0
fi

git add data/claude-usage.json
git commit -m "chore: sync Claude usage data $(date '+%Y-%m-%d')"
git push origin main

log "Pushed — Vercel will redeploy automatically"
