precision highp float;

varying vec3 vPosition;

uniform sampler2D tex;
uniform float length;
uniform vec3 source1;
uniform float sourceDist1;

void main(void) {
  float vSourceDist1 = sqrt(dot(source1 - vPosition, source1 - vPosition));
  float delta1 = sourceDist1 - vSourceDist1;
  delta1 += 0.2 * (cos(16. * vPosition.x * vPosition.y) + cos(16. * vPosition.y * vPosition.z) + cos(16. * vPosition.z * vPosition.x));
  vec4 color = vec4(0.);
  if (delta1 > 0.) {
    if (delta1 < length) {
        color = texture(tex, vec2(delta1 / length, 0.5));
    }
  }

  gl_FragColor = color;
}
