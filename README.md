# Basement 98, in your browser

A fan-made tribute to Basement 98, written from scratch in plain JavaScript. No install, no emulator.

- A working desktop: boot screen, Start menu, draggable windows, taskbar, Explorer, Notepad, Paint,
  Calculator, DOS Prompt, NetSurfer (dial-up included), Control Panel, Media Player.
- Original look-alikes of 90s favourites: Minesweeper, Solitaire, a split-screen racer, a first-person
  maze shooter, a block-building sandbox, falling blocks, Pong, plus notebook classics like FLAMES.
- Win games, collect sweets. Hall of Fame leaderboards with a daily challenge.

Inspired by the desktops of the late 90s. All code, icons and sounds are original. Not affiliated with any company.

Live at **https://artisansmedia.com/nostalgia/** (served through a Cloudflare Worker, see `cloudflare-worker.js`).

Privacy policy: [privacy.html](privacy.html). Set `contactEmail` in `js/config.js`. Any ad code must only load inside `if(Consent.allows('ads'))` (see `js/consent.js`).

Run locally: serve the folder with any static server (`python3 -m http.server`) and open it.
Worldwide leaderboard setup: see [SETUP-LEADERBOARD.md](SETUP-LEADERBOARD.md).
