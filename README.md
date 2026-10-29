# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Demo:

[Asteroids demo](https://klerith.github.io/claude-asteroids/)

## Descripción del juego

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups especiales y tipos de asteroides únicos como la estrella fugaz...

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |
| `B`       | Detonar bomba (si la tienes) |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up de **disparo triple**: una vez por nivel, un asteroide destruido al azar suelta un ícono azul; al recogerlo la nave dispara 3 balas en abanico durante 10 segundos
- Power-up de **escudo**: también aparece una vez por nivel (ícono verde); rodea la nave con un círculo de energía que absorbe un impacto de asteroide durante 10 segundos
- Power-up de **cámara lenta**: también aparece una vez por nivel (ícono morado); los asteroides se mueven a la mitad de velocidad durante 6 segundos mientras la nave mantiene su velocidad normal
- Power-up de **hiperpropulsión**: también aparece una vez por nivel (ícono amarillo); aumenta drásticamente la aceleración, la velocidad máxima y el giro de la nave durante 8 segundos para esquivar con precisión
- **Bomba** (ítem escaso, una sola por partida, ícono naranja): un asteroide destruido puede soltarla; se guarda al recogerla y al pulsar `B` destruye todos los asteroides en pantalla. Un solo uso
