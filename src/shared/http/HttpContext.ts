export interface HttpFile {
  buffer:       Buffer;
  originalname: string;
  mimetype:     string;
  size:         number;
}

export interface CookieOptions {
  httpOnly?: boolean;
  secure?:   boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  maxAge?:   number;
}

export interface HttpRequest {
  body:    unknown;
  params:  Record<string, string>;
  query:   Record<string, string>;
  cookies: Record<string, string>;
  headers: Record<string, string>;
  file?:   HttpFile;
  user?:   { userId: string; role: number };
}

export interface HttpResponse {
  status(code: number): this;
  json(data: unknown): this;
  cookie(name: string, value: string, options?: CookieOptions): void;
  clearCookie(name: string): void;
  redirect(url: string): void;
}