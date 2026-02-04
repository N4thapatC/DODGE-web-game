const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;


// Audio System
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let isMusicMuted = false;

// God Mode (secret)
let godMode = false;

// Sound Effects Functions
function playBeep(frequency, duration, type = 'square') {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function playDeathSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

function playPhaseSound() {
  // Arpeggio effect
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    setTimeout(() => playBeep(freq, 0.15, 'square'), i * 100);
  });
}

// Background Music
let bgMusicAudio = null;
let bgMusicTimeout = null;
let currentMusicPhase = null;
let hasTriedLoadingMusic = false; // เช็คว่าเคยลองโหลดไฟล์แล้วหรือยัง

function startBackgroundMusic() {
  // ถ้า phase เปลี่ยน หรือยังไม่เคยโหลดเพลงเลย
  if (currentMusicPhase !== phase || (!bgMusicAudio && !hasTriedLoadingMusic)) {
    // Stop เพลงเก่า
    if (bgMusicAudio) {
      bgMusicAudio.pause();
      bgMusicAudio = null;
    }
    
    currentMusicPhase = phase;
    hasTriedLoadingMusic = true;
    
    // เลือกไฟล์ตาม phase
    const musicFiles = {
      1: 'music/phase1.mp3',  // BASIC
      2: 'music/phase2.mp3',  // AIM
      3: 'music/phase3.mp3',  // MIXED
      4: 'music/phase4.mp3'   // HARDCORE/ENDLESS
    };
    
    bgMusicAudio = new Audio(musicFiles[phase]);
    bgMusicAudio.loop = true;
    bgMusicAudio.volume = 0.15;
    
    // ถ้าโหลดไฟล์สำเร็จ ใช้ไฟล์
    if (!isMusicMuted) {
      bgMusicAudio.play().catch(() => {
        // ถ้าไฟล์ไม่มี ไม่ต้องเล่นอะไร (เงียบ)
        console.log(`ไม่พบไฟล์: ${musicFiles[phase]}`);
        bgMusicAudio = null;
      });
    }
  } else if (bgMusicAudio && !isMusicMuted) {
    // ถ้ามีไฟล์อยู่แล้วและไม่ mute เล่นต่อ
    bgMusicAudio.play().catch(() => {});
  }
}

function stopBackgroundMusic() {
  if (bgMusicAudio) {
    bgMusicAudio.pause();
    // ไม่ null เพื่อให้สามารถเล่นต่อได้
  }
  if (bgMusicTimeout) {
    clearTimeout(bgMusicTimeout);
    bgMusicTimeout = null;
  }
}


// Game State
const GAME_STATE = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  DEAD: "DEAD"
};

const PHASE = {
  BASIC: 1,
  AIM: 2,
  MIXED: 3,
  HARDCORE: 4
};

const PHASE_DURATION = 30; // seconds

let phaseStartTime = 0;

let gameState = GAME_STATE.MENU;
let phase = PHASE.BASIC;

let keys = {};


// Death Effect
let deathEffectStart = 0;
const DEATH_EFFECT_DURATION = 800; // ms
let shakeIntensity = 0;


// Transition
let isTransition = false;
let transitionStart = 0;
const TRANSITION_DURATION = 1000; // ms


// Score
let startTime = 0;
let timeSurvived = 0;
let highScore = localStorage.getItem("dodge_highscore") || 0;
let latestScore = 0;


// Player
const player = {
  size: 8,
  speed: 4,
  x: WIDTH / 2,
  y: HEIGHT / 2,
  reset() {
    this.x = WIDTH / 2;
    this.y = HEIGHT / 2;
  },
  update() {
    if (keys["ArrowUp"] || keys["w"]) this.y -= this.speed;
    if (keys["ArrowDown"] || keys["s"]) this.y += this.speed;
    if (keys["ArrowLeft"] || keys["a"]) this.x -= this.speed;
    if (keys["ArrowRight"] || keys["d"]) this.x += this.speed;

    this.x = Math.max(0, Math.min(WIDTH - this.size, this.x));
    this.y = Math.max(0, Math.min(HEIGHT - this.size, this.y));
  },
  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
};


