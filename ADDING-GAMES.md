# Adding games

There are three ways, from easiest to most work.

## 1. Pre-install console cartridges (NES) on the Cartridge Shelf

Put a `.nes` file in the `roms/` folder and list it in `roms/roms.json`:

```json
[
  { "name": "My Homebrew Game", "file": "roms/my-homebrew-game.nes",
    "credit": "Author name", "license": "Free to distribute (CC-BY)" }
]
```

It then shows up as a button in **Retro Console** for every visitor. Visitors can also load their
own `.nes` files, which never leave their computer.

**Only add games you have the right to distribute.** Commercial games (Contra, Super Mario Bros.,
and so on) are copyrighted, and "abandonware" is not a legal category. Safe sources are homebrew
and freeware games whose authors allow free distribution: check each game's page or readme, and
keep the license text in `credit` / `license`. Examples of places to look: itch.io (filter by
"Free" and read the license), NESdev Compo entries, and authors who publish their games for free.
When in doubt, ask the author.

## 1b. Visitors bring their own games (Retro Console)

The Retro Console plays game files that **visitors supply themselves**: NES (built-in emulator) and
Super Nintendo, Sega Genesis, Master System, Game Boy / Color / Advance, PC Engine and arcade ROM sets
(through EmulatorJS, loaded from `cdn.emulatorjs.org` in an isolated frame). Files are read in the
visitor's browser and never uploaded. The site hosts no games. This is the legally cleanest way to
support commercial classics, because the visitor provides the copy they own.

## 2. Add a new original game written in JavaScript

Every game is one function that draws into a window. Copy `mountBreakout` in `js/arcade2.js` and
change it. Then register it at the bottom of the file:

```js
ARCADE.push({id:'mygame', f:'MYGAME.EXE', n:'My Game', e:'🎲', wh:[520,440], m:mountMyGame});
```

That one line adds it to the desktop, Start > Programs > Games, `C:\Games`, the Run box, and the
DOS prompt. Use `keyset(w)` for keyboard input and `loop(w,dt=>{...})` for the game loop, and call
`celebrate()` when the player wins to hand out a sweet.

## 3. Put a game on the leaderboard

Add its id to `GAME_META` and `GAME_APP` in `js/leaderboard.js`, to the `games` check list in
`supabase/schema.sql`, and a rule for it in `verify()` in `js/sim.js`. Then call
`postScore('mygame', score, {reward:true, run})` when the game ends, starting the run with
`run = Run.begin('mygame')`. Re-copy `sim.js` to `supabase/functions/_shared/` afterwards and
redeploy the functions.
