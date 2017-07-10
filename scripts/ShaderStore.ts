class SpaceShaderStore {
  public static RegisterSpaceShaderToShaderStore(): void {
    BABYLON.Effect.ShadersStore["TrailVertexShader"] = `
      precision highp float;

      // Attributes
      attribute vec3 position;
      attribute vec3 normal;

      // Uniforms
      uniform mat4 worldViewProjection;

      // Varying
      varying vec2 vNormalS;

      void main(void) {
        vec4 outPosition = worldViewProjection * vec4(position, 1.0);
        gl_Position = outPosition;

        vec4 clipSpacePos = worldViewProjection * vec4(position + normal, 1.0);
        vNormalS = normalize(clipSpacePos.xy - outPosition.xy);
      }
    `;

    BABYLON.Effect.ShadersStore["TrailFragmentShader"] = `
      precision highp float;

      varying vec2 vNormalS;

      void main(void) {
        gl_FragColor = vec4(vec3(1), max(0., vNormalS.y) * max(0., vNormalS.y));
      }
    `;
  }
}
