interface ILevel {
  LoadLevel: (scene: BABYLON.Scene) => void;
  OnGameStart: () => void;
  UnLoadLevel: () => void;
}
