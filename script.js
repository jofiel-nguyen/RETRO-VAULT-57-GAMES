// --- 8-BIT AUDIO SYNTHESIZER (WEB AUDIO API) ---
const Audio8Bit = (() => {
  let ctx = null;
  function tone(freq, type = 'square', duration = 0.08, vol = 0.08) {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }
  return {
    blip: () => tone(520, 'square', 0.06),
    score: () => { tone(660, 'square', 0.07); setTimeout(() => tone(880, 'square', 0.1), 70); },
    shoot: () => tone(320, 'sawtooth', 0.08, 0.06),
    hit: () => tone(150, 'triangle', 0.12, 0.12),
    over: () => { tone(220, 'sawtooth', 0.18); setTimeout(() => tone(140, 'sawtooth', 0.28), 160); }
  };
})();

// --- 54 RETRO GAMES CATALOG ---
const GAMES = [
  // ARCADE (12)
  { id: 1, name: "Neon Snake 1976", cat: "ARCADE", icon: "🐍", engine: "snake", speed: 110, color: "#39ff14", desc: "Classic snake with neon graphics." },
  { id: 2, name: "Turbo Viper", cat: "ARCADE", icon: "⚡", engine: "snake", speed: 72, color: "#00f0ff", desc: "High-speed snake for fast reflexes." },
  { id: 3, name: "Maze Python", cat: "ARCADE", icon: "🐉", engine: "snake", speed: 95, color: "#ffe600", walls: true, desc: "Snake hunt inside an obstacle arena." },
  { id: 4, name: "Cyber Centipede", cat: "ARCADE", icon: "🐛", engine: "snake", speed: 85, color: "#ff2a85", desc: "Control a cybernetic centipede collecting energy." },
  { id: 5, name: "Pac-Chomp Mini", cat: "ARCADE", icon: "🟡", engine: "dodge", speed: 4, color: "#ffe600", mode: "collect", desc: "Eat pellets while dodging patrol ghosts." },
  { id: 6, name: "Frogger Highway", cat: "ARCADE", icon: "🐸", engine: "dodge", speed: 5, color: "#39ff14", mode: "cross", desc: "Cross a busy cyberpunk traffic lane." },
  { id: 7, name: "Dig-Dug Tunnel", cat: "ARCADE", icon: "⛏️", engine: "snake", speed: 105, color: "#ff9900", desc: "Dig underground tunnels and collect crystals." },
  { id: 8, name: "Tron Lightcycle", cat: "ARCADE", icon: "🏍️", engine: "snake", speed: 68, color: "#00f0ff", desc: "Drive a lightcycle without hitting trails." },
  { id: 9, name: "Burger Stacker", cat: "ARCADE", icon: "🍔", engine: "dodge", speed: 4, color: "#ffae00", mode: "catch", desc: "Catch ingredients falling from above." },
  { id: 10, name: "Coin Collector 84", cat: "ARCADE", icon: "🪙", engine: "dodge", speed: 5, color: "#ffd700", mode: "collect", desc: "Collect gold coins before time runs out." },
  { id: 11, name: "Ghost Manor", cat: "ARCADE", icon: "👻", engine: "dodge", speed: 6, color: "#b967ff", mode: "survive", desc: "Survive as long as possible in a haunted mansion." },
  { id: 12, name: "Pixel Pac-Rush", cat: "ARCADE", icon: "🍒", engine: "snake", speed: 80, color: "#ff2a85", desc: "Eat pixel fruits to grow to maximum length." },

  // SHOOTER (11)
  { id: 13, name: "Space Invaders 78", cat: "SHOOTER", icon: "👾", engine: "shooter", speed: 2, color: "#39ff14", desc: "Shoot down invading alien armadas." },
  { id: 14, name: "Galaga Starfighter", cat: "SHOOTER", icon: "🚀", engine: "shooter", speed: 3, color: "#00f0ff", desc: "Fighter ship defending the galaxy." },
  { id: 15, name: "Galaxian Swarm", cat: "SHOOTER", icon: "🛸", engine: "shooter", speed: 3.5, color: "#ff2a85", desc: "Intercept attacking flying saucer swarms." },
  { id: 16, name: "Asteroids Belt", cat: "SHOOTER", icon: "☄️", engine: "shooter", speed: 2.8, color: "#ffe600", desc: "Blast drifting space meteors to pieces." },
  { id: 17, name: "Star Defender", cat: "SHOOTER", icon: "🛰️", engine: "shooter", speed: 2.4, color: "#00f0ff", desc: "Orbital fortress stopping landing ships." },
  { id: 18, name: "Laser Command", cat: "SHOOTER", icon: "🔫", engine: "shooter", speed: 3.2, color: "#ff5555", desc: "Defensive laser cannon holding the final line." },
  { id: 19, name: "Alien Blaster", cat: "SHOOTER", icon: "👽", engine: "shooter", speed: 2.6, color: "#39ff14", desc: "Eliminate landing space monsters." },
  { id: 20, name: "Nova Patrol", cat: "SHOOTER", icon: "🌌", engine: "shooter", speed: 3.8, color: "#b967ff", desc: "High-speed nebula patrol." },
  { id: 21, name: "Meteor Storm", cat: "SHOOTER", icon: "🌠", engine: "shooter", speed: 4.1, color: "#ff9900", desc: "Shoot down fiery meteor showers." },
  { id: 22, name: "Cyber Tank 1980", cat: "SHOOTER", icon: "🚜", engine: "shooter", speed: 2.2, color: "#39ff14", desc: "Steel battle tank protecting central command." },
  { id: 23, name: "Phoenix Wing", cat: "SHOOTER", icon: "🔥", engine: "shooter", speed: 3.4, color: "#ff2a85", desc: "Firebird fighter sweeping the skies." },

  // CLASSIC (11)
  { id: 24, name: "Pong 1972", cat: "CLASSIC", icon: "🏓", engine: "pong", speed: 4.5, color: "#ffffff", desc: "The legendary original two-paddle tennis game." },
  { id: 25, name: "Super Pong Turbo", cat: "CLASSIC", icon: "🎾", engine: "pong", speed: 6.2, color: "#39ff14", desc: "High-speed table tennis against AI." },
  { id: 26, name: "Breakout 1976", cat: "CLASSIC", icon: "🧱", engine: "breakout", speed: 4.5, color: "#ff2a85", desc: "Break through colorful brick walls." },
  { id: 27, name: "Arkanoid Neon", cat: "CLASSIC", icon: "💎", engine: "breakout", speed: 5.5, color: "#00f0ff", desc: "Neon upgraded version of brick breaker." },
  { id: 28, name: "Flappy Pixel", cat: "CLASSIC", icon: "🐤", engine: "flappy", speed: 2.8, color: "#ffe600", desc: "Tap to keep the bird flying through pipes." },
  { id: 29, name: "Jetpack Jumper", cat: "CLASSIC", icon: "🧑‍🚀", engine: "flappy", speed: 3.3, color: "#00f0ff", desc: "Fly through space stations with a jetpack." },
  { id: 30, name: "Dino T-Rex Run", cat: "CLASSIC", icon: "🦖", engine: "runner", speed: 5.2, color: "#39ff14", desc: "T-Rex running across desert cacti." },
  { id: 31, name: "Cyber Ninja Run", cat: "CLASSIC", icon: "🥷", engine: "runner", speed: 6.4, color: "#ff2a85", desc: "Ninja jumping over rooftop obstacles at night." },
  { id: 32, name: "Skate Boy 86", cat: "CLASSIC", icon: "🛹", engine: "runner", speed: 5.8, color: "#ffe600", desc: "Street skateboarding avoiding street hazards." },
  { id: 33, name: "Submarine Dive", cat: "CLASSIC", icon: "🚤", engine: "flappy", speed: 2.6, color: "#00f0ff", desc: "Pilot a submarine through coral reefs." },
  { id: 34, name: "Brick Wall Pro", cat: "CLASSIC", icon: "🏗️", engine: "breakout", speed: 6.0, color: "#ff9900", desc: "Hardcore 6-row brick breaking challenge." },

  // PUZZLE (10)
  { id: 35, name: "Minesweeper 89", cat: "PUZZLE", icon: "💣", engine: "mines", mines: 10, color: "#ff2a85", desc: "Classic minesweeper on an 8x8 grid." },
  { id: 36, name: "Minefield Hard", cat: "PUZZLE", icon: "💥", engine: "mines", mines: 15, color: "#ffe600", desc: "High-density minefield puzzle test." },
  { id: 37, name: "Memory Cards 8-Bit", cat: "PUZZLE", icon: "🃏", engine: "memory", pairs: 8, color: "#00f0ff", desc: "Flip cards to find matching retro icons." },
  { id: 38, name: "Emoji Match Retro", cat: "PUZZLE", icon: "👾", engine: "memory", pairs: 8, color: "#ff2a85", desc: "Memorize pixel monster positions." },
  { id: 39, name: "Fruit Flip 1985", cat: "PUZZLE", icon: "🍉", engine: "memory", pairs: 8, color: "#39ff14", desc: "Flip classic arcade fruit tiles." },
  { id: 40, name: "Bomb Squad Logic", cat: "PUZZLE", icon: "🧨", engine: "mines", mines: 12, color: "#ff9900", desc: "Defuse bombs based on numerical clues." },
  { id: 41, name: "Symbol Matrix", cat: "PUZZLE", icon: "🔮", engine: "memory", pairs: 8, color: "#b967ff", desc: "Decrypt ancient symbol matrices." },
  { id: 42, name: "Deep Sea Sonar", cat: "PUZZLE", icon: "🧭", engine: "mines", mines: 9, color: "#00f0ff", desc: "Sonar scan for deep sea naval mines." },
  { id: 43, name: "Arcade Pairs", cat: "PUZZLE", icon: "🕹️", engine: "memory", pairs: 8, color: "#ffe600", desc: "Match classic controllers and game cartridges." },
  { id: 44, name: "Treasure Radar", cat: "PUZZLE", icon: "💰", engine: "mines", mines: 8, color: "#39ff14", desc: "Avoid traps to uncover treasure chests." },

  // REFLEX (10)
  { id: 45, name: "Whack-A-Mole 81", cat: "REFLEX", icon: "🔨", engine: "whack", speed: 850, color: "#ffe600", desc: "Whack moles popping out of holes quickly." },
  { id: 46, name: "Whack-An-Alien", cat: "REFLEX", icon: "👽", engine: "whack", speed: 680, color: "#39ff14", desc: "Hit aliens before they dive back down." },
  { id: 47, name: "Ghost Zapper", cat: "REFLEX", icon: "👻", engine: "whack", speed: 600, color: "#ff2a85", desc: "Zap flashing ghosts in the dark." },
  { id: 48, name: "Laser Dodge", cat: "REFLEX", icon: "⚡", engine: "dodge", speed: 6.5, color: "#00f0ff", mode: "survive", desc: "Dodge dense falling meteor streams." },
  { id: 49, name: "Meteor Shower", cat: "REFLEX", icon: "☄️", engine: "dodge", speed: 7.5, color: "#ff5555", mode: "survive", desc: "Avoid a blazing meteor storm at top speed." },
  { id: 50, name: "Star Catcher", cat: "REFLEX", icon: "⭐", engine: "dodge", speed: 6.0, color: "#ffe600", mode: "catch", desc: "Catch falling shooting stars." },
  { id: 51, name: "Quick Draw Cowboy", cat: "REFLEX", icon: "🤠", engine: "whack", speed: 550, color: "#ff9900", desc: "Hit targets fast like a Western cowboy." },
  { id: 52, name: "Virus Buster", cat: "REFLEX", icon: "🦠", engine: "whack", speed: 630, color: "#39ff14", desc: "Destroy computer viruses before they spread." },
  { id: 53, name: "Hyper Pong Reflex", cat: "REFLEX", icon: "🏓", engine: "pong", speed: 7.4, color: "#ff2a85", desc: "Extreme reflex table tennis mode." },
  { id: 54, name: "Pixel Sprint 100", cat: "REFLEX", icon: "🏃", engine: "runner", speed: 7.2, color: "#00f0ff", desc: "Speed-of-light hurdle sprinting." }
];

