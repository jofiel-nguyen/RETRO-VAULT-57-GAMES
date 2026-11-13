// --- CANVAS GAME ENGINES ---
const modal = document.getElementById("gameModal");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let activeGame = null;
let loopTimer = null;
let animFrame = null;
let keys = {};
let pointer = { x: 210, y: 210, clicked: false };

window.addEventListener("keydown", e => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key) && modal.classList.contains("open")) {
    e.preventDefault();
  }
  keys[e.key] = true;
});
window.addEventListener("keyup", e => { keys[e.key] = false; });

canvas.addEventListener("pointermove", e => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  pointer.y = (e.clientY - rect.top) * (canvas.height / rect.height);
});

canvas.addEventListener("pointerdown", e => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  pointer.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  pointer.clicked = true;
});

function stopEngine() {
  clearInterval(loopTimer);
  cancelAnimationFrame(animFrame);
  keys = {};
  pointer.clicked = false;
}

function setScore(val) {
  document.getElementById("scoreVal").textContent = val;
  if (activeGame) saveScore(activeGame.id, val);
}

function setStatus(text, isOver = false) {
  const el = document.getElementById("statusVal");
  el.textContent = text;
  el.style.color = isOver ? "var(--neon-pink)" : "var(--neon-green)";
}

function launchGame(id) {
  activeGame = GAMES.find(g => g.id === id);
  if (!activeGame) return;
  Audio8Bit.blip();
  document.getElementById("modalTitle").textContent = `${activeGame.icon} ${activeGame.name}`;
  document.getElementById("scoreVal").textContent = "0";
  document.getElementById("bestVal").textContent = highScores[id] || 0;
  setStatus("PLAYING");
  modal.classList.add("open");
  startEngine(activeGame);
}

document.getElementById("closeModalBtn").onclick = () => {
  stopEngine();
  modal.classList.remove("open");
};

document.getElementById("restartBtn").onclick = () => {
  if (activeGame) {
    Audio8Bit.blip();
    setScore(0);
    setStatus("PLAYING");
    startEngine(activeGame);
  }
};

