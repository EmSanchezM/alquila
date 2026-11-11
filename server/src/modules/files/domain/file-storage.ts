export interface StoredFile {
  body: ReadableStream<Uint8Array>;
  size: number;
  type: string;
}

/** Where uploaded files live. Keys are opaque paths such as `<userId>/<uuid>.png`. */
export interface FileStorage {
  put(key: string, data: Blob, type: string): Promise<void>;
  /** Null when the key does not exist. */
  get(key: string): Promise<StoredFile | null>;
  delete(key: string): Promise<void>;
}
