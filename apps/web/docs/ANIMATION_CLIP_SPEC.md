# Fighting Animation Clip Spec

Export these clip names in your character GLBs. Names must match exactly.

## Punches

| Clip ID        | Usage              | Notes                          |
|----------------|--------------------|---------------------------------|
| `punch_light`  | Light 1 (jab)      | Quick, low damage, startup 6f  |
| `punch_med`    | Light 2 (cross)   | Medium, chain from light 1      |
| `punch_heavy`  | Light 3 / finisher| Heavy overhead, super armor    |

Fallback: `atk_light_1`, `atk_light_2`, `atk_heavy_finisher`

## Kicks

| Clip ID      | Usage          | Notes                    |
|--------------|----------------|--------------------------|
| `kick_light` | Light kick     | Low, fast                |
| `kick_med`   | Medium kick    | Roundhouse, side kick    |
| `kick_heavy` | Heavy finisher | Tiger-Strand overhead    |

Fallback: `atk_heavy_finisher`

## Lunges

| Clip ID | Usage                    | Notes                 |
|---------|--------------------------|-----------------------|
| `lunge` | Forward thrust / burst   | Committed forward     |
| `burst_step` | 8-frame dash (pounce) | Short distance        |

## Existing (Manifesto)

- `idle`, `walk`, `run`
- `web_launch`, `hit_light`, `hit_heavy`
- `block_idle`, `block_impact`
- `erasure_glitch`

## Authoring

- 60 FPS
- LoopOnce for combat, LoopRepeat for loco
- Match frame data: light 6f startup, heavy 10f startup
