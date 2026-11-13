# 静水之滨 · Still Waters

A 3D **first-person / third-person open-world fishing game** that runs in the browser.
No external art assets — the island, the fish, the weather and every sound are
generated procedurally at runtime from a single seed.

```
openworld-fishing/
├── index.html               UI skeleton (loading / menu / HUD / panels)
├── src/
│   ├── main.js              boot, menus, fixed-step loop, all wiring
│   ├── core/                engine (renderer+quality tiers), input, save, util (noise/math)
│   ├── world/               terrain, water, sky/day-night, weather, vegetation, props, world
│   ├── entities/            player controller, low-poly angler character
│   ├── fishing/             state machine (cast → bite → fight → landing),
│   │                        fightVisuals (surface fish + big-fish reveal)
│   ├── systems/             progression, species selection, tutorial, kitchen, contest
│   ├── data/                66 fish, gear tables, fishing spots, size classes
│   └── ui/                  HUD, panels (journal/kitchen/shop/map/gallery/settings),
│                            minimap, audio (40 one-shots + 8 ambience beds)
└── scripts/                 headless verification + offline data audit
```

## Quick start

```bash
cd openworld-fishing
npm install
npm run dev          # http://127.0.0.1:5177
```

Production build:

```bash
npm run build        # -> dist/
npm run preview      # http://127.0.0.1:5178
```

Click the canvas to lock the mouse, then walk to the lake and press **F**.

### Controls

| Key | Action |
|---|---|
| `W A S D` | Walk / swim / row |
| `Shift` | Sprint / row harder |
| `Space` | Jump · swim up |
| `Ctrl` | Dive |
| Mouse | Look — click the canvas to capture the pointer (the game shows a hint when unlocked) |
| Right-drag | Look when the pointer is not captured (fallback for browsers that deny the lock) |
| `[` / `]` | Turn left / right (keyboard fallback) |
| `,` / `.` | Look up / down (keyboard fallback) |
| `V` | Toggle first / third person |
| `F` (hold, release) | Charge and cast |
| Left mouse | Reel · strike when the float goes under |
| `R` | Reel in — or release the fish on the catch card |
| Right mouse | Pump the rod: dumps tension, wins a little line back |
| `Z` / `X` | Relax / tighten the drag during a fight |
| `B` | Board / leave the boat |
| `G` | Summon a rowboat to the nearest water and climb in |
| `T` | Charter out to an offshore mark (press again to come home) |
| `C` | Campfire cooking |
| `K` | Start / end a fishing contest |
| `H` | Eat the smallest fish in your keeper net |
| `J` | Sleep at the campfire (restores health & sanity) |
| `T` | 出海 — charter a boat to an offshore mark (or row home) |
| `1` / `2` / `3` | Cycle bait · cycle lure · remove bait |
| `Tab` | Journal · gear · kitchen · shop · quests · map · gallery · settings |
| `M` | Map |
| `N` | Minimap local / world |
| `P` | Photo mode (`F` shoot, `1`–`5` filter, `H` hide UI) |
| `F1` | Performance overlay |
| `Esc` | Pause (settings) |

## What is in the game

**World.** A 1200 × 1200 m procedural island: an irregular coastline, a mountain
massif, a crater lake, a river gorge, an outlet stream, a pond, a misty swamp with
pools, a coral reef plateau and open ocean down to −34 m. One heightfield is
shared by physics, the water shader, vegetation placement, the minimap and the map
panel, so no two systems can disagree about where the ground is.

**Water.** The wave field is defined once in `WAVE_DEFS` and consumed twice — the
GLSL is generated from it and `waveHeight()` evaluates the same sum on the CPU — so
the bobber, boats and buoys float on the water you can actually see. Depth is read
from a half-float height texture for turquoise shallows, dark blue drop-offs,
shoreline foam, rain pockmarks and an underwater colour grade.

**Time & weather.** A full sun/moon cycle drives a sky-dome shader, cloud layer,
star field, hemisphere/ambient lighting, shadow direction and fog. Weather is a
Markov chain (`clear → cloudy → rain → storm → fog → snow`) with rain/snow
particles, splash rings on the surface, lightning flashes with thunder, wind that
drives the clouds and changes the wave height, and an 8-day lunar cycle that
shifts the night bite.

