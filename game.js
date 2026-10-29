'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────

const keys = {};
const justPressed = {};

const GAME_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];

window.addEventListener('keydown', e => {
  // Evita que las flechas y la barra espaciadora desplacen la página
  if (GAME_KEYS.includes(e.code)) e.preventDefault();
  // Ignora la autorrepetición para que "recién presionada" sea un solo disparo
  if (!keys[e.code]) justPressed[e.code] = true;
  keys[e.code] = true;
});

window.addEventListener('keyup', e => {
  keys[e.code] = false;
});

// Al perder el foco se sueltan todas las teclas para que la nave no siga girando
window.addEventListener('blur', () => {
  for (const code in keys) keys[code] = false;
});

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Power-up: disparo triple ──────────────────────────────────────────────────
const TRIPLE_SHOT_TIME   = 10;    // segundos que dura el efecto
const TRIPLE_SHOT_SPREAD = 0.22;  // separación angular entre balas (rad)
const POWERUP_TTL = 8;         // segundos que el power-up flota antes de desaparecer
const POWERUP_COLOR = '#4cf';

class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(15, 35);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.ttl    = POWERUP_TTL;
    this.radius = 11;
    this.pulse  = 0;
    this.dead   = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.pulse += dt;
    this.ttl   -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadea durante los últimos 2 segundos
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;

    const r = this.radius + Math.sin(this.pulse * 5) * 1.5;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = POWERUP_COLOR;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // Icono: tres líneas en abanico apuntando hacia arriba
    ctx.beginPath();
    for (const a of [-TRIPLE_SHOT_SPREAD * 2, 0, TRIPLE_SHOT_SPREAD * 2]) {
      const ang = -Math.PI / 2 + a;
      ctx.moveTo(0, 5);
      ctx.lineTo(Math.cos(ang) * 7, 5 + Math.sin(ang) * 11);
    }
    ctx.stroke();
    ctx.restore();
  }
}

// ── Siluetas ──────────────────────────────────────────────────────────────────
// Contornos aproximados en [longitud, latitud], en sentido horario.

// México, desde Tijuana: frontera norte, Golfo, península de Yucatán,
// frontera sur, costa del Pacífico y vuelta por la península de Baja California.
const MEXICO_LONLAT = [
  [-117.12, 32.53], [-114.72, 32.72], [-111.07, 31.33], [-108.21, 31.33],
  [-108.21, 31.78], [-106.53, 31.78], [-104.90, 30.60], [-104.40, 29.55],
  [-103.30, 28.98], [-102.40, 29.80], [-101.40, 29.77], [-100.30, 28.00],
  [-99.50, 27.50], [-99.10, 26.40], [-97.15, 25.95], [-97.60, 24.00],
  [-97.75, 22.30], [-97.20, 20.60], [-96.30, 19.30], [-95.20, 18.70],
  [-94.50, 18.15], [-92.80, 18.50], [-91.50, 18.50], [-90.70, 19.60],
  [-90.40, 21.00], [-89.00, 21.35], [-87.10, 21.55], [-86.80, 20.60],
  [-87.50, 19.50], [-87.80, 18.50], [-88.30, 18.50], [-89.15, 17.80],
  [-90.98, 17.82], [-91.00, 17.25], [-90.40, 16.40], [-91.70, 16.07],
  [-92.20, 15.25], [-92.25, 14.55], [-93.90, 16.00], [-94.80, 16.20],
  [-96.50, 15.65], [-98.50, 16.30], [-100.00, 17.00], [-101.60, 17.70],
  [-103.50, 18.30], [-104.90, 19.30], [-105.70, 20.40], [-105.30, 21.50],
  [-105.80, 22.60], [-106.90, 23.80], [-108.00, 25.00], [-109.40, 26.00],
  [-110.50, 27.30], [-111.60, 28.50], [-112.80, 30.00], [-113.10, 31.20],
  [-114.80, 31.80], [-114.50, 30.50], [-113.20, 28.80], [-112.20, 27.50],
  [-111.30, 26.00], [-110.50, 24.20], [-109.40, 23.20], [-110.00, 22.90],
  [-111.00, 24.30], [-112.10, 24.80], [-112.20, 26.00], [-114.10, 27.70],
  [-114.30, 28.80], [-115.70, 30.30], [-116.60, 31.70],
];

// Chihuahua, desde la esquina noroeste (frontera con Nuevo México).
const CHIHUAHUA_LONLAT = [
  [-108.21, 31.78], [-106.53, 31.78], [-106.20, 31.45], [-105.60, 31.00],
  [-105.00, 30.65], [-104.65, 30.15], [-104.40, 29.55], [-103.95, 29.30],
  [-103.60, 29.17], [-103.30, 28.80], [-103.40, 28.10], [-103.80, 27.40],
  [-104.30, 26.95], [-105.00, 26.65], [-105.70, 26.55], [-106.30, 26.20],
  [-106.90, 25.80], [-107.30, 25.60], [-107.90, 26.00], [-108.50, 26.40],
  [-108.95, 26.90], [-109.05, 27.50], [-108.70, 28.30], [-108.50, 29.20],
  [-108.60, 30.00], [-108.40, 30.60], [-108.21, 31.33],
];

