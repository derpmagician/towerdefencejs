const canvas =  document.getElementById('canvas');
const scoreEl =  document.getElementById('score');
const modalEl =  document.getElementById('modal');
const bigScoreEl = document.getElementById('bigScoreEl')
const startGameBtn =  document.getElementById('modalBtn');
canvas.width = innerWidth;
canvas.height = innerHeight;

ctx = canvas.getContext('2d');

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.99
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01
  }
}

const centerX = canvas.width / 2
const centerY = canvas.height / 2

let player = new Player(centerX, centerY, 10, "#23455a");
let projectiles = [];
let enemies = [];
let particles = [];
let intervalId;
let animationId;
let score = 0;

function init() {
  player = new Player(centerX, centerY, 10, "#23455a");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = score;
  bigScoreEl.innerHTML = score;
}


addEventListener("click", (e) => {
  const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
  const velConstant = 5
  const velocity = { x: Math.cos(angle) * velConstant, y: Math.sin(angle) * velConstant}
  projectiles.push(new Projectile(centerX, centerY, 5, "#219add", velocity))
});

startGameBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  // modalEl.style.display = "none";
  gsap.to('#modal', {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: 'expo.in',
    onComplete: () => {
      modalEl.style.display = "none";
    }
  })
  
})


function spawnEnemies() {
  intervalId = setInterval(() => {
    // console.log(intervalId)
    const radius = Math.random() * (35 - 10) + 10;
    let x;
    let y;
    // Spawn outside canvas
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random()  * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const angle = Math.atan2(centerY - y, centerX - x);
    const velocity = { x: Math.cos(angle)*0.7, y: Math.sin(angle)*0.7}

    enemies.push(new Enemy(x, y, radius, color, velocity));
    // console.log(enemies)
  }, 1000);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  // Background color
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();
  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index];

    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  }
  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index];

    projectile.update();
    // Remove from outside canvas
    if (projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height) {

        projectiles.splice(index, 1)

    }
  };
  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index];
    enemy.update();
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    // Pauses Animation, End Game
    if (dist - enemy.radius - player.radius < 1) {
      bigScoreEl.innerHTML = score
      modalEl.style.display = "grid";
      gsap.fromTo('#modal',{
        scale: 0,
        opacity:0
        },
        {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'expo.out',
        }
      )
      // modalEl.style.display = "grid";
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
    }
    for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
      const projectile = projectiles[projectileIndex];

      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      // Projectiles collision with enemy
      if (dist - enemy.radius - projectile.radius < 1) {

        // Create particles
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Particle(
            projectile.x,
            projectile.y,
            Math.random() * 2,
            enemy.color,
            {x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6)}));
        }
        // Shrink Enemy
        if (enemy.radius - 10 > 10) {
          // Increase Score points
          score += 100;
          scoreEl.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })

          projectiles.splice(projectileIndex, 1)

        } else {
          // Increase Score points for destroying
          score += 250;
          scoreEl.innerHTML = score;
          // Destroy Enemy

          enemies.splice(index, 1);
          projectiles.splice(projectileIndex, 1)
        }
      }
    }
  };
}
