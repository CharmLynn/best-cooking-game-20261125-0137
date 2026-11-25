[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/CharmLynn/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/CharmLynn/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# The Golden Wok

An original top-down cooking rush for the [make.fun "Make the best cooking game" bounty](https://make.fun/c/best-cooking-game-20261125-0137). You run a tiny wok stall: tickets fly onto the order board, and you chop, fry, boil, plate and serve before patience runs out — across three days of rising pressure, ending in a rush hour.

## How to play

- **Move:** WASD or arrow keys (or click a station within reach)
- **Interact:** E / Space / click — pick up, put down, chop, cook, plate, serve
- **Pause:** P or Esc · **Restart:** R · **Mute:** M · **Help:** H

You carry at most 2 things, so plan your route through the kitchen.

## The menu

| Dish | Price | Recipe |
| --- | --- | --- |
| Golden Fried Rice | $12 | Steamed rice (wok) + fried egg (wok) + chopped veg |
| Chicken Noodle Soup | $14 | Cooked noodles (pot) + broth (pot) + chopped chicken |
| Garlic Stir-Fry | $13 | Wok veg + wok chicken + sauce |

- **Chop:** veg or chicken on the chopping board, 4 taps of E.
- **Cook:** wok and pot have a timing bar — take food off in the **green zone** for a perfect cook (+$2). Leave it too long and it burns: bin it.
- **Plate:** drop 3 matching pieces on the plating counter to finish a dish.
- **Serve:** carry the dish to the serving pass before the ticket's patience bar runs out. Fast serves earn tips; serves in a row build a combo bonus.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Plain static files under `game/` — no build step, no network requests, no libraries. All art is drawn in code and all sounds are synthesised with WebAudio.

## Layout

- `game/index.html` — page + canvas
- `game/src/config.js` — recipes, stations, palette, day pacing
- `game/src/main.js` — game loop, screens, movement, demo staging
- `game/src/kitchen.js` — station interactions, chopping and cooking
- `game/src/orders.js` — order spawning, patience, serving, tips, combos
- `game/src/render.js` — drawing the kitchen, chef, HUD and screens
- `game/src/food.js` — drawing ingredients and dishes
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — synthesised sound effects
- `main.ts` — the make.fun entry program (writes `/output/dossier.json`)

<sub>Entered on [make.fun](https://make.fun/?ref=mpd17n5r&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
