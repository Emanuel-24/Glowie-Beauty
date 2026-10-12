export const MAX_DPR = 2
export const NAME = 'MosaicLens'
export const LAYERS = 74
export const GAIN = 0.54
export const TIERS = 4

export const VERT_SRC = `#version 300 es
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }
`

export const FIELD_SRC = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uSize;
uniform float uAngle;
out vec4 o;

const float TAU = 6.28318530718;
const float LAYERS = ${LAYERS.toFixed(1)};
const float GAIN = ${GAIN.toFixed(3)};
const vec2 CENTRE = vec2(-0.25, -0.56);
const float TILT = -2.2;
const float ZOOM = 1.05;
const float THETA = 2.12;
const float SHEAR = 0.956;
const float SHRINK = 0.949;
const vec2 WARP_FREQ = vec2(0.58, 2.8);
const vec2 WARP_AMP = vec2(0.16, 0.034);
const vec2 ASPECT = vec2(1.65, 0.22);
const float OFFSET = 0.31;
const float GLOW = 0.0021;
const float SOFT = 0.0019;
const float FALLOFF = 0.37;
const float PHASE = 64.0;
const float CYCLE = 0.16;
const float HUE_TRAVEL = 2.0;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

void main() {
  vec2 R = uRes;
  vec2 pos = (gl_FragCoord.xy - 0.5 * R) / R.y;

  pos = rot(uAngle) * pos / uSize;
  float t = uTime * 0.49 + PHASE;
  float breath = (-sin(uTime * 0.735) + sin(uTime * 0.49 + 1.0)) * 0.25 + 0.5;
  vec2 u = rot(TILT) * ((pos - CENTRE) * (ZOOM - breath * 0.085));
  mat2 fold = mat2(cos(THETA), sin(THETA), -SHEAR, cos(THETA));

  vec3 col = vec3(0.0);
  for (float i = 1.0; i <= LAYERS; i += 1.0) {
    u.x -= sin(u.y * WARP_FREQ.x + t + i * 0.007) * WARP_AMP.x;
    u.y -= sin(u.x * WARP_FREQ.y - t + i * 0.02) * WARP_AMP.y;
    u = fold * u * SHRINK;
    vec2 q = (u - vec2(OFFSET + breath * 0.1, 0.0)) * ASPECT;
    float g = GLOW / (dot(q, q) + SOFT) * (0.25 + breath * 0.4);
    float r = length(u);
    float k = sin(i * CYCLE + t * 1.2 + r * HUE_TRAVEL) * 0.5 + 0.5;
    col += g * mix(uC1, uC2, k) * (0.62 + 0.5 * k) * exp2(-r * FALLOFF);
  }
  vec3 x = max(col * GAIN, 0.0);
  col = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  col = pow(clamp(col, 0.0, 1.0), vec3(0.85, 0.92, 0.98));
  col *= 1.0 - smoothstep(0.5, 1.6, length(pos)) * 0.07;
  o = vec4(col, 1.0);
}
`

export const FINISH_SRC = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg;
uniform float uPaper;
uniform vec2 uMouse;
uniform float uOn;
uniform float uReach;
uniform float uTile;
out vec4 o;

const float TIERS = ${TIERS.toFixed(1)};

float ign(vec2 p, float f) { p += 5.588238 * mod(f, 64.0); return fract(52.9829189 * fract(0.06711056 * p.x + 0.00583715 * p.y)); }

vec3 scene(vec2 uv) { return texture(uField, clamp(uv, 0.0, 1.0)).rgb; }

vec3 mosaic(vec2 frag, vec2 uv) {
  float base = uTile;
  float tier = 0.0;

  if (uOn > 1e-4) {
    vec2 cc = (floor(frag / base) + 0.5) * base;
    vec2 d = (cc - uMouse) / uReach;
    float w = uOn * exp(-dot(d, d));
    tier = floor(min(w * (TIERS + 1.0), TIERS));
  }
  if (tier >= TIERS) return scene(uv);
  float cell = base / exp2(tier);
  vec2 c = (floor(frag / cell) + 0.5) * cell;
  vec3 s = scene((c + cell * vec2(-0.25, -0.25)) / uRes) + scene((c + cell * vec2(0.25, -0.25)) / uRes)
         + scene((c + cell * vec2(-0.25, 0.25)) / uRes) + scene((c + cell * vec2(0.25, 0.25)) / uRes);
  return s * 0.25;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec3 L = max(mosaic(frag, frag / uRes), 0.0);

  vec3 dark = uBg + L * (1.0 - uBg);
  float strength = clamp(max(L.r, max(L.g, L.b)), 0.0, 1.0);
  vec3 paper = uBg * (1.0 - strength) + L * 0.96;
  vec3 col = mix(dark, paper, uPaper);
  col += (ign(frag, floor(uTime * 24.0)) - 0.5) / 255.0;
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

const colorCache = new Map()

export function parseColor(input) {
  if (!input) return null
  const key = String(input)
  if (colorCache.has(key)) return colorCache.get(key) ?? null
  let s = key.trim()
  const v = s.match(/^var\(\s*--[^,]+,\s*(.+)\)$/)
  if (v) s = v[1].trim()
  let out = null
  if (s.charAt(0) === '#') {
    let h = s.slice(1)
    if (h.length === 3 || h.length === 4) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    if (h.length >= 6) {
      const r = parseInt(h.slice(0, 2), 16)
      const g = parseInt(h.slice(2, 4), 16)
      const b = parseInt(h.slice(4, 6), 16)
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) out = [r / 255, g / 255, b / 255]
    }
  } else {
    const m = s.match(/^(rgba?|hsla?)\(([^)]*)\)/i)
    if (m) {
      const parts = m[2].split(/[\s,/]+/).filter(Boolean)
      const f = (i) => parseFloat(parts[i])
      if (parts.length >= 3 && [0, 1, 2].every((i) => Number.isFinite(f(i)))) {
        if (m[1].toLowerCase().startsWith('rgb')) {
          const ch = (i) => (parts[i].endsWith('%') ? f(i) / 100 : f(i) / 255)
          out = [ch(0), ch(1), ch(2)]
        } else {
          const hh = (((f(0) % 360) + 360) % 360) / 360
          const ss = f(1) / 100
          const ll = f(2) / 100
          const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss
          const p = 2 * ll - q
          const hue = (t) => {
            t = t < 0 ? t + 1 : t > 1 ? t - 1 : t
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
          }
          out = [hue(hh + 1 / 3), hue(hh), hue(hh - 1 / 3)]
        }
        out = out.map((c) => Math.min(1, Math.max(0, c)))
      }
    }
  }
  colorCache.set(key, out)
  return out
}

export function color(input, fallback) {
  return parseColor(input) ?? parseColor(fallback)
}

export function num(v, fb) {
  return typeof v === 'number' && isFinite(v) ? v : fb
}

export function clampN(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v
}

export function link(gl, frag, label) {
  const shader = (type, src) => {
    const sh = gl.createShader(type)
    if (!sh) return null
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(`${NAME} ${label} shader:`, gl.getShaderInfoLog(sh))
      gl.deleteShader(sh)
      return null
    }
    return sh
  }
  const vs = shader(gl.VERTEX_SHADER, VERT_SRC)
  const fs = shader(gl.FRAGMENT_SHADER, frag)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  if (!prog) return null
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(`${NAME} ${label} link:`, gl.getProgramInfoLog(prog))
    gl.deleteProgram(prog)
    return null
  }
  return prog
}

export function locations(gl, prog, names) {
  const o = {}
  for (const n of names) o[n] = gl.getUniformLocation(prog, n)
  return o
}
