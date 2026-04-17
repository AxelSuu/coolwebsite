precision mediump float;

uniform float uTime;
uniform float uInnerRadius;
uniform float uOuterRadius;
uniform vec3 uCenter;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormal;

// Cheap noise — no FBM needed here
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec3 toCenter = vWorldPos - uCenter;
  float dist = length(toCenter.xz);
  float normalizedDist = (dist - uInnerRadius) / (uOuterRadius - uInnerRadius);

  float angle = atan(toCenter.z, toCenter.x);

  // Swirl
  float swirlSpeed = mix(3.0, 0.5, normalizedDist);
  float swirl = angle + uTime * swirlSpeed;

  // Simple noise density
  float density = noise(vec2(swirl * 2.0, normalizedDist * 8.0 + uTime * 0.3));
  density += noise(vec2(swirl * 5.0, normalizedDist * 15.0)) * 0.4;
  density = pow(density, 1.3);

  // Temperature gradient
  vec3 hotWhite = vec3(1.0, 0.95, 0.9);
  vec3 orange = vec3(1.0, 0.5, 0.1);
  vec3 deepRed = vec3(0.5, 0.05, 0.02);

  vec3 color;
  if (normalizedDist < 0.3) {
    color = mix(hotWhite, orange, normalizedDist / 0.3);
  } else {
    color = mix(orange, deepRed, (normalizedDist - 0.3) / 0.7);
  }

  float emissive = mix(2.5, 0.5, normalizedDist);
  color *= emissive * density;

  float alpha = smoothstep(0.0, 0.05, normalizedDist) * smoothstep(1.0, 0.85, normalizedDist);
  alpha *= density * 0.85;

  gl_FragColor = vec4(color, alpha);
}
