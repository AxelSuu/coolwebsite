precision highp float;

uniform sampler2D uCurrentVelocities;
uniform float uDelta;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 velData = texture2D(uCurrentVelocities, uv);

  // Velocity is mostly managed in the position shader
  // This pass just preserves velocity state
  gl_FragColor = velData;
}
