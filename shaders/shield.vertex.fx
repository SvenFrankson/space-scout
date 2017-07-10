precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 world;
uniform mat4 worldViewProjection;

// Varying
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vPositionW;
varying vec3 vNormalW;

void main(void) {
  gl_Position = worldViewProjection * vec4(position, 1.0);
  vPosition = position;
  vUv = uv;
  vPositionW = vec3(world * vec4(position, 1.0));
  vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
}
