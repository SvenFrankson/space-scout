class Config {
  public static tmpPlayerSpeed: number;
  public static activationSqrRange: number;
  public static sceneLoaderDelay: number;

  public static ProdConfig(): void {
    Config.tmpPlayerSpeed = 10;
    Config.activationSqrRange = 100;
    Config.sceneLoaderDelay = 10;
  }

  public static DevConfig(): void {
    Config.tmpPlayerSpeed = 20;
    Config.activationSqrRange = 100;
    Config.sceneLoaderDelay = 0;
  }
}

Config.DevConfig();
