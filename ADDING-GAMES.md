# Adding games

There are two ways.

## 1. Add a new original game written in JavaScript

Every game is one function that draws into a window. Copy `mountBreakout` in `js/arcade2.js` and
change it. Then register it at the bottom of the file:

```js
ARCADE.push({id:'mygame', f:'MYGAME.EXE', n:'My Game', e:'🎲', wh:[520,440], m:mountMyGame});
```

That one line adds it to the desktop, Start > Programs > Games, `C:\Games`, the Run box, and the
DOS prompt. Use `keyset(w)` for keyboard input and `loop(w,dt=>{...})` for the game loop, and call
`celebrate()` when the player wins to hand out a sweet.

## 2. Put a game on the leaderboard

Add its id to `GAME_META` and `GAME_APP` in `js/leaderboard.js`, to the `games` check list in
`supabase/schema.sql`, and a rule for it in `verify()` in `js/sim.js`. Then call
`postScore('mygame', score, {reward:true, run})` when the game ends, starting the run with
`run = Run.begin('mygame')`. Re-copy `sim.js` to `supabase/functions/_shared/` afterwards and
redeploy the functions.