// Enemies
let enemies = [];

let basicSpeed = 2;
let aimSpeed = 2;

let basicSpawnInterval = 1000;
let aimSpawnInterval = 1200;

let lastBasicSpawn = 0;
let lastAimSpawn = 0;

function spawnBasicEnemy(speed) {
  const size = 8;
  let x, y, vx, vy;
  const side = Math.floor(Math.random() * 4);

  if (side === 0) { x = Math.random() * WIDTH; y = -size; vx = 0; vy = speed; }
  else if (side === 1) { x = Math.random() * WIDTH; y = HEIGHT + size; vx = 0; vy = -speed; }
  else if (side === 2) { x = -size; y = Math.random() * HEIGHT; vx = speed; vy = 0; }
  else { x = WIDTH + size; y = Math.random() * HEIGHT; vx = -speed; vy = 0; }

  enemies.push({ x, y, vx, vy, size });
}

function spawnAimedEnemy(speed) {
  const size = 8;
  let x, y;
  const side = Math.floor(Math.random() * 4);

  if (side === 0) { x = Math.random() * WIDTH; y = -size; }
  else if (side === 1) { x = Math.random() * WIDTH; y = HEIGHT + size; }
  else if (side === 2) { x = -size; y = Math.random() * HEIGHT; }
  else { x = WIDTH + size; y = Math.random() * HEIGHT; }

  const dx = player.x - x;
  const dy = player.y - y;
  const len = Math.hypot(dx, dy);

  enemies.push({
    x, y,
    vx: (dx / len) * speed,
    vy: (dy / len) * speed,
    size
  });
}


// Input
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (gameState === GAME_STATE.MENU && e.key === " ") {
    startGame();
  }
  
  // Mute/Unmute with M key
  if (e.key === "m" || e.key === "M") {
    isMusicMuted = !isMusicMuted;
    
    if (isMusicMuted) {
      stopBackgroundMusic();
    } else if (gameState === GAME_STATE.PLAYING) {
      startBackgroundMusic();
    }
    
    playBeep(440, 0.05, 'square'); // Toggle sound feedback
  }
  
  // God Mode toggle with G key (secret)
  if (e.key === "g" || e.key === "G") {
    godMode = !godMode;
    playBeep(godMode ? 880 : 440, 0.1, 'square'); // High beep for on, low for off
    console.log(`God Mode: ${godMode ? 'ON' : 'OFF'}`);
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});


// Game Control
function startGame() {
  gameState = GAME_STATE.PLAYING;
  phase = PHASE.BASIC;
  enemies = [];

  basicSpeed = 2;
  aimSpeed = 2;

  basicSpawnInterval = 1000;
  aimSpawnInterval = 1200;

  lastBasicSpawn = 0;
  lastAimSpawn = 0;

  player.reset();
  startTime = performance.now();
  phaseStartTime = performance.now();
  
  // Reset music loading flag
  hasTriedLoadingMusic = false;
  currentMusicPhase = null;
  
  // Start background music
  startBackgroundMusic();
  playBeep(523.25, 0.1, 'square'); // Start sound
}

function startPhase(newPhase) {
  phase = newPhase;
  enemies = [];

  phaseStartTime = performance.now();

  isTransition = true;
  transitionStart = performance.now();
  
  // Play phase change sound
  playPhaseSound();
  
  // Change background music
  if (!isMusicMuted) {
    startBackgroundMusic();
  }
}

function gameOver() {
  gameState = GAME_STATE.DEAD;
  deathEffectStart = performance.now();
  latestScore = timeSurvived.toFixed(1);
  if (timeSurvived > highScore) {
    highScore = timeSurvived.toFixed(1);
    localStorage.setItem("dodge_highscore", highScore);
  }
  
  // Stop music and play death sound
  stopBackgroundMusic();
  playDeathSound();
}

