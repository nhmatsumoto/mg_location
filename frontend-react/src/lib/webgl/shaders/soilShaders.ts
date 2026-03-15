/**
 * Soil Stability Shader
 * Visualizes ground integrity based on GeoCentral data.
 */

export const SOIL_STABILITY_VS = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in float a_stability;

uniform mat4 u_viewMatrix;
uniform float u_zoom;

out float v_stability;

void main() {
  v_stability = a_stability;
  gl_Position = u_viewMatrix * vec4(a_position, 0, 1);
  gl_PointSize = 10.0 * u_zoom / 10.0;
}
`;

export const SOIL_STABILITY_FS = `#version 300 es
precision highp float;

in float v_stability;
out vec4 outColor;

void main() {
  // Green to Red gradient based on stability (1.0 = stable, 0.0 = critical)
  vec3 color = mix(vec3(1.0, 0.2, 0.2), vec3(0.2, 1.0, 0.4), v_stability);
  outColor = vec4(color, 0.6);
}
`;
