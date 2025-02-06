// classes.js

/**
 * Clase base para objetos del juego
 * Proporciona funcionalidad común para todos los objetos que se mueven en el canvas
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
    draw(ctx) {
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
        return true; // Indicate game over
      }
      return false;
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
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    // Update projectile position
    update(ctx) {
      this.draw(ctx);
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
    draw(ctx) {
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
    update(ctx) {
      this.draw(ctx);
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
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
    // Update particle position and opacity
    update(ctx) {
      this.draw(ctx);
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

  export { Player, Projectile, Enemy, Particle };