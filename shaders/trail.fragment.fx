precision highp float;

varying vec3 vPositionW;
varying vec3 vNormalW;

uniform vec3 diffuseColor;
uniform float alpha;
uniform float fresnelPower;
uniform float fresnelBias;
uniform float specularPower;
uniform vec3 cameraPosition;
uniform sampler2D textureSampler;

void main(void) {
  vec3 viewDirectionW = normalize(cameraPosition - vPositionW);

  // Fresnel
  float fresnelTerm = dot(viewDirectionW, vNormalW);
  fresnelTerm = clamp(
    fresnelTerm,
    0.,
    1.
  );

  vec3 col1 = vec3(0.8, 1., 0.8);
  vec3 col2 = vec3(0.5, 0.5, 1.);

  gl_FragColor = vec4(fresnelTerm * col1 + (1. - fresnelTerm) * col2, 0.5);
}
