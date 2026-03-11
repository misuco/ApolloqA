export interface WorldObject {
    url: string;
    name: string;
    creator: string;
    x: number;
    y: number;
    z: number;
}

export let worldObjects: WorldObject[] = [];
