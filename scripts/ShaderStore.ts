class SpaceShaderStore {
  public static RegisterSpaceShaderToShaderStore(): void {
    BABYLON.Effect.ShadersStore["TrailVertexShader"] = `
      precision highp float;

      // Attributes
      attribute vec3 position;
      attribute vec3 normal;

      // Uniforms
      uniform mat4 world;
      uniform mat4 worldViewProjection;

      // Varying
      varying vec3 vPositionW;
      varying vec3 vNormalW;

      void main(void) {
        vec4 outPosition = worldViewProjection * vec4(position, 1.0);
        gl_Position = outPosition;

        vPositionW = vec3(world * vec4(position, 1.0));
        vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
      }
    `;

    BABYLON.Effect.ShadersStore["TrailFragmentShader"] = `
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
          pow(
            (cos(pow(fresnelTerm, 2.)*3.1415)+1.)/2.,
            8.
          ),
          0.,
          1.
        );

        gl_FragColor = vec4(vec3(1), fresnelTerm);
      }
    `;
  }
}
