export interface WorldObject {
    url: string;
    name: string;
    creator: string;
    mesh: string;
    x: number;
    y: number;
    z: number;
    follow: boolean;
    angleX: number;
    angleY: number;
    angleZ: number;
    radiusL: number;
    radiusF: number;
    radiusR: number;
    radiusB: number;
    rotate: number;
}

export let worldObjects: WorldObject[] = [];
