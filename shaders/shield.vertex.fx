precision highp float;

// Attributes
attribute vec3 position;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;

// Varying
varying vec3 vPosition;
varying vec2 vUv;

void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vPosition = position;
    vUv = uv;
}
