precision highp float;

varying vec3 vPositionW;
varying vec3 vNormalW;

uniform vec4 diffuseColor1;
uniform vec4 diffuseColor2;
uniform float alpha;
uniform vec3 cameraPosition;

void main(void) {
  vec3 viewDirectionW = normalize(cameraPosition - vPositionW);

  // Fresnel
  float fresnelTerm = dot(viewDirectionW, vNormalW);
  fresnelTerm = clamp(
    fresnelTerm,
    0.,
    1.
  );

  gl_FragColor = vec4(fresnelTerm * diffuseColor1 + (1. - fresnelTerm) * diffuseColor2);
  gl_FragColor.a = gl_FragColor.a * alpha;
}
