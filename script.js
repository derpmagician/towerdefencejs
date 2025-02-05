// DOM Elements
const canvas = document.getElementById('canvas');
const scoreEl = document.querySelector('#score span:last-child');
const modalEl = document.getElementById('modal');
const bigScoreEl = document.getElementById('bigScoreEl');
const startGameBtn = document.getElementById('modalBtn');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('finalScoreEl');
const restartBtn = document.getElementById('restartBtn');
const highScoreEl = document.querySelector('#high-score span:last-child');
const levelEl = document.querySelector('#level span:last-child');
const pauseBtn = document.getElementById('pauseBtn');
const pauseMenu = document.getElementById('pause-menu');
const resumeBtn = document.getElementById('resumeBtn');
const restartFromPauseBtn = document.getElementById('restartFromPauseBtn');
const soundToggle = document.getElementById('soundToggle');

// Set canvas dimensions to full screen
canvas.width = innerWidth;
canvas.height = innerHeight;

// Get canvas context for drawing
const ctx = canvas.getContext('2d');

// Game state variables
let player;
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0; // Load high score from localStorage
let gameLevel = 1;
let animationId;
let spawnInterval;
let gameActive = false;

// Audio Context
let audioContext;
let isSoundEnabled = true;
let isPaused = false;

// Sound effects
const sounds = {
  shoot: null,
  explosion: null,
  levelUp: null,
  gameOver: null,
  hit: null
};

// Initialize Audio Context and load sounds
function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create oscillator for shooting sound
  sounds.shoot = () => {
    if (!isSoundEnabled || !audioContext) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(880, audioContext.currentTime);
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.1);
  };

  // Create noise for explosion sound
  sounds.explosion = () => {
    if (!isSoundEnabled || !audioContext) return;
    
    const bufferSize = audioContext.sampleRate * 0.1;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(audioContext.destination);
    
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    source.start();
  };

  // Create level up sound
  sounds.levelUp = () => {
    if (!isSoundEnabled || !audioContext) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(440, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
  };

  // Create game over sound
  sounds.gameOver = () => {
    if (!isSoundEnabled || !audioContext) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(880, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.5);
  };

  // Create hit sound
  sounds.hit = () => {
    if (!isSoundEnabled || !audioContext) return;
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(220, audioContext.currentTime);
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.1);
  };
}

// Display initial high score
highScoreEl.textContent = highScore;

/**
 * Player class - represents the player's tower
 * @class
 */
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.health = 100; // Player starts with 100 health
  }

  // Draw player and health bar
  draw() {
    // Draw player circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Draw health bar background (red)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(this.x - 25, this.y + 30, 50, 5);
    // Draw current health (green)
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fillRect(this.x - 25, this.y + 30, this.health / 2, 5);
  }

  // Handle damage taken by player
  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      endGame();
    }
  }
}

/**
 * Projectile class - represents bullets shot by the player
 * @class
 */
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  // Draw projectile
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  // Update projectile position
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

/**
 * Enemy class - represents enemies that approach the tower
 * @class
 */
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    // 20% chance to spawn a special enemy
    this.type = Math.random() < 0.2 ? 'special' : 'normal';
    if (this.type === 'special') {
      this.color = '#ff0000';
      this.radius *= 1.5; // Special enemies are larger
    }
  }

  // Draw enemy
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Add glowing effect for special enemies
    if (this.type === 'special') {
      ctx.strokeStyle = '#ff9999';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Update enemy position
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

// Friction constant for particle effects
const friction = 0.99;

/**
 * Particle class - creates explosion effects when enemies are hit
 * @class
 */
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1; // For fade out effect
  }

  // Draw particle with current opacity
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  // Update particle position and opacity
  update() {
    this.draw();
    // Apply friction to slow down particles
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    // Update position
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    // Fade out effect
    this.alpha -= 0.01;
  }
}

/**
 * Initialize/reset game state
 */
function init() {
  if (!audioContext) {
    initAudio();
  }
  player = new Player(canvas.width / 2, canvas.height / 2, 15, '#fff');
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  gameLevel = 1;
  scoreEl.textContent = score;
  levelEl.textContent = gameLevel;
  player.health = 100;
  isPaused = false;
}

/**
 * Spawn enemies at regular intervals
 * Spawn rate and enemy speed increase with game level
 */
