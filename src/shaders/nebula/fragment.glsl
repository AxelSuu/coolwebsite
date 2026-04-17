precision mediump float;

uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uNoiseScale;

varying vec2 vUv;
varying vec3 vWorldPos;

// Cheap value noise — no simplex needed
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  v += 0.5 * noise(p); p *= 2.0;
  v += 0.25 * noise(p); p *= 2.0;
  v += 0.125 * noise(p);
  return v;
}

void main() {
  vec3 p = vWorldPos * uNoiseScale;

  float density = fbm(p + uTime * 0.02);
  density = smoothstep(0.15, 0.6, density);

  float colorNoise = noise(p * 0.5 + vec3(100.0));

  vec3 color = mix(uColor1, uColor2, colorNoise);
  color = mix(color, uColor3, density * 0.5);

  float edgeFade = 1.0 - smoothstep(0.3, 0.5, length(vUv - 0.5));
  float alpha = density * edgeFade * uOpacity;

  color += vec3(0.08, 0.04, 0.12) * density;
  gl_FragColor = vec4(color, alpha);
}