// Collision
function isColliding(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

// Phase Colors
function getPhaseColor(phaseNum) {
  switch(phaseNum) {
    case PHASE.BASIC: return "#00ff00"; // เขียว
    case PHASE.AIM: return "#ffff00"; // เหลือง
    case PHASE.MIXED: return "#ff8800"; // ส้ม
    case PHASE.HARDCORE: return "#ff0000"; // แดง
    default: return "white";
  }
}

function getPhaseName(phaseNum) {
  switch(phaseNum) {
    case PHASE.BASIC: return "BASIC";
    case PHASE.AIM: return "AIM";
    case PHASE.MIXED: return "MIXED";
    case PHASE.HARDCORE: return "ENDLESS PHASE";
    default: return "";
  }
}

// Update & Draw
function update(timestamp) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (gameState === GAME_STATE.MENU) {
    drawMenu();
    requestAnimationFrame(update);
    return;
  }

  if (gameState === GAME_STATE.DEAD) {
    drawDeathEffect(timestamp);
    requestAnimationFrame(update);
    return;
  }

  timeSurvived = (timestamp - startTime) / 1000;
  const phaseElapsed = (timestamp - phaseStartTime) / 1000;

  // -------- Phase Switching --------
  if (timeSurvived >= 30 && phase === PHASE.BASIC) startPhase(PHASE.AIM);
  else if (timeSurvived >= 60 && phase === PHASE.AIM) startPhase(PHASE.MIXED);
  else if (timeSurvived >= 90 && phase === PHASE.MIXED) startPhase(PHASE.HARDCORE);

  if (phase === PHASE.BASIC) {
    basicSpeed = 2 + phaseElapsed * 0.05;
    basicSpawnInterval = Math.max(300, 1000 - phaseElapsed * 30);
  }

  if (phase === PHASE.AIM) {
    aimSpeed = 2 + phaseElapsed * 0.07;
    aimSpawnInterval = Math.max(400, 1200 - phaseElapsed * 30);
  }

  if (phase === PHASE.MIXED) {
    basicSpeed = 2;
    basicSpawnInterval = Math.max(250, 900 - phaseElapsed * 35);

    aimSpeed = 2 + phaseElapsed * 0.08;
  }

  if (phase === PHASE.HARDCORE) {
    basicSpeed = 2 + phaseElapsed * 0.05;
    aimSpeed   = 2 + phaseElapsed * 0.07;

    basicSpawnInterval = Math.max(150, 800 - phaseElapsed * 25);
    aimSpawnInterval   = Math.max(300, 1200 - phaseElapsed * 20);
  }


  // -------- Spawn Enemies --------
  if (!isTransition) {
    if (phase === PHASE.BASIC || phase === PHASE.MIXED || phase === PHASE.HARDCORE) {
      if (timestamp - lastBasicSpawn > basicSpawnInterval) {
        spawnBasicEnemy(basicSpeed);
        lastBasicSpawn = timestamp;
      }
    }

    if (phase === PHASE.AIM || phase === PHASE.MIXED || phase === PHASE.HARDCORE) {
      if (timestamp - lastAimSpawn > aimSpawnInterval) {
        spawnAimedEnemy(aimSpeed);
        lastAimSpawn = timestamp;
      }
    }
  }

  // -------- Update Player --------
  if (!isTransition) player.update();
  player.draw();

  // -------- Update Enemies --------
  enemies.forEach((e) => {
    e.x += e.vx;
    e.y += e.vy;

    ctx.fillStyle = "red";
    ctx.fillRect(e.x, e.y, e.size, e.size);

    if (!godMode && isColliding(player, e)) {
      gameOver();
    }
  });

  // -------- HUD --------
  ctx.fillStyle = "white";
  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.fillText(`TIME: ${timeSurvived.toFixed(1)}`, 10, 20);
  
  ctx.fillStyle = getPhaseColor(phase);
  ctx.fillText(`PHASE ${phase}`, WIDTH - 110, 20);
  
  // Mute indicator
  if (isMusicMuted) {
    ctx.fillStyle = "gray";
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillText("MUSIC OFF", 10, HEIGHT - 10);
  }
  
  // God Mode indicator
  if (godMode) {
    ctx.fillStyle = "gold";
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillText("GOD MODE", WIDTH - 110, HEIGHT - 10);
  }

  // -------- Transition Overlay --------
  if (isTransition) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = getPhaseColor(phase);
    ctx.font = "32px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`PHASE ${phase}`, WIDTH / 2, HEIGHT / 2 - 25);

    ctx.font = "14px 'Press Start 2P', monospace";
    ctx.fillText(getPhaseName(phase), WIDTH / 2, HEIGHT / 2 + 15);

    ctx.fillStyle = "white";
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillText("GET READY", WIDTH / 2, HEIGHT / 2 + 50);
    ctx.textAlign = "left";

    if (timestamp - transitionStart > TRANSITION_DURATION) {
      isTransition = false;
    }
  }

  requestAnimationFrame(update);
}


