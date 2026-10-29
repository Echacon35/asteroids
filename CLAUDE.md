# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

An Asteroids-style arcade game built on the plain HTML5 Canvas API. There are no dependencies, no bundler, no build step, no tests and no linter. All game logic lives in `game.js`, which `index.html` loads with a plain `<script>` tag (not an ES module).

## Running

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .   # then visit http://localhost:3000
```

## Architecture (`game.js`)

- **Fixed logical size**: `W = 800`, `H = 600`. These are hard-coded and match the `<canvas>` attributes in `index.html`. Change both together.
- **Global state**: `ctx`, `ship`, `bullets`, `asteroids`, `particles`, `score`, `lives`, `level`, `state` and `deadTimer` are module-level globals. Entity classes draw directly to the global `ctx`.
- **Entity contract**: every entity (`Bullet`, `Asteroid`, `Ship`, `Particle`) has `update(dt)`, `draw()` and a `dead` flag. Each frame, `update()` advances the entity arrays and then rebuilds them with `filter(x => !x.dead)`. Entities never remove themselves.
- **State machine**: `state` is `'playing' | 'dead' | 'gameover'`. In `'dead'`, a respawn countdown (`deadTimer`) runs while asteroids keep moving. In `'gameover'`, Space calls `initGame()`.
- **Toroidal space**: positions wrap with `wrap(v, max)`. Particles do not wrap.
- **Asteroid sizes** are indexed 1 (small) to 3 (large). The parallel lookup arrays `RADII`, `SPEEDS` and `POINTS` are indexed by `size`, and index 0 is unused. `split()` returns two asteroids of `size - 1` that inherit the parent's color.
- **Collision** is circle-based with `dist()`. The ship's hit radius uses `a.radius * 0.82` to make hits more forgiving. The ship ignores collisions while `invincible > 0` (3 s after a respawn or a new level).
- **Input**: `keys[code]` holds the current state of each key. `pressed(code)` reads a one-shot "just pressed" edge and consumes it. Use `pressed` for discrete actions (shooting, restarting) and `keys` for continuous ones (rotation, thrust).
- **Game loop**: `requestAnimationFrame` calls `loop`, which computes `dt` in seconds and caps it at 0.05. All motion is scaled by `dt`.
- **Levels**: when no asteroids remain, `nextLevel()` resets the ship and spawns `3 + level` large asteroids, keeping them outside a safe radius around the center.

## Conventions

- The UI text, code comments and README are in Spanish. Keep new user-facing strings and comments in Spanish.
- The file is split into sections by `// ── Name ───` banner comments. Add new systems as new banner sections.
- The README mentions power-ups and special asteroid types (such as a shooting star, "estrella fugaz"), but `game.js` does not implement them yet.
