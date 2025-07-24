# 🔥 Ahead – Streaks Coding Challenge

> A full‑stack take‑home that re‑implements the “streak” mechanic popular in mobile apps.
> Tech stack — **Next.js 15 (App Router)** · **TypeScript** · **pnpm workspaces** · **date‑fns / date‑fns‑tz** · **MUI + TailwindCSS** · **Jest**.

---

## 1 · Demo

| Route        | What you’ll see                                                                       |
| ------------ | ------------------------------------------------------------------------------------- |
| `/home`      | Live streak based on your WakaTime activity (optional – requires `WAKATIME_API_KEY`). |
| `/home/1..3` | The three mock cases described in the task brief.                                     |

---

## 2 · Repository layout

```text
.
├─ apps/web                  # Next.js front‑end + API routes
│  ├─ app/api/streaks/[case] # mock JSON endpoint (case 1–3)
│  ├─ app/api/streaks/live   # WakaTime → streak endpoint
│  ├─ components/            # shared React components
│  └─ public/                # logo + svg assets
├─ packages/lib-streaks      # pure streak calculation library
│  ├─ data/                  # case‑1..3 JSON fixtures
│  └─ src/                   # TS sources + Jest tests
└─ pnpm-workspace.yaml
```

> **Why a monorepo?** Separation of concerns: the algorithm lives in a reusable package with its own tests; the web app is thin glue + UI.

---

## 3 · Streak algorithm (`packages/lib-streaks`)

```ts
calcStreak(
  today: Date,                  // JS Date (any time) in _server_ clock
  activityMap: Map<string, number>,
  timezone: string,             // IANA tz, e.g. 'Europe/Berlin'
): StreakResponse
```

1. **Normalize** `today` → user timezone via `date-fns-tz/toZonedTime`.

2. Build a **7‑day window**: `today‑6 … today`.

3. **State rules**

   | state      | when                                                       |
   | ---------- | ---------------------------------------------------------- |
   | COMPLETED  | ≥ 1 activity                                               |
   | AT\_RISK   | 1–2 idle days after a completed day                        |
   | SAVED      | after 1 idle day → ≥ 2 activities **OR** 2 idle days → ≥ 3 |
   | INCOMPLETE | everything else (including future pad)                     |

4. **Pad future** if window would be shorter than 7.

Unit tests cover straight streak, recovery, padding and tz boundary (+14 islands).

---

## 4 · API routes

| Route                    | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `GET /api/streaks/:case` | Reads `packages/lib-streaks/data/case‑N.json` & returns calc result. |
| `GET /api/streaks/live`  | Pulls last 7 days from WakaTime and pipes through `calcStreak`.      |

**Headers**

```
x-user-timezone: Europe/Berlin
```

---

## 5 · Front‑end (apps/web)

* **App Router** pages under `/home` + dynamic `/home/[case]`.
* **Material‑UI** + **Tailwind** (for quick util classes).
* Streak UI: 7 dots with colour coding
  ✅ COMPLETED · ⚠️ AT\_RISK · ⚡ SAVED · ○ INCOMPLETE.
* Light‑mode only – CSS custom‑props; dark‑mode is disabled for clarity.

---

## 6 · Setup

```bash
git clone https://github.com/<yourname>/ahead-streaks.git
cd ahead-streaks
pnpm install           # install workspace deps

# optional: live WakaTime endpoint
echo "WAKATIME_API_KEY=waka_xxx" > .env.local

pnpm --filter web dev
# open http://localhost:3000/home
```

*Node ≥ 20.11 required.*

---

## 7 · Scripts

| Script                     | What it does                       |
| -------------------------- | ---------------------------------- |
| `pnpm dev -F web`          | Next.js dev server                 |
| `pnpm build -F web`        | `next build`                       |
| `pnpm start -F web`        | `next start`                       |
| `pnpm test`                | run **all** package tests          |
| `pnpm test -F lib-streaks` | run library unit tests only        |
| `pnpm -r build`            | type‑check & compile every package |

---

## 8 · Environment

| Variable           | Used by             | Purpose                       |
| ------------------ | ------------------- | ----------------------------- |
| `WAKATIME_API_KEY` | `/api/streaks/live` | Personal API key (Basic auth) |

*(Mock routes do not need secrets.)*

---

## 9 · CI / quality

* **strict TS** everywhere (`noUncheckedIndexedAccess`, etc.)
* **Jest** with ts‑jest preset.
* Pre‑configured **.gitignore**

---

## 10 · Future work

* Persist streaks in **Firestore** & send FCM pushes when `AT_RISK`.
* Add e2e tests with **Cypress**.
* Dark‑mode toggle.
* Configurable window length (14/30 days).

---

## 11 · Author

**Krishna Sathyan**
[krishsat9937@gmail.com](mailto:krishsat9937@gmail.com) · [LinkedIn](https://www.linkedin.com/in/krishnasathyan)

<p align="center">— Made with ❤️ for Ahead —</p>