// --- APP STATE & UI RENDERING ---
let currentFilter = "ALL";
let searchQuery = "";
let favorites = JSON.parse(localStorage.getItem("retro54_favs") || "[]");
let highScores = JSON.parse(localStorage.getItem("retro54_scores") || "{}");

const gridEl = document.getElementById("gameGrid");
const countLabel = document.getElementById("countLabel");

function saveScore(id, score) {
  if (score > (highScores[id] || 0)) {
    highScores[id] = score;
    localStorage.setItem("retro54_scores", JSON.stringify(highScores));
    renderGrid();
  }
  document.getElementById("bestVal").textContent = highScores[id] || 0;
}

function toggleFav(id, e) {
  e.stopPropagation();
  if (favorites.includes(id)) favorites = favorites.filter(x => x !== id);
  else favorites.push(id);
  localStorage.setItem("retro54_favs", JSON.stringify(favorites));
  Audio8Bit.blip();
  renderGrid();
}

function renderGrid() {
  const filtered = GAMES.filter(g => {
    const matchCat = currentFilter === "ALL" ? true :
                     currentFilter === "FAV" ? favorites.includes(g.id) :
                     g.cat === currentFilter;
    const matchText = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      g.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchText;
  });

  countLabel.textContent = `Showing: ${filtered.length} / ${GAMES.length} games`;
  gridEl.innerHTML = filtered.map(g => {
    const liked = favorites.includes(g.id) ? "liked" : "";
    const best = highScores[g.id] || 0;
    return `
      <div class="card">
        <div class="card-top">
          <span class="badge">#${String(g.id).padStart(2, '0')} • ${g.cat}</span>
          <button class="fav-btn ${liked}" onclick="toggleFav(${g.id}, event)" title="Favorite">♥</button>
        </div>
        <div class="icon-box" style="text-shadow: 0 0 12px ${g.color}">${g.icon}</div>
        <h3>${g.name}</h3>
        <p>${g.desc}</p>
        <div class="card-footer">
          <span class="hi-score">🏆 ${best}</span>
          <button class="play-btn" onclick="launchGame(${g.id})">PLAY ▶</button>
        </div>
      </div>
    `;
  }).join("");
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.cat;
    Audio8Bit.blip();
    renderGrid();
  });
});

document.getElementById("searchInput").addEventListener("input", e => {
  searchQuery = e.target.value;
  renderGrid();
});

renderGrid();
