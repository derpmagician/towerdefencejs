# Tower Defence Game

Un juego de defensa de torre interactivo y divertido construido con HTML5 Canvas y JavaScript. ¡Defiende tu torre disparando proyectiles contra los enemigos que se acercan!

## Características

- Jugabilidad fluida con HTML5 Canvas
- Mecánicas de disparo interactivas
- Sistema de puntuación y récord
- Sistema de niveles progresivos
- Efectos de partículas para explosiones
- Efectos de sonido usando Web Audio API
- Enemigos especiales con mayor dificultad
- Barra de salud del jugador
- Diseño responsivo que se adapta al tamaño de la pantalla
- Interfaz moderna con modal de inicio y fin de juego
- Sistema de guardado de récord local

## Cómo Jugar

1. Haz clic en el botón "Start Game" para comenzar
2. Haz clic en cualquier parte de la pantalla para disparar proyectiles
3. Apunta y destruye a los enemigos que se acercan
4. Los enemigos rojos son especiales y valen más puntos
5. Sobrevive el mayor tiempo posible y consigue la puntuación más alta
6. Cuida tu barra de salud, si llega a cero el juego termina
7. El juego se hace más difícil a medida que subes de nivel

## Controles

- Clic izquierdo: Dispara proyectil hacia la posición del mouse
- El jugador (círculo central) permanece estacionario
- Los enemigos se acercan desde todas las direcciones
- ESC: Pausa el juego
- M: Activar/Desactivar sonido

## Niveles y Puntuación

- Cada nivel aumenta la velocidad y frecuencia de los enemigos
- Los enemigos especiales (rojos) dan el doble de puntos
- La puntuación más alta se guarda localmente
- Sube de nivel cada 1000 puntos

## Tecnologías Utilizadas

### Web Audio API

El juego utiliza la Web Audio API para crear efectos de sonido dinámicos. Implementamos los siguientes efectos:

1. **Disparo**
   - Utiliza un oscilador (OscillatorNode) a 880Hz
   - Duración corta (0.1s)
   - Envolvente de amplitud para evitar clics

2. **Explosión**
   - Genera ruido blanco usando AudioBuffer
   - Duración media (0.2s)
   - Fade out suave para un efecto natural

3. **Subida de Nivel**
   - Oscilador con frecuencia ascendente (440Hz a 880Hz)
   - Duración media (0.3s)
   - Efecto de barrido de frecuencia

4. **Game Over**
   - Oscilador con frecuencia descendente (880Hz a 110Hz)
   - Duración larga (0.5s)
   - Efecto dramático de caída

5. **Daño**
   - Oscilador a 220Hz
   - Duración corta (0.1s)
   - Sonido de alerta distintivo

Implementación:
```javascript
// Creación del contexto de audio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Ejemplo de efecto de sonido (disparo)
function createShootSound() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.frequency.setValueAtTime(880, audioContext.currentTime);
  gain.gain.setValueAtTime(0.1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.1);
}
```

### Otras Tecnologías

- HTML5 Canvas para renderizado
- JavaScript (ES6+) para la lógica del juego
- GSAP para animaciones
- SCSS/CSS para estilos
- LocalStorage para guardar récords
- Font Awesome para iconos

## Desarrollo

Para ejecutar el juego localmente:

1. Clona este repositorio
2. Abre `index.html` en tu navegador web
3. ¡Empieza a jugar!

## Próximas Mejoras

- Más tipos de enemigos
- Power-ups y mejoras
- Diferentes tipos de proyectiles
- Modo multijugador
- Tabla de clasificación online

## Instalación

1. Clona el repositorio
2. Abre index.html en tu navegador
3. ¡Disfruta del juego!

## Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu función (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.
