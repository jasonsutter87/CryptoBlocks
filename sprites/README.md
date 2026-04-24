# Pac-Man Sprites

Drop PNG files here as you make them in the sprite editor.
File names must match exactly. All sprites should be **24×24** (matches `TILE_SIZE`).

## Required filenames

| File                       | What it is                              |
|----------------------------|-----------------------------------------|
| `wall.png`                 | Maze wall                               |
| `dot.png`                  | Small pellet                            |
| `pellet.png`               | Big power pellet                        |
| `tunnel.png`               | Wrap-around exits (sides + top/bottom)  |
| `ghost-house.png`          | Ghost spawn floor                       |
| `pac-open.png`             | Pac-Man, mouth open                     |
| `pac-closed.png`           | Pac-Man, mouth closed                   |
| `blinky.png`               | Red ghost                               |
| `pinky.png`                | Pink ghost                              |
| `inky.png`                 | Cyan ghost                              |
| `clyde.png`                | Orange ghost                            |
| `frightened.png`           | Blue scared ghost                       |
| `frightened-flash.png`     | White flashing ghost (timer almost up)  |

## Notes

- **Missing files use colored fallbacks.** You can drop in one sprite at a time and the rest still render as plain shapes — refresh to see your art live.
- **Pac-Man auto-rotates.** Draw him facing **right**; the engine rotates him for up/down/left.
- **Ghost eyes are drawn programmatically on top** so pupils track movement direction. If you want to bake eyes into your sprite, set `window.__pacmanNoEyes = true` before `startGame()` to disable the overlay.
- Use the CryptoBlocks sprite editor → export PNG → save here with the right filename.
