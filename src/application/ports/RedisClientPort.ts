export interface RedisClientPort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  setEx(key: string, ttlSeconds: number, value: string): Promise<void>;
  del(key: string): Promise<void>;
  getDel(key: string): Promise<string | null>;
}