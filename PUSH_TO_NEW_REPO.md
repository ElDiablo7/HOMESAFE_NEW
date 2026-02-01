# Push GRACE-X AI HOMESAFE to a New Repo

The folder `FORGE_31.01` is now a Git repo with one commit. Push it to a new remote like this.

---

## Option A: GitHub Desktop (easiest)

1. **Create the new repo on GitHub**
   - Go to https://github.com/new
   - Name it e.g. `gracex-ai-homesafe` (or any name)
   - Do **not** add a README, .gitignore, or license (repo should be empty)

2. **Add this folder in GitHub Desktop**
   - Open **GitHub Desktop**
   - **File → Add Local Repository**
   - Choose: `C:\Users\anyth\Desktop\FORGE_31.01`
   - If it says "not a Git repository", the folder already has `.git` (we initialised it) — it should detect it

3. **Publish to GitHub**
   - Click **Publish repository**
   - Pick your GitHub account and the new repo name
   - Uncheck **Keep this code private** if you want it public
   - Click **Publish Repository**

Done. Your code is on GitHub.

---

## Option B: Command line

1. **Create the new repo on GitHub**
   - https://github.com/new
   - Name it e.g. `gracex-ai-homesafe`
   - Leave it empty (no README, no .gitignore)

2. **Add remote and push**
   - Open PowerShell or Command Prompt and run:

```bash
cd C:\Users\anyth\Desktop\FORGE_31.01
git remote add origin https://github.com/YOUR_USERNAME/gracex-ai-homesafe.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `gracex-ai-homesafe` with your GitHub username and repo name.

If you use SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/gracex-ai-homesafe.git
git branch -M main
git push -u origin main
```

---

## What’s in the repo

- **Included:** All app code, docs, assets, `server/` (no `node_modules`), config templates.
- **Excluded by .gitignore:** `.env`, `BIG_ZAC.env.TXT`, `node_modules/`, `backups/`, so secrets and heavy folders stay local.

After pushing, anyone who clones the repo should:
1. Copy `server/env.example.txt` to `server/.env` and add their API key.
2. Run `npm install` in `server/`.
3. Start with `START.bat` or `./START.sh`.

See **HOMESAFE_WHAT_NEEDS_DOING.md** for a short summary of what’s required to run the app.
