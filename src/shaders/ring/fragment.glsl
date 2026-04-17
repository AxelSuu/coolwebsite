precision mediump float;

uniform float uInnerRadius;
uniform float uOuterRadius;
uniform vec3 uPlanetPos;
uniform float uPlanetRadius;
uniform float uTime;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormal;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float dist = length(vWorldPos.xz - uPlanetPos.xz);
  float normalizedDist = (dist - uInnerRadius) / (uOuterRadius - uInnerRadius);

  // Ring gaps
  float gap1 = 1.0 - smoothstep(0.28, 0.30, normalizedDist) * (1.0 - smoothstep(0.32, 0.34, normalizedDist));
  float gap2 = 1.0 - smoothstep(0.55, 0.56, normalizedDist) * (1.0 - smoothstep(0.58, 0.59, normalizedDist));
  float gapMask = gap1 * gap2;

  vec3 innerColor = vec3(0.9, 0.8, 0.6);
  vec3 outerColor = vec3(0.4, 0.35, 0.5);
  vec3 color = mix(innerColor, outerColor, normalizedDist);

  // Cheap noise variation
  float angle = atan(vWorldPos.z - uPlanetPos.z, vWorldPos.x - uPlanetPos.x);
  color += (hash(vec2(normalizedDist * 20.0, angle * 3.0)) - 0.5) * 0.1;

  // Planet shadow
  vec3 toLight = normalize(vec3(1.0, 0.5, 0.5));
  vec3 toPoint = vWorldPos - uPlanetPos;
  float shadowDot = dot(normalize(toPoint.xz), toLight.xz);
  float shadow = smoothstep(-0.3, 0.1, shadowDot);

  float alpha = smoothstep(0.0, 0.05, normalizedDist) * smoothstep(1.0, 0.95, normalizedDist);
  alpha *= gapMask * shadow * 0.7;

  gl_FragColor = vec4(color, alpha);
}
