import { Player, Projectile, Enemy, Particle } from './classes.js';
import { initAudio, toggleSound, sounds } from './audio.js';
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
const icon = soundToggle.querySelector('i');

// Set canvas dimensions to full screen
canvas.width = innerWidth;
canvas.height = innerHeight;

// Get canvas context for drawing
const ctx = canvas.getContext('2d');

// Variables de estado del juego
let player;
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0; // Load high score from localStorage
let gameLevel = 1;
let animationId; // ID de la animación para poder cancelarla
let spawnInterval;
let gameActive = false;
let isPaused = false;

// Mostrar la puntuación más alta almacenada
highScoreEl.textContent = highScore;

/**
 * Initialize/reset game state
 */
function init() {
  initAudio();
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
 * Genera enemigos a intervalos regulares
 * La velocidad y frecuencia de aparición aumenta con el nivel del juego
 * Los enemigos aparecen desde los bordes de la pantalla
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
 * Crea una etiqueta flotante con la puntuación cuando se golpea a un enemigo
 * @param {Object} projectile - El proyectil que impactó
 * @param {number} score - Puntos obtenidos
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
 * - Muestra la pantalla de game over
 * - Actualiza la puntuación más alta si es necesario
 * - Detiene la generación de enemigos y la animación
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
 * Bucle principal de animación del juego
 * - Actualiza las posiciones de todos los elementos
 * - Detecta colisiones
 * - Actualiza la puntuación y el nivel
 * - Maneja la lógica de dificultad progresiva
 */
function animate() {
  if (isPaused) return;
  
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw(ctx);

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update(ctx);
    }
  });

  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update(ctx);

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
    enemy.update(ctx);

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 1) {
      sounds.hit();
      if (player.takeDamage(34)) {
        endGame();
      }
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

/**
 * Manejo de disparos al hacer clic
 * - Calcula el ángulo entre el jugador y el punto de clic
 * - Crea un nuevo proyectil en esa dirección
 * - Reproduce el sonido de disparo
 */
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

/**
 * Alterna el estado de pausa del juego
 * - Detiene/reanuda la animación y la generación de enemigos
 * - Muestra/oculta el menú de pausa
 * - Actualiza el icono del botón de pausa
 */
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

// Event Listeners

// Control de sonido al hacer clic en el botón
soundToggle.addEventListener('click', () => {
  toggleSound(soundToggle);
});

/**
 * Manejo de disparos al hacer clic
 * - Calcula el ángulo entre el jugador y el punto de clic
 * - Crea un nuevo proyectil en esa dirección
 * - Reproduce el sonido de disparo
 */
addEventListener('click', (event) => {
  if (!gameActive || isPaused) return;
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

pauseBtn.addEventListener('click', togglePause);

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

// Controles de teclado para pausa (ESC o P) y sonido (M)
addEventListener('keydown', (event) => {
  if ((event.key === 'Escape' || event.key.toLowerCase() === 'p') && gameActive) {
    togglePause();
  } else if (event.key.toLowerCase() === 'm') {
    toggleSound(soundToggle);
  }
});

/**
 * Manejo del redimensionamiento de la ventana
 * - Ajusta el tamaño del canvas
 * - Reinicializa el juego para mantener las proporciones correctas
 */
addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  init();
});
