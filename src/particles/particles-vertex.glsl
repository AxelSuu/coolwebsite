precision mediump float;

uniform sampler2D uPositions;
uniform float uPixelRatio;
uniform float uSize;

attribute vec2 aReference;
attribute float aRandom;

varying float vAlpha;
varying vec3 vColor;

void main() {
  vec3 pos = texture2D(uPositions, aReference).xyz;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float size = uSize * uPixelRatio / -mvPosition.z;
  gl_PointSize = max(size, 0.5);

  // Depth-based alpha
  float depth = -mvPosition.z;
  vAlpha = smoothstep(600.0, 10.0, depth) * smoothstep(0.5, 3.0, depth);

  // Simple 3-way color
  vec3 c1 = vec3(0.8, 0.9, 1.0);
  vec3 c2 = vec3(1.0, 0.85, 0.6);
  vec3 c3 = vec3(0.6, 0.8, 1.0);
  vColor = aRandom < 0.33 ? mix(c1, c2, aRandom * 3.0) :
           aRandom < 0.66 ? mix(c2, c3, (aRandom - 0.33) * 3.0) :
                            mix(c3, c1, (aRandom - 0.66) * 3.0);
}
