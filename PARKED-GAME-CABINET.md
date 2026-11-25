# Parked: Game Cabinet (bring-your-own-games emulator)

Finished but NOT live on purpose: it was parked until Google AdSense approves artisansmedia.com
(a reviewer who sees an emulator could reject the site). This branch is not deployed.

What it is: `js/arcade7.js`. Players drop in a game file they own (NES, SNES, Game Boy, GBA, Mega Drive,
Master System, N64, Atari 2600, arcade .zip). Files are kept in the player's own browser (IndexedDB) on a shelf.
Emulation is EmulatorJS, loaded from cdn.emulatorjs.org only when a game starts. No games are hosted.
Not tested with a real game file yet.

## To switch it on (after AdSense shows "Ready")
1. `git checkout main && git checkout parked/game-cabinet -- js/arcade7.js`
2. `index.html`: add `<script src="js/arcade7.js"></script>` right after the arcade6.js line.
3. `js/config.js`: add `emulator:true` inside CFG.
4. `js/music.js`: after `const GAMEIDS=...` add `GAMEIDS.delete('cabinet');` (the emulator has its own audio).
5. `privacy.html`: add a services row for EmulatorJS (cdn.emulatorjs.org, receives IP when a game starts) and
   say game files you add are stored only in your browser (IndexedDB); add 'b98cab' to the clear-data list in
   `js/consent.js` (it is an IndexedDB database named b98cab, so clearing needs indexedDB.deleteDatabase).
6. `faq.html` / `terms.html`: add that the site includes no games and players must own what they load.
7. Test with a legal homebrew game file, then push.
