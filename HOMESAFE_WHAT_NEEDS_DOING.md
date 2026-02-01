# GRACE-X AI HOMESAFE — What Needs Doing

**Project:** GRACE-X AI™ v6.5.1 GALVANIZED (HOMESAFE)  
**Status:** Production ready. No mandatory changes.  
**Last updated:** February 2026

---

## Summary

The system is **production ready** and **bulletproof** per the latest audit. Nothing is required before use. Optional improvements are listed below if you want to enhance security or family features later.

---

## Required Before First Use

| Task | Status | Notes |
|------|--------|------|
| Add API key to `server/.env` | ⬜ Do once | Copy from `env.template`, add your Anthropic/OpenAI key |
| Run `npm install` in `server/` | ⬜ Do once | If not already done |
| Start app: `START.bat` or `./START.sh` | — | Backend :3000, frontend :8080 |

---

## Optional (Not Blocking)

**Security (for public deployment)**  
- Use HTTPS in production  
- Restrict CORS to your domain  
- Add request logging if you need audit trails  

**Child safety / family**  
- Parental control dashboard  
- Usage time limits  
- Content age ratings  

**Docs**  
- User-facing safety guide  
- Parent/guardian guide  

---

## Quick Start

1. **Configure:** Edit `server/.env` — add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`.
2. **Start:** Double‑click `START.bat` (Windows) or run `./START.sh` (Mac/Linux).
3. **Open:** Go to `http://localhost:8080` (or :3000 if server serves frontend).

---

## Key Files

- **Audit report:** `GRACE-X_AI_HOMESAFE_AUDIT_REPORT.md`
- **Setup:** `FIRST_TIME_SETUP.md`
- **Deploy:** `DEPLOYMENT.md`
- **This summary:** `HOMESAFE_WHAT_NEEDS_DOING.md`

---

**Verdict:** No critical work left. Configure API key, start the app, then push this repo to your new remote when ready.