// Menu
function drawMenu() {
  ctx.fillStyle = "white";
  ctx.font = "24px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText("DODGE.exe", WIDTH / 2, HEIGHT / 2 - 60);

  // Smooth fade in/out "PRESS SPACE TO START"
  const fadeSpeed = 1500; // fade cycle ทุก 1.5 วินาที
  const fadeValue = (Math.sin(Date.now() / fadeSpeed * Math.PI * 2) + 1) / 2; // 0 ถึง 1
  const alpha = 0.3 + (fadeValue * 0.7); // 0.3 ถึง 1.0
  
  ctx.globalAlpha = alpha;
  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.fillText("PRESS SPACE", WIDTH / 2, HEIGHT / 2 - 10);
  ctx.fillText("TO START", WIDTH / 2, HEIGHT / 2 + 10);
  ctx.globalAlpha = 1.0;

  ctx.font = "10px 'Press Start 2P', monospace";
  if (latestScore > 0) {
    ctx.fillText(`LATEST: ${latestScore}s`, WIDTH / 2, HEIGHT / 2 + 50);
    ctx.fillText(`BEST: ${highScore}s`, WIDTH / 2, HEIGHT / 2 + 70);
  } else {
    ctx.fillText(`BEST: ${highScore}s`, WIDTH / 2, HEIGHT / 2 + 50);
  }
  
  // Controls hint
  ctx.font = "8px 'Press Start 2P', monospace";
  ctx.fillStyle = "gray";
  ctx.fillText("ARROWS/WASD: MOVE | M: MUTE", WIDTH / 2, HEIGHT - 15);
  
  ctx.textAlign = "left";
}

// Death Effect
function drawDeathEffect(timestamp) {
  const elapsed = timestamp - deathEffectStart;
  const progress = elapsed / DEATH_EFFECT_DURATION;

  // Screen shake
  if (progress < 1) {
    shakeIntensity = 8 * (1 - progress); // ลดลงเรื่อยๆ
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;
    
    ctx.save();
    ctx.translate(shakeX, shakeY);
  }

  // Red flash effect
  const flashIntensity = Math.sin(elapsed * 0.02) * 0.5 + 0.5; // กะพริบ
  const alpha = (1 - progress) * 0.7; // จางลงเรื่อยๆ
  ctx.fillStyle = `rgba(255, 0, 0, ${alpha * flashIntensity})`;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // วาดผู้เล่นและศัตรูแบบ static
  player.draw();
  enemies.forEach((e) => {
    ctx.fillStyle = "red";
    ctx.fillRect(e.x, e.y, e.size, e.size);
  });

  // "DEAD" text
  ctx.fillStyle = "white";
  ctx.font = "42px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  const textAlpha = Math.sin(elapsed * 0.015) * 0.3 + 0.7;
  ctx.globalAlpha = textAlpha;
  ctx.fillText("DEAD", WIDTH / 2, HEIGHT / 2);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";

  if (progress < 1) {
    ctx.restore();
  }

  // กลับไปเมนูเมื่อเอฟเฟกต์จบ
  if (elapsed >= DEATH_EFFECT_DURATION) {
    gameState = GAME_STATE.MENU;
  }
}

requestAnimationFrame(update);