precision highp float;

varying vec3 vPosition;
varying vec2 vUv;
uniform sampler2D textureSampler;

uniform vec3 source1;
uniform float sqrSourceDist1;

void main(void) {
  float vSqrSourceDist1 = dot(source1 - vPosition, source1 - vPosition);
  float delta1 = sqrSourceDist1 - vSqrSourceDist1;
  float rangeTerm1 = 0.;
  if (delta1 > 0.) {
    rangeTerm1 = 1. / ((delta1 * delta1) / 2. + 1.);
  }

  gl_FragColor = texture2D(textureSampler, vUv) + vec4(vec3(rangeTerm1), 1);
  gl_FragColor.a = rangeTerm1;
}