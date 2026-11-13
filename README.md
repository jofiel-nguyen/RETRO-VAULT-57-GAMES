# 🕹️ Retro Vault 57

> A lightweight, zero-dependency, modular retro arcade website featuring **54 classic 8-bit games** built entirely with HTML5 Canvas, CSS3, and Vanilla JavaScript. No external assets, plugins, or installations required—just open and play!

![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?style=flat-square&logo=html5)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript)
![CSS3](https://img.shields.io/badge/CSS3-Neon%20CRT-blue?style=flat-square&logo=css3)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🌟 Features

* **54 Classic Retro Games** spread across 5 distinct categories:
  * 👾 **Arcade** (Snake, Pac-Clone, Maze, Tron, etc.)
  * 🚀 **Shooter** (Space Invaders, Galaga, Asteroids, etc.)
  * 🏓 **Classic** (Pong, Breakout, Flappy Bird, T-Rex Runner, etc.)
  * 💣 **Puzzle** (Minesweeper, Memory Match, Logic Bombs, etc.)
  * 🔨 **Reflex** (Whack-a-Mole, Ghost Zapper, Quick Draw, etc.)
* **True 8-Bit Web Audio API Synthesizer:** Real-time retro sound effects (blips, lasers, explosions, and win/loss jingles) generated entirely through code.
* **Authentic CRT Aesthetic:** Custom scanline overlays, neon glows, and retro arcade cabinet modals.
* **Smart Persistence:** Automatically saves your **High Scores** and **Favorites** locally using `localStorage`.
* **Fully Responsive:** Play seamlessly using keyboard controls (`WASD` / Arrow keys / `Space`) or touch/mouse dragging on mobile and desktop.

---

## 📁 Project Structure

The project is cleanly split into modular files for easy maintenance and expansion:

```text
retro-arcade/
├── index.html      # Main HTML structure and UI container
├── style.css       # Retro styling, neon themes, and CRT scanlines
├── script.js       # Game catalog database, search filters, audio engine, & storage
└── arcade.js       # Canvas rendering loops and game engine controllers