function startEngine(g) {
  stopEngine();
  const W = canvas.width, H = canvas.height;
  const hint = document.getElementById("hintText");

  // 1. SNAKE ENGINE
  if (g.engine === "snake") {
    hint.textContent = "Use Arrow keys / WASD (or touch 4 sides) to steer.";
    const grid = 20, count = W / grid;
    let snake = [{ x: 10, y: 10 }], dx = 1, dy = 0, score = 0;
    let food = { x: 15, y: 10 };
    let obstacles = g.walls ? [{x:6,y:6},{x:7,y:6},{x:14,y:14},{x:13,y:14}] : [];

    canvas.onpointerdown = () => {
      const cx = pointer.x - W / 2, cy = pointer.y - H / 2;
      if (Math.abs(cx) > Math.abs(cy)) {
        if (cx > 0 && dx !== -1) { dx = 1; dy = 0; }
        else if (cx < 0 && dx !== 1) { dx = -1; dy = 0; }
      } else {
        if (cy > 0 && dy !== -1) { dx = 0; dy = 1; }
        else if (cy < 0 && dy !== 1) { dx = 0; dy = -1; }
      }
    };

    loopTimer = setInterval(() => {
      if ((keys["ArrowUp"] || keys["w"]) && dy !== 1) { dx = 0; dy = -1; }
      if ((keys["ArrowDown"] || keys["s"]) && dy !== -1) { dx = 0; dy = 1; }
      if ((keys["ArrowLeft"] || keys["a"]) && dx !== 1) { dx = -1; dy = 0; }
      if ((keys["ArrowRight"] || keys["d"]) && dx !== -1) { dx = 1; dy = 0; }

      const head = { x: snake[0].x + dx, y: snake[0].y + dy };
      const hitWall = head.x < 0 || head.x >= count || head.y < 0 || head.y >= count;
      const hitSelf = snake.some(s => s.x === head.x && s.y === head.y);
      const hitObs = obstacles.some(o => o.x === head.x && o.y === head.y);

      if (hitWall || hitSelf || hitObs) {
        Audio8Bit.over();
        setStatus("GAME OVER", true);
        clearInterval(loopTimer);
        return;
      }

      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        setScore(score);
        Audio8Bit.score();
        food = { x: Math.floor(Math.random() * count), y: Math.floor(Math.random() * count) };
      } else {
        snake.pop();
      }

      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ff2a85";
      obstacles.forEach(o => ctx.fillRect(o.x * grid, o.y * grid, grid - 2, grid - 2));
      ctx.fillStyle = "#ffe600";
      ctx.fillRect(food.x * grid + 2, food.y * grid + 2, grid - 4, grid - 4);
      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "#ffffff" : g.color;
        ctx.fillRect(s.x * grid + 1, s.y * grid + 1, grid - 2, grid - 2);
      });
    }, g.speed);
  }

  // 2. BREAKOUT ENGINE
  else if (g.engine === "breakout") {
    hint.textContent = "Use Mouse or Left/Right keys to bounce the ball and smash bricks.";
    let padX = W / 2 - 40, ballX = W / 2, ballY = H - 40;
    let vx = g.speed * 0.75, vy = -g.speed, score = 0;
    const rows = 5, cols = 7, bw = 52, bh = 18;
    let bricks = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        bricks.push({ x: 14 + c * 56, y: 36 + r * 24, alive: true });

    function step() {
      if (keys["ArrowLeft"] || keys["a"]) padX -= 7;
      if (keys["ArrowRight"] || keys["d"]) padX += 7;
      padX = Math.max(0, Math.min(W - 80, pointer.x - 40));

      ballX += vx; ballY += vy;
      if (ballX < 8 || ballX > W - 8) { vx = -vx; Audio8Bit.blip(); }
      if (ballY < 8) { vy = -vy; Audio8Bit.blip(); }

      if (ballY > H - 26 && ballY < H - 14 && ballX > padX && ballX < padX + 80) {
        vy = -Math.abs(vy);
        vx = ((ballX - (padX + 40)) / 40) * g.speed;
        Audio8Bit.blip();
      }

      bricks.forEach(b => {
        if (b.alive && ballX > b.x && ballX < b.x + bw && ballY > b.y && ballY < b.y + bh) {
          b.alive = false;
          vy = -vy;
          score += 15;
          setScore(score);
          Audio8Bit.score();
        }
      });

      if (bricks.every(b => !b.alive)) {
        bricks.forEach(b => b.alive = true);
        vy *= 1.1;
      }

      if (ballY > H) {
        Audio8Bit.over();
        setStatus("GAME OVER", true);
        return;
      }

      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);
      bricks.forEach((b, idx) => {
        if (!b.alive) return;
        ctx.fillStyle = idx % 2 === 0 ? g.color : "#ffe600";
        ctx.fillRect(b.x, b.y, bw, bh);
      });
      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(padX, H - 20, 80, 10);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(ballX, ballY, 7, 0, Math.PI * 2); ctx.fill();

      animFrame = requestAnimationFrame(step);
    }
    step();
  }

  // 3. SHOOTER ENGINE
  else if (g.engine === "shooter") {
    hint.textContent = "Move Left/Right (or mouse) — Auto firing active!";
    let shipX = W / 2, bullets = [], enemies = [], frame = 0, score = 0;

    function step() {
      frame++;
      if (keys["ArrowLeft"] || keys["a"]) shipX -= 6;
      if (keys["ArrowRight"] || keys["d"]) shipX += 6;
      shipX = Math.max(20, Math.min(W - 20, pointer.x));

      if (frame % 14 === 0) {
        bullets.push({ x: shipX, y: H - 36 });
        Audio8Bit.shoot();
      }
      if (frame % Math.max(18, Math.floor(48 / g.speed)) === 0) {
        enemies.push({ x: 24 + Math.random() * (W - 48), y: -15, hp: 1 });
      }

      bullets.forEach(b => b.y -= 8);
      bullets = bullets.filter(b => b.y > 0);
      enemies.forEach(e => e.y += g.speed);

      enemies.forEach(e => {
        bullets.forEach(b => {
          if (Math.abs(e.x - b.x) < 18 && Math.abs(e.y - b.y) < 18) {
            e.hp = 0; b.y = -99;
            score += 20;
            setScore(score);
            Audio8Bit.score();
          }
        });
      });

      if (enemies.some(e => e.hp > 0 && e.y > H - 25)) {
        Audio8Bit.over();
        setStatus("BASE BREACHED!", true);
        return;
      }
      enemies = enemies.filter(e => e.hp > 0);

      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.moveTo(shipX, H - 36);
      ctx.lineTo(shipX - 16, H - 12);
      ctx.lineTo(shipX + 16, H - 12);
      ctx.fill();

      ctx.fillStyle = "#ffe600";
      bullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 10));

      ctx.font = "22px monospace";
      ctx.textAlign = "center";
      enemies.forEach(e => ctx.fillText(g.icon, e.x, e.y));

      animFrame = requestAnimationFrame(step);
    }
    step();
  }

  // 4. PONG ENGINE
  else if (g.engine === "pong") {
    hint.textContent = "Move mouse Up/Down or use Up/Down keys to hit the ball.";
    let py = H / 2 - 35, ay = H / 2 - 35, bx = W / 2, by = H / 2;
    let vx = g.speed, vy = g.speed * 0.6, score = 0;

    function step() {
      if (keys["ArrowUp"] || keys["w"]) py -= 6;
      if (keys["ArrowDown"] || keys["s"]) py += 6;
      py = Math.max(0, Math.min(H - 70, pointer.y - 35));

      ay += (by - (ay + 35)) * 0.085;
      bx += vx; by += vy;

      if (by < 8 || by > H - 8) { vy = -vy; Audio8Bit.blip(); }
      if (bx < 24 && by > py && by < py + 70) {
        vx = Math.abs(vx) * 1.03;
        score += 10;
        setScore(score);
        Audio8Bit.score();
      }
      if (bx > W - 24 && by > ay && by < ay + 70) {
        vx = -Math.abs(vx);
        Audio8Bit.blip();
      }
      if (bx < 0) {
        Audio8Bit.over();
        setStatus("YOU LOSE!", true);
        return;
      }
      if (bx > W) {
        bx = W / 2; by = H / 2; vx = -g.speed;
        score += 50; setScore(score);
      }

      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#262b4d";
      ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = g.color;
      ctx.fillRect(10, py, 10, 70);
      ctx.fillStyle = "#ff2a85";
      ctx.fillRect(W - 20, ay, 10, 70);
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI * 2); ctx.fill();

      animFrame = requestAnimationFrame(step);
    }
    step();
  }

  // 5. FLAPPY ENGINE
  else if (g.engine === "flappy") {
    hint.textContent = "Press Space / Up Arrow or tap screen to fly.";
    let y = H / 2, vy = 0, pipes = [], frame = 0, score = 0;
    const flap = () => { vy = -5.6; Audio8Bit.blip(); };
    canvas.onpointerdown = flap;

    function step() {
      frame++;
      if (keys[" "] || keys["ArrowUp"]) { flap(); keys[" "] = false; keys["ArrowUp"] = false; }
      vy += 0.28;
      y += vy;

      if (frame % 85 === 0) {
        const gapY = 80 + Math.random() * (H - 200);
        pipes.push({ x: W, gapY, passed: false });
      }
      pipes.forEach(p => {
        p.x -= g.speed;
        if (!p.passed && p.x < 70) { p.passed = true; score += 10; setScore(score); Audio8Bit.score(); }
      });
      pipes = pipes.filter(p => p.x > -40);

      const hit = y < 0 || y > H - 15 || pipes.some(p =>
        70 + 12 > p.x && 70 - 12 < p.x + 36 && (y - 12 < p.gapY || y + 12 > p.gapY + 115)
      );
      if (hit) { Audio8Bit.over(); setStatus("CRASHED!", true); return; }

      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = g.color;
      pipes.forEach(p => {
        ctx.fillRect(p.x, 0, 36, p.gapY);
        ctx.fillRect(p.x, p.gapY + 115, 36, H);
      });
      ctx.font = "24px monospace";
      ctx.fillText(g.icon, 70, y + 8);

      animFrame = requestAnimationFrame(step);
    }
    step();
  }

  // 6. RUNNER ENGINE
  else if (g.engine === "runner") {
    hint.textContent = "Press Space / Up or tap screen to jump over obstacles.";
    let y = H - 50, vy = 0, obs = [], frame = 0, score = 0;
    const jump = () => { if (y >= H - 52) { vy = -10.5; Audio8Bit.blip(); } };
    canvas.onpointerdown = jump;

    function step() {
      frame++;
      if (keys[" "] || keys["ArrowUp"]) jump();
      vy += 0.52;
      y = Math.min(H - 50, y + vy);

      if (frame % Math.max(45, Math.floor(290 / g.speed)) === 0) {
        obs.push({ x: W, w: 20, h: 28 + Math.random() * 16 });
      }
      obs.forEach(o => o.x -= g.speed);
      obs = obs.filter(o => o.x > -30);

      if (frame % 6 === 0) { score++; setScore(score); }

      const hit = obs.some(o => 65 > o.x && 45 < o.x + o.w && y + 15 > H - 35 - o.h);
      if (hit) { Audio8Bit.over(); setStatus("TRIPPED!", true); return; }

      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#262b4d";
      ctx.fillRect(0, H - 35, W, 4);
      ctx.fillStyle = "#ff2a85";
      obs.forEach(o => ctx.fillRect(o.x, H - 35 - o.h, o.w, o.h));
      
      // Flipped character facing right (🦖)
      ctx.save();
      ctx.font = "26px monospace";
      ctx.textAlign = "center";
      ctx.translate(60, y + 12); 
      ctx.scale(-1, 1);           
      ctx.fillText(g.icon, 0, 0);
      ctx.restore();

      animFrame = requestAnimationFrame(step);
    }
    step();
  }

  // 7. DODGE / COLLECT ENGINE
  else if (g.engine === "dodge") {
    hint.textContent = "Move to dodge hazards or catch falling items!";
    let px = W / 2, items = [], frame = 0, score = 0;

    function step() {
      frame++;
      if (keys["ArrowLeft"] || keys["a"]) px -= 6;
      if (keys["ArrowRight"] || keys["d"]) px += 6;
      px = Math.max(20, Math.min(W - 20, pointer.x));

      if (frame % 18 === 0) {
        items.push({ x: 20 + Math.random() * (W - 40), y: -15 });
      }
      items.forEach(it => it.y += g.speed);

      if (g.mode === "catch" || g.mode === "collect") {
        items.forEach(it => {
          if (Math.abs(it.x - px) < 24 && Math.abs(it.y - (H - 35)) < 24) {
            it.y = H + 99;
            score += 10; setScore(score); Audio8Bit.score();
          }
        });
        if (frame % 15 === 0) { score++; setScore(score); }
      } else {
        if (frame % 8 === 0) { score++; setScore(score); }
        if (items.some(it => Math.abs(it.x - px) < 20 && Math.abs(it.y - (H - 35)) < 20)) {
          Audio8Bit.over(); setStatus("HIT!", true); return;
        }
      }
      items = items.filter(it => it.y < H + 20);

      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);
      ctx.font = "24px monospace";
      ctx.textAlign = "center";
      ctx.fillText(g.icon, px, H - 25);
      items.forEach(it => ctx.fillText(g.mode === "catch" ? "⭐" : "☄️", it.x, it.y));

      animFrame = requestAnimationFrame(step);
    }
    step();
  }

  // 8. WHACK-A-MOLE ENGINE
  else if (g.engine === "whack") {
    hint.textContent = "Click or tap fast on the tile where targets appear!";
    let activeHole = -1, score = 0, turns = 0;
    const size = W / 3;

    function draw() {
      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) {
        const c = i % 3, r = Math.floor(i / 3);
        ctx.strokeStyle = "#2b315c";
        ctx.strokeRect(c * size + 8, r * size + 8, size - 16, size - 16);
        if (i === activeHole) {
          ctx.font = "44px monospace";
          ctx.textAlign = "center";
          ctx.fillText(g.icon, c * size + size / 2, r * size + size / 2 + 15);
        }
      }
    }

    canvas.onpointerdown = () => {
      const col = Math.floor(pointer.x / size);
      const row = Math.floor(pointer.y / size);
      if (row * 3 + col === activeHole) {
        score += 25; setScore(score); Audio8Bit.score();
        activeHole = -1;
        draw();
      }
    };

    loopTimer = setInterval(() => {
      turns++;
      if (turns > 30) {
        Audio8Bit.over();
        setStatus("TIME UP!", true);
        clearInterval(loopTimer);
        return;
      }
      activeHole = Math.floor(Math.random() * 9);
      draw();
    }, g.speed);
    draw();
  }

  // 9. MEMORY MATCH ENGINE
  else if (g.engine === "memory") {
    hint.textContent = "Flip 2 cards per turn to find all 8 matching pairs.";
    const icons = ["👾","🚀","🍒","💎","🔥","⚡","👻","🕹️"];
    let deck = [...icons, ...icons].sort(() => Math.random() - 0.5)
      .map(icon => ({ icon, open: false, matched: false }));
    let flipped = [], moves = 0, lock = false;
    const size = W / 4;

    function draw() {
      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);
      deck.forEach((card, i) => {
        const c = i % 4, r = Math.floor(i / 4);
        ctx.fillStyle = card.matched ? "#183329" : card.open ? "#252b52" : "#161930";
        ctx.fillRect(c * size + 6, r * size + 6, size - 12, size - 12);
        ctx.strokeStyle = card.matched ? "#39ff14" : g.color;
        ctx.strokeRect(c * size + 6, r * size + 6, size - 12, size - 12);
        if (card.open || card.matched) {
          ctx.font = "34px monospace";
          ctx.textAlign = "center";
          ctx.fillText(card.icon, c * size + size / 2, r * size + size / 2 + 12);
        }
      });
    }

    canvas.onpointerdown = () => {
      if (lock) return;
      const idx = Math.floor(pointer.y / size) * 4 + Math.floor(pointer.x / size);
      const card = deck[idx];
      if (!card || card.open || card.matched) return;
      card.open = true;
      flipped.push(card);
      Audio8Bit.blip();
      draw();

      if (flipped.length === 2) {
        moves++;
        lock = true;
        if (flipped[0].icon === flipped[1].icon) {
          flipped[0].matched = flipped[1].matched = true;
          flipped = [];
          lock = false;
          Audio8Bit.score();
          const score = Math.max(100, 1000 - moves * 25);
          setScore(score);
          draw();
          if (deck.every(c => c.matched)) setStatus("VICTORY!", false);
        } else {
          setTimeout(() => {
            flipped[0].open = flipped[1].open = false;
            flipped = [];
            lock = false;
            draw();
          }, 550);
        }
      }
    };
    draw();
  }

  // 10. MINESWEEPER ENGINE
  else if (g.engine === "mines") {
    hint.textContent = "Click tiles to reveal numbers — avoid the hidden mines!";
    const N = 8, size = W / N;
    let board = Array.from({ length: N * N }, () => ({ mine: false, open: false, count: 0 }));
    let placed = 0, score = 0, over = false;

    while (placed < g.mines) {
      const idx = Math.floor(Math.random() * N * N);
      if (!board[idx].mine) { board[idx].mine = true; placed++; }
    }
    for (let i = 0; i < N * N; i++) {
      if (board[i].mine) continue;
      const r = Math.floor(i / N), c = i % N;
      let cnt = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < N && nc >= 0 && nc < N && board[nr * N + nc].mine) cnt++;
        }
      board[i].count = cnt;
    }

    function reveal(idx) {
      const cell = board[idx];
      if (cell.open) return;
      cell.open = true;
      score += 10;
      setScore(score);
      if (cell.count === 0) {
        const r = Math.floor(idx / N), c = idx % N;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < N && nc >= 0 && nc < N) reveal(nr * N + nc);
          }
      }
    }

    function draw() {
      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);
      board.forEach((cell, i) => {
        const r = Math.floor(i / N), c = i % N;
        ctx.fillStyle = cell.open ? "#1f2447" : "#12152b";
        ctx.fillRect(c * size + 2, r * size + 2, size - 4, size - 4);
        ctx.strokeStyle = "#2f3661";
        ctx.strokeRect(c * size + 2, r * size + 2, size - 4, size - 4);
        if (cell.open) {
          ctx.font = "20px monospace";
          ctx.textAlign = "center";
          if (cell.mine) ctx.fillText("💣", c * size + size / 2, r * size + size / 2 + 7);
          else if (cell.count > 0) {
            ctx.fillStyle = g.color;
            ctx.fillText(cell.count, c * size + size / 2, r * size + size / 2 + 7);
          }
        }
      });
    }

    canvas.onpointerdown = () => {
      if (over) return;
      const idx = Math.floor(pointer.y / size) * N + Math.floor(pointer.x / size);
      const cell = board[idx];
      if (!cell || cell.open) return;
      if (cell.mine) {
        over = true;
        board.forEach(c => { if (c.mine) c.open = true; });
        Audio8Bit.over();
        setStatus("BOOM!", true);
      } else {
        reveal(idx);
        Audio8Bit.score();
        if (board.filter(c => !c.mine).every(c => c.open)) {
          over = true;
          setStatus("YOU WIN!", false);
        }
      }
      draw();
    };
    draw();
  }

  // 11. BOMBER ENGINE
  else if (g.engine === "bomber") {
    hint.textContent = "Use Arrow keys / WASD to move, Space to plant a bomb!";
    let player = { x: 1, y: 1 };
    let bombs = [];
    let enemies = [{ x: 5, y: 5, dx: 1, dy: 0 }];
    let walls = [
      {x:2,y:2},{x:2,y:3},{x:4,y:2},{x:4,y:4},{x:6,y:3}
    ];
    let explosions = [];
    let score = 0, grid = 30, mapSize = 9;

    const plantBomb = () => {
      if (!bombs.some(b => b.x === player.x && b.y === player.y)) {
        bombs.push({ x: player.x, y: player.y, timer: 60 });
        Audio8Bit.blip();
      }
    };

    canvas.onpointerdown = plantBomb;

    function step() {
      if (keys["ArrowUp"] || keys["w"]) { player.y = Math.max(0, player.y - 0.1); keys["ArrowUp"] = false; }
      if (keys["ArrowDown"] || keys["s"]) { player.y = Math.min(mapSize - 1, player.y + 0.1); keys["ArrowDown"] = false; }
      if (keys["ArrowLeft"] || keys["a"]) { player.x = Math.max(0, player.x - 0.1); keys["ArrowLeft"] = false; }
      if (keys["ArrowRight"] || keys["d"]) { player.x = Math.min(mapSize - 1, player.x + 0.1); keys["ArrowRight"] = false; }
      if (keys[" "]) { plantBomb(); keys[" "] = false; }

      bombs.forEach(b => {
        b.timer--;
        if (b.timer <= 0) {
          Audio8Bit.shoot();
          explosions.push({ x: b.x, y: b.y, life: 15 });
          walls = walls.filter(w => Math.abs(w.x - b.x) + Math.abs(w.y - b.y) > 1);
          enemies = enemies.filter(e => {
            const hit = Math.abs(e.x - b.x) <= 1 && e.y === b.y || Math.abs(e.y - b.y) <= 1 && e.x === b.x;
            if (hit) { score += 50; setScore(score); Audio8Bit.score(); }
            return !hit;
          });
        }
      });
      bombs = bombs.filter(b => b.timer > 0);
      explosions.forEach(ex => ex.life--);
      explosions = explosions.filter(ex => ex.life > 0);

      const hitPlayer = enemies.some(e => Math.hypot(e.x - player.x, e.y - player.y) < 0.5) ||
                        explosions.some(ex => Math.abs(ex.x - Math.round(player.x)) <= 0 && Math.abs(ex.y - Math.round(player.y)) <= 0);
      if (hitPlayer) {
        Audio8Bit.over();
        setStatus("BLOWN UP!", true);
        return;
      }

      ctx.fillStyle = "#070811";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#262b4d";
      walls.forEach(w => ctx.fillRect(w.x * grid, w.y * grid, grid - 2, grid - 2));

      ctx.fillStyle = "#ffe600";
      bombs.forEach(b => ctx.fillText("💣", b.x * grid + 4, b.y * grid + 22));

      ctx.fillStyle = "#ff2a85";
      explosions.forEach(ex => ctx.fillRect(ex.x * grid, ex.y * grid, grid, grid));

      ctx.font = "22px monospace";
      enemies.forEach(e => ctx.fillText("👾", e.x * grid + 2, e.y * grid + 22));
      ctx.fillText("🧑‍💻", Math.round(player.x) * grid + 2, Math.round(player.y) * grid + 22);

      animFrame = requestAnimationFrame(step);
    }
    step();
  }

  // 12. AQUARIUM ENGINE
  else if (g.engine === "aquarium") {
    hint.textContent = "Click or tap the tank to drop food and feed your fish!";
    let fishList = [
      { x: 50, y: 100, vx: 1.2, vy: 0.2, icon: "🐠", hunger: 100 },
      { x: 200, y: 200, vx: -1.0, vy: -0.3, icon: "🐡", hunger: 100 },
      { x: 300, y: 150, vx: 0.8, vy: 0.4, icon: "🦐", hunger: 100 }
    ];
    let foods = [];
    let score = 0;

    canvas.onpointerdown = () => {
      foods.push({ x: pointer.x, y: pointer.y });
      Audio8Bit.blip();
    };

    function step() {
      ctx.fillStyle = "#0a192f";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(0, 240, 255, 0.2)";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc((i * 80 + Date.now() * 0.05) % W, (H - (Date.now() * 0.08 + i * 50) % H), 4, 0, Math.PI * 2);
        ctx.fill();
      }

      foods.forEach(f => f.y += 1.5);
      foods = foods.filter(f => f.y < H);

      fishList.forEach(f => {
        f.x += f.vx; f.y += f.vy;
        if (f.x < 20 || f.x > W - 20) f.vx *= -1;
        if (f.y < 40 || f.y > H - 40) f.vy *= -1;

        foods.forEach((fd, idx) => {
          if (Math.hypot(f.x - fd.x, f.y - fd.y) < 25) {
            foods.splice(idx, 1);
            score += 10;
            setScore(score);
            Audio8Bit.score();
          }
        });

        ctx.font = "28px monospace";
        ctx.save();
        if (f.vx < 0) { ctx.translate(f.x, f.y); ctx.scale(-1, 1); ctx.fillText(f.icon, 0, 0); }
        else { ctx.fillText(f.icon, f.x, f.y); }
        ctx.restore();
      });

      ctx.fillStyle = "#ffe600";
      foods.forEach(fd => { ctx.beginPath(); ctx.arc(fd.x, fd.y, 4, 0, Math.PI * 2); ctx.fill(); });

      animFrame = requestAnimationFrame(step);
    }
    step();
  }

  // 13. GARDEN ENGINE
  else if (g.engine === "garden") {
    hint.textContent = "Click a soil plot to plant seeds, water, and harvest when fully grown!";
    let plots = [
      { id: 0, state: 0, timer: 0 },
      { id: 1, state: 0, timer: 0 },
      { id: 2, state: 0, timer: 0 },
      { id: 3, state: 0, timer: 0 }
    ];
    let score = 0;
    const size = 160;

    canvas.onpointerdown = () => {
      const col = Math.floor(pointer.x / size);
      const row = Math.floor(pointer.y / size);
      const idx = row * 2 + col;
      if (idx >= 0 && idx < 4) {
        let p = plots[idx];
        if (p.state === 0) { p.state = 1; p.timer = 120; Audio8Bit.blip(); }
        else if (p.state === 3) {
          p.state = 0; score += 50; setScore(score); Audio8Bit.score();
        }
      }
    };

    function step() {
      ctx.fillStyle = "#0b150c";
      ctx.fillRect(0, 0, W, H);

      plots.forEach((p, i) => {
        const c = i % 2, r = Math.floor(i / 2);
        const x = c * size + 40, y = r * size + 60;

        if (p.state > 0) {
          p.timer--;
          if (p.timer <= 0 && p.state < 3) { p.state++; p.timer = 120; }
        }

        ctx.fillStyle = "#3d2817";
        ctx.fillRect(c * size + 15, r * size + 15, size - 30, size - 30);
        ctx.strokeStyle = "#5c3a21";
        ctx.strokeRect(c * size + 15, r * size + 15, size - 30, size - 30);

        let icon = "";
        if (p.state === 1) icon = "🌱";
        else if (p.state === 2) icon = "🌿";
        else if (p.state === 3) icon = "🌻";

        if (icon) {
          ctx.font = "40px monospace";
          ctx.textAlign = "center";
          ctx.fillText(icon, x + 40, y + 20);
        } else {
          ctx.font = "12px monospace";
          ctx.fillStyle = "#8b93b8";
          ctx.textAlign = "center";
          ctx.fillText("Click to Plant", x + 40, y + 20);
        }
      });

      animFrame = requestAnimationFrame(step);
    }
    step();
  }
}
