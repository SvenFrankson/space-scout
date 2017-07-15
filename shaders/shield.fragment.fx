precision highp float;

varying vec3 vPosition;

uniform sampler2D tex;
uniform float length;
uniform vec3 source1;
uniform float sourceDist1;

void main(void) {
  float vSourceDist1 = sqrt(dot(source1 - vPosition, source1 - vPosition));
  float delta1 = sourceDist1 - vSourceDist1;
  vec4 color = vec4(0.);
  if (delta1 > 0.) {
    if (delta1 < length) {
        color = texture2D(tex, vec2(delta1 / length, 0.5));
    }
  }

  gl_FragColor = color;
}
