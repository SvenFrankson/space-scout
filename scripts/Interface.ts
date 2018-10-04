interface IWoundable {
    position: BABYLON.Vector3;
    speed: number;
    localX: BABYLON.Vector3;
    localY: BABYLON.Vector3;
    localZ: BABYLON.Vector3;
    isAlive: boolean;
    wound(projectile: Projectile): void;
}

class IWoundableUtils {

    public static IsIWoundable(o: any): boolean {
        if (o instanceof SpaceShip) {
            return true;
        }
        if (o instanceof Spawner) {
            return true;
        }
        return false;
    }
}