// Yucatán, desde Celestún: costa norte, frontera con Quintana Roo
// y frontera con Campeche.
const YUCATAN_LONLAT = [
  [-90.35, 21.05], [-89.70, 21.30], [-89.00, 21.38], [-88.20, 21.60],
  [-87.53, 21.55], [-87.53, 21.45], [-87.60, 20.90], [-88.00, 20.50],
  [-88.20, 19.95], [-89.10, 19.55], [-89.60, 20.00], [-90.00, 20.30],
  [-90.35, 20.50], [-90.45, 20.85],
];

// Proyecta a plano (x escalada por cos(lat), y invertida), centra en el
// centroide y normaliza para que el vértice más lejano quede a distancia 1.
function makeShape(lonlat, refLat) {
  const k = Math.cos(refLat * Math.PI / 180);
  const pts = lonlat.map(([lon, lat]) => [lon * k, -lat]);
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const centered = pts.map(([x, y]) => [x - cx, y - cy]);
  const maxR = Math.max(...centered.map(([x, y]) => Math.hypot(x, y)));
  return centered.map(([x, y]) => [x / maxR, y / maxR]);
}

// Silueta por tamaño: 1 = Yucatán, 2 = Chihuahua, 3 = México (índice 0 sin uso)
const SHAPES = [
  null,
  makeShape(YUCATAN_LONLAT, 20.7),
  makeShape(CHIHUAHUA_LONLAT, 29),
  makeShape(MEXICO_LONLAT, 23),
];

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;
    this.color = `hsl(${randInt(0, 359)}, 55%, 40%)`;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Cada tamaño tiene su silueta geográfica
    this.verts = SHAPES[size].map(([vx, vy]) => [vx * this.radius, vy * this.radius]);
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    const frags = [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
    frags.forEach(f => f.color = this.color);
    return frags;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle   = this.color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() {
    this.tripleShot = 0;  // segundos restantes de disparo triple; sobrevive a cambios de nivel
    this.reset();
  }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.tripleShot    > 0) this.tripleShot    -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    if (this.tripleShot <= 0) return [new Bullet(ox, oy, this.angle)];
    return [-TRIPLE_SHOT_SPREAD, 0, TRIPLE_SHOT_SPREAD]
      .map(off => new Bullet(ox, oy, this.angle + off));
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Silueta clásica: triángulo con muesca trasera
    ctx.beginPath();
    ctx.moveTo( 20,  0);   // nariz
    ctx.lineTo(-12, -9);   // ala izquierda
    ctx.lineTo( -7,  0);   // muesca trasera
    ctx.lineTo(-12,  9);   // ala derecha
    ctx.closePath();
    ctx.stroke();

    // Llama del propulsor
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = 'rgba(255, 130, 0, 0.85)';
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let levelKills;     // asteroides destruidos en el nivel actual
let powerupDropAt;  // destrucción que suelta el power-up del nivel (Infinity = ya soltado)
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

// Elige al azar qué destrucción del nivel suelta el power-up (uno por nivel).
// Cada asteroide grande da 7 destrucciones (1 grande + 2 medianos + 4 pequeños).
// Se limita al primer 70 % para que no salga con el último asteroide.
function planPowerupDrop(count) {
  levelKills    = 0;
  powerupDropAt = Math.floor(rand(1, count * 7 * 0.7));
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  spawnAsteroids(4);
  planPowerupDrop(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  ship.reset();
  spawnAsteroids(3 + level);
  planPowerupDrop(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  ship.tripleShot = 0;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    powerups.forEach(p => p.update(dt));
    powerups = powerups.filter(p => !p.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups  = powerups.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += POINTS[a.size];
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
        if (++levelKills >= powerupDropAt) {
          powerups.push(new PowerUp(a.x, a.y));
          powerupDropAt = Infinity;
        }
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs power-up (se puede recoger aun siendo invencible)
  for (const p of powerups) {
    if (dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      ship.tripleShot = TRIPLE_SHOT_TIME;
      explode(p.x, p.y, 6);
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Nivel completado
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo( 9,  0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3,  0);
  ctx.lineTo(-6,  5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  if (ship.tripleShot > 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = POWERUP_COLOR;
    ctx.fillText(`TRIPLE  ${Math.ceil(ship.tripleShot)}s`, 14, 48);
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  powerups.forEach(p => p.draw());
  bullets.forEach(b => b.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
