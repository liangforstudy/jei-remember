# JEI Remember

A KubeJS client script that makes JEI remember whether its item list (Ctrl+O) was shown or hidden, across restarts.

JEI's official API can only read that state, so the script uses JEI's internal toggle. If a JEI update renames it, the script stops doing anything (no crash) and logs one line.

## Install

1. Install KubeJS and JEI for your Minecraft version.
2. Copy `kubejs/client_scripts/jei_remember.js` into your game folder's `kubejs/client_scripts/`.
3. Start the game. The state is saved in `kubejs/config/jei_overlay.json`.

To remove it, delete the script.

Only tested on Minecraft 1.21.1 (NeoForge) with JEI 19.x.
