precision mediump float;

uniform sampler2D uCurrentPositions;
uniform sampler2D uCurrentVelocities;
uniform sampler2D uTargetPositions;
uniform float uTime;
uniform float uDelta;
uniform float uMorphProgress;
uniform float uExplosionForce;
uniform vec2 uMouse;

// Cheap hash-based noise (no curl noise — much faster)
vec3 hash3f(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453123) * 2.0 - 1.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 posData = texture2D(uCurrentPositions, uv);
  vec3 pos = posData.xyz;
  float life = posData.w;

  // Read velocity (stored in the velocity channel of posData.w area — simplified: derive from position diff)
  vec3 vel = vec3(0.0);

  // Target attraction
  vec3 target = texture2D(uTargetPositions, uv).xyz;
  vec3 toTarget = target - pos;
  float distToTarget = length(toTarget);

  // Morph force
  vec3 morphForce = toTarget * uMorphProgress * 0.08;

  // Simple turbulence (cheap hash noise, no FBM)
  float turbulenceStrength = mix(1.0, 0.02, uMorphProgress);
  vec3 turbulence = hash3f(floor(pos * 0.1 + uTime * 0.5)) * turbulenceStrength;

  // Explosion force
  vec3 explosionDir = normalize(pos + vec3(0.001));
  vec3 explosion = explosionDir * uExplosionForce;

  // Apply forces
  vec3 force = morphForce + turbulence * 0.3 + explosion * uDelta;
  pos += force * uDelta * 30.0;

  // Damping toward target when morphing
  pos = mix(pos, pos + toTarget * 0.001, uMorphProgress);

  gl_FragColor = vec4(pos, life);
}
