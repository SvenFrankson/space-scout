precision highp float;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vPositionW;
varying vec3 vNormalW;

uniform vec3 cameraPosition;
uniform sampler2D textureSampler;
uniform vec3 source1;
uniform float sqrSourceDist1;

void main(void) {
  float vSqrSourceDist1 = dot(source1 - vPosition, source1 - vPosition);
  float delta1 = sqrSourceDist1 - vSqrSourceDist1;
  float rangeTerm1 = 0.;
  if (delta1 > 0.) {
    rangeTerm1 = 1. / (delta1 + 1.) * 2.;
  }

  vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
  // Fresnel
  float fresnelTerm = dot(viewDirectionW, vNormalW);
  fresnelTerm = clamp(
    fresnelTerm,
    0.,
    1.
  );

  gl_FragColor = vec4(0.5, 0.5, 1., 1.) + vec4(vec3(fresnelTerm), 1.);
  gl_FragColor.a = rangeTerm1 * (1. + fresnelTerm);
}
