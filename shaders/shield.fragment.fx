precision highp float;

varying vec3 vPosition;
varying vec3 vPositionW;
varying vec3 vNormalW;

uniform sampler2D tex;
uniform vec4 color;
uniform float length;
uniform vec3 source1;
uniform float sourceDist1;
uniform float noiseAmplitude;
uniform float noiseFrequency;
uniform float fresnelBias;
uniform float fresnelPower;
uniform vec3 cameraPosition;
uniform float fadingDistance;

void main(void) {
  float vSourceDist1 = sqrt(dot(source1 - vPosition, source1 - vPosition));
  float delta1 = sourceDist1 - vSourceDist1;
  delta1 += noiseAmplitude * (cos(noiseFrequency * vPosition.x) + cos(noiseFrequency * vPosition.y) + cos(noiseFrequency * vPosition.z));
  vec4 value = vec4(0.);
  if (delta1 > 0.) {
    if (delta1 < length) {
        value = texture(tex, vec2(delta1 / length, 0.5));
    }
  }
  if (fadingDistance > 0.) {
    value.a *= 1. - vSourceDist1 / fadingDistance;
  }

  // View
  vec3 vViewDirectionW = normalize(cameraPosition - vPositionW);

  // Fresnel
  float vFresnelTerm = dot(vViewDirectionW, vNormalW);
  vFresnelTerm = clamp(
    pow(
      (cos(pow(vFresnelTerm, fresnelBias)*3.1415)+1.)/2.,
      fresnelPower
    ),
    0.,
    1.
  );

  gl_FragColor = value * color + vec4(vec3(vFresnelTerm), 0.);
}
