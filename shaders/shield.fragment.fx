precision highp float;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vPositionW;
varying vec3 vNormalW;

uniform vec3 cameraPosition;
uniform vec3 color;
uniform vec3 source1;
uniform float sourceDist1;

void main(void) {
  float vSourceDist1 = sqrt(dot(source1 - vPosition, source1 - vPosition));
  float delta1 = sourceDist1 - vSourceDist1;
  float rangeTerm1 = 0.;
  if (delta1 > 0.) {
    if (delta1 < 1.) {
        rangeTerm1 = ((sin(delta1*3.*3.14)+1.)/2.)*((sin(delta1*5.*3.14)+1.)/2.)*((sin(delta1*7.*3.14)+1.)/2.) + 0.2;
    }
  }

  vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
  // Fresnel
  float fresnelTerm = dot(viewDirectionW, vNormalW);
  fresnelTerm = clamp(
    fresnelTerm,
    0.,
    1.
  );

  gl_FragColor = vec4(color + rangeTerm1, 1.);
  gl_FragColor.a = rangeTerm1;
}