**Golden hour (v3.0.0).** Eleven named phases (黎明 → 日出 → 清晨 → 正午 → 下午 →
日落 → 暮色 → 夜晚) drive a golden-hour factor: the clouds take the horizon colour,
a textured glare sprite blooms around the low sun, and a screen-space warm flare
follows the sun's projected position. Sunset is warmer than sunrise, and both are
prime feeding windows. The sea state feeds the economy: rough water pays more.

**Offshore fishing (v3.1–v3.5).** Sea state (glassy → storm surf) is computed from
wave height, wind and rain, and it sets the day's fish price (×1.16 calm → ×1.67
in a storm). Press **G** to summon a rowboat to the nearest water, or **T** to
charter straight out to the best offshore mark you have unlocked — the fare scales
with the sea state, and offshore catches sell for `1 + seaState × 1.15` (lake fish
only get a third of that bonus). Open water raises your top boat speed to 4.6 m/s
and a waypoint arrow keeps the next mark in view. Out there you share the water
with **whales**: blue whales, humpbacks and orcas patrol the three offshore
regions, dive, surface and blow — get within 130 m of a surfacing one and it is
recorded in your sighting log. The catchable roster includes six sharks and rays
(nurse, hammerhead, tiger, megamouth, whale shark, giant manta) plus the blue
marlin, so the deep marks are a different fishery, not just bigger fish.

**Survival rules (v4.0–v4.3).** Four meters, Don't Starve style, all saved with the
profile:

- **饱食 hunger** — drains with time and effort (sprinting ×1.7, swimming ×1.35,
  rowing ×0.55) and faster when you are cold. At zero you starve and lose health.
  Press **H** to eat the smallest fish in the keeper net; campfire-cooked meals
  fill you up more.
- **生命 health** — starvation, hypothermia and total insanity all drain it; it
  regenerates slowly while you are fed, warm and sane. At zero you die: a full
  death card shows the cause and days survived, then you wake at the campfire
  having lost 10% of your coins and all but four fish.
- **理智 sanity** — the night, fog and storms erode it. A campfire or a lit
  lantern holds the dark back. Below ~40% the screen closes in from the edges and
  a shadow drifts at the edge of your vision; the bite gets shy too (wait times up
  to 75% longer).
- **体温 warmth** — driven by season, time of day and weather; below 33 °C you are
  cold, below 30 °C you take damage. Standing within 9 m of the campfire warms you,
  restores sanity and lets you cook and sleep (**J**).
- **季节 seasons** — a 12-day year of 春 / 夏 / 秋 / 冬, three days each. Summer runs
  +4.5 °C, winter −7 °C and snows five times as often, so winter is when the fire
  matters. Everything is explained in-game on the **生存** panel.

**Shop & market (v3.5).** The shop sells rods, lines, lures, baits, **daily-stock
supplies** (line wax, lucky charm, chum bucket, sea charm — each applies a timed
buff through the same system as campfire cooking) and runs a **fish market**:
offload the fish in your keeper net for `55% of base × today's sea multiplier`,
with one species paying a daily-special bonus. Rough weather is worth waiting for
when you sell.

**Life.** Up to 150 fish swim in schools near the angler — they hold depth, avoid
shallows, scatter when you get close, ripple the surface and occasionally leap
clear of the water. Gulls circle overhead, and fireflies drift over the bank on
calm nights.

**Fishing.** Any open water can be fished; the 15 named spots are simply better
water. Casting is a real ballistic bobber with a sagging line, wind and river
current drift, nibbles before the real bite, and a tension minigame where the
fish's own weight, fight and speed fight your line's breaking strain. You can walk,
swim, row a boat out to the deep marks, then keep the fish, release it for extra
experience, cook it, or enter it in a contest.

