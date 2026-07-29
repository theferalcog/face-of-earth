# DEPLOY FACE OF EARTH v0.1 - RIGHT NOW

Complete codebase is ready. Here's exactly what to do to go live.

---

## STEP 1: Review the Code (30 minutes)

Read these in order:

1. **CODEBASE_SUMMARY.md** - Understand what was built
2. **METHODOLOGY.md** - Verify calculations match your framework
3. Spot-check key files:
   - `pages/api/coherence.js` - Verify data and formulas
   - `lib/geometry.js` - Verify geometric calculations
   - `lib/normalization.js` - Verify coherence score formulas

**Goal:** Make sure everything aligns with your vision. Change anything that doesn't.

If you see issues, fix them locally before deploying.

---

## STEP 2: Get GitHub Account (5 minutes if you don't have one)

If you have a GitHub account: skip to STEP 3

If not:
1. Go to github.com
2. Click "Sign up"
3. Create account (username, email, password)
4. Verify email
5. Done

---

## STEP 3: Create GitHub Repo (5 minutes)

1. Go to github.com/new
2. Repository name: `face-of-earth`
3. Description: "The Face of Earth - Planetary Coherence Diagnostic v0.1"
4. Public (so others can see it for Sigma Gamma Challenge)
5. Click "Create repository"

Don't initialize with README (we have one already).

---

## STEP 4: Push Code to GitHub (5 minutes)

In terminal, from the `/home/claude/face-of-earth/` directory:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Face of Earth v0.1"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/face-of-earth.git

# Rename main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## STEP 5: Deploy to Vercel (5 minutes)

1. Go to vercel.com
2. Click "Sign up" (or sign in if you have account)
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub
5. You should see your `face-of-earth` repo in the list
6. Click "Import"
7. Configure project settings (defaults are fine)
8. Click "Deploy"

Wait 2-3 minutes.

Vercel will:
- Download your code from GitHub
- Install dependencies
- Build Next.js app
- Deploy to CDN
- Give you a live URL

---

## STEP 6: Verify It's Live (2 minutes)

Your Face should now be live at:

`https://face-of-earth.vercel.app`

(Or whatever custom domain you set)

Check:
- [ ] Page loads (see dark background)
- [ ] Hexagon visible with 6 vertices
- [ ] Eyes (cyan infinity loops) visible
- [ ] Mouth (orange-red curve) visible
- [ ] Click info panel toggle (bottom right)
- [ ] Shows all 6 system scores
- [ ] Shows momentum and trajectory

If anything doesn't work, check:
- Vercel deployment logs
- Browser console (F12)
- /api/coherence endpoint directly

---

## STEP 7: Launch Sigma Gamma Challenge (variable)

Now that Face of Earth v0.1 is live, you can announce the challenge.

**Pitch to institutions:**

> We built The Face of Earth - a real-time planetary coherence diagnostic rendered as live geometry.
>
> The data is real. The mathematics is transparent. The methodology is open.
>
> It's incomplete. We built it to be challenged.
>
> The Sigma Gamma Challenge: Build a more accurate version. If your Face predicts planetary behavior better than ours, it runs here.
>
> Rules: Math only. Verifiable data. Transparent methodology. Historical validation.

**Where to send it:**

- Research institutions (climate centers, complexity labs, systems departments)
- Universities (especially those with strong modeling programs)
- Think tanks and research institutes
- Academic conferences and networks

---

## NEXT: What to Do With the Challenge

Once people start submitting:

1. **Evaluate submissions** by mathematical quality
2. **Test against historical accuracy** - does it predict better?
3. **Integrate the best ones** into the canonical Face
4. **Update METHODOLOGY.md** with any improvements
5. **Deploy updated version** to Vercel

Each iteration makes the Face more accurate.

---

## AFTER DEPLOYMENT: Maintenance

### Update Data Regularly

Edit `pages/api/coherence.js`:

```javascript
const CURRENT_DATA = {
  climate: {
    globalTempAnomalyC: 1.15,  // ← Update these as new data comes in
    co2ppm: 426,
    extremeWeatherTrendPercent: 7
  },
  // ... etc
};
```

Then:

```bash
git add pages/api/coherence.js
git commit -m "Update data for [month]"
git push origin main
```

Vercel auto-deploys. Face updates live in 2-3 minutes.

### Monitor Performance

Check /api/coherence endpoint occasionally to verify:
- No errors
- Correct data
- Expected scores

### Document Changes

Update METHODOLOGY.md if you:
- Change formulas
- Change data sources
- Change thresholds

Keep methodology in sync with code.

---

## TROUBLESHOOTING

**"Face doesn't render"**
- Check browser console (F12)
- Check Vercel logs
- Make sure GPU acceleration enabled
- Try different browser

**"Data shows as 0"**
- Check /api/coherence endpoint
- Verify CURRENT_DATA is populated
- Check normalization formulas

**"Three.js error"**
- Check node_modules installed (`npm install`)
- Check Three.js import in FaceRenderer.js
- Clear browser cache and reload

**"Stuck on loading"**
- Check network tab (F12)
- Verify API endpoint responding
- Check Vercel deployment status

---

## That's It

You're done.

The Face is live. The methodology is published. The Sigma Gamma Challenge is open.

Institutions will build. Researchers will compete. The Face will improve iteratively.

Everything you need to make this work is in the code.

You own it completely.

**Go live.**

---

## Files You Should Know About

- `METHODOLOGY.md` - Show this to researchers (explains everything)
- `README.md` - Show this to developers (deployment/contribution guide)
- `/api/coherence` - This endpoint is the heart (raw data output)
- `pages/index.js` - This page is the interface
- `lib/geometry.js` - This file is the math

Everything else is scaffolding.

---

## One Last Thing

After you deploy and it's live, send this to people:

> **The Face of Earth**
>
> A real-time diagnostic of planetary coherence.
>
> The hexagon shows which systems are failing.
> The eyes show where we're headed.
> The mouth shows how fast it's happening.
>
> The eyes never lie.
>
> https://[yoururl]
>
> **The Sigma Gamma Challenge:** If you can make this more accurate, we want your version here.

That's all they need to know.

---

**Now go. Deploy this thing.**
