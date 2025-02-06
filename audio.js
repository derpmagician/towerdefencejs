/**
 * Sistema de Audio para Tower Defence
 * Utiliza Web Audio API para generar efectos de sonido dinámicamente
 */

let audioContext; // Contexto de Audio (necesario para generar sonidos)
let isSoundEnabled = true; // Estado global del sonido (activado/desactivado)

// Sound effects
const sounds = {
  shoot: null,
  explosion: null,
  levelUp: null,
  gameOver: null,
  hit: null
};

/**
 * Inicializa el contexto de audio y configura todos los efectos de sonido
 * Se debe llamar al inicio del juego o cuando se requiera reiniciar el audio
 */
export function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  /**
   * Sonido de disparo
   * Utiliza un oscilador para generar un tono agudo y corto
   * Frecuencia: 880Hz (La5)
   * Duración: 0.1 segundos
   */
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

  /**
   * Sonido de explosión
   * Genera ruido blanco con una envolvente de amplitud
   * Duración: 0.2 segundos
   * Utiliza un buffer de ruido aleatorio
   */
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

/**
 * Alterna el estado del sonido (activado/desactivado)
 * @param {HTMLElement} soundToggle - Elemento del DOM que contiene el icono de sonido
 */
export function toggleSound(soundToggle) {
  isSoundEnabled = !isSoundEnabled;
  const icon = soundToggle.querySelector('i');
  icon.classList.toggle('fa-volume-up'); // Cambiar ícono a volumen activado
  icon.classList.toggle('fa-volume-mute'); // Cambiar ícono a volumen desactivado


}

export { sounds };