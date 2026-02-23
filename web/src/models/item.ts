export interface Item {
  id: number;
  name: string;
}

export let items: Item[] = [];


export interface FormFields {
  sessionId: string[];
  nickname: string[];
  uploadId: string[];
}

export interface FormFiles {
  file: Array<{ path: string }>;
}