**Fight feel (v2.0–v2.9).** The rod is three nested segments that bend with the
load — it flexes into the cast and arcs over against a fish. A slipping **drag**
replaces the old instant snap: above its setting the reel gives line, the
number is the metres paid out, the clutch buzzes through the gamepad and the line
squeals. A stretchy line softens every change in tension, a stiff rod transmits
it; a light line against a heavy fish forces a low drag, so the fish simply takes
line and you have to pump it back. The fish breaks the surface during the fight —
deeper while it holds line, up to the net as it tires — and anything over 4 kg
gets a reveal: the fish lifts out of the water, the FOV punches in, time dilates,
the size class (小鱼 → 巨物) is announced and the catch card is held until the
moment is over.

**Fish fighting (v5.0–v5.1).** Every species now fights to its own script. Six
archetypes — 💨 runner (tuna, sailfish, marlin), 🌪️ thrasher (bass, snakehead),
⬇️ diver (grouper, catfish), 🦘 jumper (trout, manta), 🐂 bulldog (sharks,
sunfish) and 🎭 trickster (eels, octopus) — differ in run power/frequency, how
fast the safe tension band moves, and which moves they throw.

Moves are **telegraphed**: the HUD flashes ⚠ 疯狂甩头 / 跃出水面 / 向深处钻 /
发力狂奔 with the counter-input, then a 0.7–1.1 s active window opens. Hit it —
**hold right mouse to pump** or **release the reel** — and the move is countered:
its damage drops to 12%, the fish loses stamina, you win back a little line, and
the counter tally climbs. Miss it and the tension spikes, the line wears and the
fish takes distance.

At landing the fight is graded **S/A/B/C** from tension discipline, counter rate
and time; S pays +25% coins and +15% xp, shown on the catch card with the species'
archetype and counter tally (e.g. "🌪️ 甩头型 · 拆招 2/2").

A fish caught by hammering the reel and ignoring every warning lands at C for
318 coins where the same fish graded S is worth 398.

**Recursive self-improvement (v6.0).** The island's rival angler improves itself
every in-game day, following two ideas from recent agent research:

- *Dream first, deploy later* (Dream-RSI, arXiv:2609.14858): it records the
  contexts it actually fished — spot, hour, weather, depth — into a **replay
  pool**, scores candidate policies against that pool offline (a "dream"), and
  only deploys what wins there. Deployed policies then fish for real and feed
  new contexts back into the pool.
- *Multi-objective, factorized, gated* (Harmony Harness, arXiv:2610.15150):
  seven weight vectors decompose the problem into (money vs. species variety)
  subproblems, each scored with Tchebycheff scalarisation; mutations are
  **factorized** so one generation edits either the general genes (skill,
  patience, gear tier) or the environment genes (hour/depth/spot preferences);
  an elite archive keeps the **Pareto front** from collapsing; and a **held-out
  gate** rejects children whose coverage collapses on samples they were not
  tuned on — so it cannot win by camping a single spot.

The rival joins the fishing contest as a fifth angler (「老渔夫」) whose pace
comes from its deployed policy. The 「老渔夫 · RSI」 panel shows the generation,
replay size, Pareto scatter, deployed policy and the accept/reject log.

**Content.** 66 fish (60 catchable + 6 junk) across 5 rarity tiers with real
length/weight relationships, 7 rods, 7 lines, 10 lures, 8 baits, 8 quests, 27
achievements, 5 campfire recipes and a repeating 3-minute fishing contest against
three AI anglers. Fish respond to water body, depth, time of day, weather and moon
phase, so the same spot fishes differently at dawn, at midnight and in the rain.

**Systems.** Journal with per-species records and size classes, level curve to 60,
shop with ownership and level gates, map with click-to-waypoint, minimap, trophy
aquarium showing your three biggest catches, photo mode with five filters and a
10-shot gallery, weather station with forecast/barometer/moon phase, night
lantern and fireflies, localStorage saves with schema migration, gamepad rumble,
camera shake, procedural audio (no sound files at all) and an adaptive-quality
fallback if the frame rate drops.

## Verification

The game is verified in a real browser, headlessly, with Chrome DevTools Protocol:

