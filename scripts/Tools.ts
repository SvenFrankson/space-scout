class Tools {

    public static RandomSign(): number {
        return (Math.random() > 0.5) ? 1 : -1;
    }

    public static RandomRangeInt(min: number, max: number): number {
        return Math.round(Math.random() * (max - min) + min);
    }
}