precision mediump float;

uniform vec3 uAtmosphereColor;
uniform vec3 uAtmosphereColor2;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vWorldPos;

void main() {
  float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);

  // Dual color atmosphere
  vec3 color = mix(uAtmosphereColor, uAtmosphereColor2, fresnel);

  // Slight shimmer
  float shimmer = sin(vWorldPos.y * 5.0 + uTime * 0.5) * 0.05 + 1.0;

  float alpha = fresnel * 0.85 * shimmer;

  gl_FragColor = vec4(color * 1.5, alpha);
}
