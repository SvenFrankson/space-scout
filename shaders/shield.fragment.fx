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
  vec3 color = vec3(0.7, 0.9, 1.);
  vec3 viewDirectionW = normalize(cameraPosition - vPositionW);

  // Fresnel
	float x = dot(viewDirectionW, vNormalW);
    float fresnelTerm = clamp(1. + cos(x * 20.) / 2. - 8. * x * x, 0., 1.);

    float dist = length(vPositionW - source1);
    float impactTerm = clamp(1. - 8. * abs(sourceDist1 - dist) + cos(x * 30.) / 2., 0., 1.);

    fresnelTerm = max(fresnelTerm, impactTerm);


  gl_FragColor = vec4(color, fresnelTerm);
}