function spawnEnemies() {
  spawnInterval = setInterval(() => {
    const radius = Math.random() * (30 - 10) + 10;
    let x, y;

    // Randomly position enemies outside the canvas
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    // Calculate angle towards player
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    // Enemy speed increases with game level
    const velocity = {
      x: Math.cos(angle) * (2 + gameLevel * 0.5),
      y: Math.sin(angle) * (2 + gameLevel * 0.5)
    };

    // Random color for enemy
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000 - (gameLevel * 50)); // Spawn rate increases with game level
}

/**
 * Create floating score label when hitting enemies
 */
function createScoreLabel(projectile, score) {
  const label = document.createElement('div');
  label.innerHTML = score;
  label.style.position = 'absolute';
  label.style.color = '#fff';
  label.style.userSelect = 'none';
  label.style.left = projectile.x + 'px';
  label.style.top = projectile.y + 'px';
  document.body.appendChild(label);

  // Animate score label
  gsap.to(label, {
    opacity: 0,
    y: -30,
    duration: 0.75,
    onComplete: () => document.body.removeChild(label)
  });
}

/**
 * Handle game over state
 */
function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  cancelAnimationFrame(animationId);
  sounds.gameOver();
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreEl.textContent = highScore;
  }
  
  finalScoreEl.textContent = score;
  gameOverEl.style.display = 'grid';
}

/**
 * Main game animation loop
 */
function animate() {
  if (isPaused) return;
  
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update();

    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(projectileIndex, 1);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 1) {
      sounds.hit();
      player.takeDamage(34);
      enemies.splice(enemyIndex, 1);
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      
      if (dist - enemy.radius - projectile.radius < 1) {
        sounds.explosion();
        
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6)
              }
            )
          );
        }

        const scoreIncrease = enemy.type === 'special' ? 
          Math.floor(enemy.radius) * 2 : 
          Math.floor(enemy.radius);
        
        score += scoreIncrease;
        createScoreLabel(projectile, scoreIncrease);
        scoreEl.textContent = score;
        
        if (score > gameLevel * 1000) {
          gameLevel++;
          levelEl.textContent = gameLevel;
          clearInterval(spawnInterval);
          spawnEnemies();
          sounds.levelUp();
        }

        enemies.splice(enemyIndex, 1);
        projectiles.splice(projectileIndex, 1);
      }
    });
  });
}

// Event Listeners

// Handle mouse clicks for shooting
addEventListener('click', (event) => {
  if (!gameActive || isPaused) return;
  
  // Si el click fue en los botones de control, no disparar
  if (event.target.closest('.game-controls')) return;

  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  };
  
  sounds.shoot();
  
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, '#fff', velocity)
  );
});

// Start game button handler
startGameBtn.addEventListener('click', () => {
  init();
  modalEl.style.display = 'none';
  gameActive = true;
  animate();
  spawnEnemies();
});

// Restart game button handler
restartBtn.addEventListener('click', () => {
  init();
  gameOverEl.style.display = 'none';
  gameActive = true;
  animate();
  spawnEnemies();
});

// Event Listeners para controles
function togglePause() {
  if (!gameActive) return;
  
  isPaused = !isPaused;
  if (isPaused) {
    cancelAnimationFrame(animationId);
    clearInterval(spawnInterval);
    pauseMenu.style.display = 'grid';
    pauseBtn.querySelector('i').classList.remove('fa-pause');
    pauseBtn.querySelector('i').classList.add('fa-play');
  } else {
    pauseMenu.style.display = 'none';
    pauseBtn.querySelector('i').classList.remove('fa-play');
    pauseBtn.querySelector('i').classList.add('fa-pause');
    animate();
    spawnEnemies();
  }
}

function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  soundToggle.querySelector('i').classList.toggle('fa-volume-up');
  soundToggle.querySelector('i').classList.toggle('fa-volume-mute');
}

pauseBtn.addEventListener('click', togglePause);
soundToggle.addEventListener('click', toggleSound);
resumeBtn.addEventListener('click', () => {
  isPaused = false;
  pauseMenu.style.display = 'none';
  pauseBtn.querySelector('i').classList.remove('fa-play');
  pauseBtn.querySelector('i').classList.add('fa-pause');
  animate();
  spawnEnemies();
});

restartFromPauseBtn.addEventListener('click', () => {
  pauseMenu.style.display = 'none';
  init();
  animate();
  spawnEnemies();
});

// Controles de teclado
addEventListener('keydown', (event) => {
  if ((event.key === 'Escape' || event.key.toLowerCase() === 'p') && gameActive) {
    togglePause();
  } else if (event.key.toLowerCase() === 'm') {
    toggleSound();
  }
});

// Tecla ESC para pausar
// addEventListener('keydown', (event) => {
//   if (event.key === 'Escape' && gameActive) {
//     isPaused = !isPaused;
//     if (isPaused) {
//       cancelAnimationFrame(animationId);
//       clearInterval(spawnInterval);
//       pauseMenu.style.display = 'grid';
//       pauseBtn.querySelector('i').classList.remove('fa-pause');
//       pauseBtn.querySelector('i').classList.add('fa-play');
//     } else {
//       pauseMenu.style.display = 'none';
//       pauseBtn.querySelector('i').classList.remove('fa-play');
//       pauseBtn.querySelector('i').classList.add('fa-pause');
//       animate();
//       spawnEnemies();
//     }
//   }
// });

// Handle window resize
addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  init();
});