```bash
# 1. dev server
npm run dev

# 2. headless Chrome with a debugging port
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --headless=new --remote-debugging-port=9222 --user-data-dir=.chrome-profile ^
  --use-angle=swiftshader --enable-unsafe-swiftshader --window-size=1280,720 about:blank

# 3. drive it, capture console errors + screenshots
node scripts/verify.mjs "http://127.0.0.1:5177/?autostart=1&diag=1&noadapt=1" verify-out --shots
```

`scripts/verify.mjs` waits for boot, captures console errors/JS exceptions, walks
the fishing state machine through the real input path, simulates a complete fight
deterministically, audits all 15 spots (right water body? can the angler stand
there?), samples the species distribution in 9 different waters, opens every panel
and writes screenshots.

`scripts/audit-fish.mjs` runs the species-selection maths offline (no browser) over
17 water contexts × 5 conditions and prints the tier distribution, junk rate and
the most likely species — this is what caught the junk-items-swallow-everything
and single-species-dominance problems.

## URL flags

| Flag | Effect |
|---|---|
| `?autostart=1` | Skip the menu, start a fresh game |
| `?quality=low\|medium\|high` | Quality preset |
| `?seed=12345` | World seed |
| `?time=18.5` | Starting hour |
| `?weather=rain` | Force starting weather |
| `?view=third` | Start in third person |
| `?perf=1` | Show the performance overlay |
| `?diag=1` | Mirror diagnostics into the DOM |
| `?noadapt=1` | Disable adaptive quality (for stable screenshots) |

## Performance notes

Quality tiers bound the frame cost: vegetation instance budget, terrain/water
segment counts, shadow map size, draw distance, particle counts and the pixel
ratio cap all scale together (`src/core/engine.js`). Geometry is instanced and all
static props are merged per material, so ~20 000 plants and every dock, cabin and
signpost cost **~200 draw calls** in total.

Measured on the production build in headless Chrome (1280 × 720):

| Metric | Value |
|---|---|
| Frame rate | 50–90 FPS (headless, software D3D rasteriser) |
| Draw calls | 166–195 |
| Triangles | ~0.92–1.01 M |
| **Game renderer process** | **~180 MB** |
| JS heap (`performance.memory`) | 35–106 MB |
| Whole Chrome process tree, fresh single load | 738–840 MB |

The game's own renderer process is **~180 MB**, but a fresh Chrome instance also
carries its browser process (~130–150 MB), a GPU process (~250–320 MB), three
utility processes (~80 MB) and a crashpad handler (~12 MB). In this VM the GPU
figure is the volatile one: headless Chrome falls back to a software D3D
rasteriser that holds large backing stores, and it swings by ~75 MB between runs
of the same build, so the whole-tree number lands anywhere from 738 to 840 MB.
Dropping the quality tier does **not** move that total materially (measured 836 MB
at `medium` vs 838 MB at `high`), which is the tell that the number is Chrome's
baseline rather than the game.

The default preset is therefore `medium` (terrain 192 segments, vegetation 0.62,
1024 shadow map) — the safest choice for the memory goal — with `high` (224
segments, 0.80 vegetation, 1280 shadow map) one click away in the settings panel.
The screenshots in `verify-v3-final/` were captured at `high`.

`?perf=1` shows FPS, draw calls, triangles, geometry/texture counts and the JS
heap live in-game. `?quality=low|medium|high` picks a tier directly, and adaptive
quality steps down automatically if the average frame rate stays under 26 FPS.

The verification scripts are the ground truth for all of the numbers above; they
print them into `verify-out/report.json` on every run.

## Design notes

- **No assets.** Every texture is drawn to a `<canvas>` at runtime (clouds, stars,
  signpost lettering) and every sound is synthesised with the Web Audio API.
- **One source of truth.** Terrain heights, wave heights and the fish table are
  each defined once and consumed by everything that needs them.
- **Testability.** Pure logic (species selection, progression) is separated from
  three.js so it can be audited in node; `window.__DEBUG` exposes hooks
  (`teleport`, `simFight`, `setTime`, `setWeather`) that the verification script
  drives.
