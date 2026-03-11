import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../security/AuthenticatedRequest';
import { HttpRequest, HttpResponse, CookieOptions } from '../../shared/http/HttpContext';

export function toHttpRequest(req: Request): HttpRequest {
  const authReq = req as AuthenticatedRequest;
  return {
    body:    req.body,
    params:  req.params  as Record<string, string>,
    query:   req.query   as Record<string, string>,
    cookies: req.cookies ?? {},
    headers: req.headers as Record<string, string>,
    file: req.file ? {
      buffer:       req.file.buffer,
      originalname: req.file.originalname,
      mimetype:     req.file.mimetype,
      size:         req.file.size,
    } : undefined,
    user: authReq.user ? {
      userId: authReq.user.userId,
      role:   authReq.user.role,
    } : undefined,
  };
}

export function toHttpResponse(res: Response): HttpResponse {
  const httpRes: HttpResponse = {
    status(code: number) {
      res.status(code);
      return this;
    },
    json(data: unknown) {
      res.json(data);
      return this;
    },
    cookie(name: string, value: string, options?: CookieOptions) {
      res.cookie(name, value, options ?? {});
    },
    clearCookie(name: string) {
      res.clearCookie(name);
    },
    redirect(url: string) {
      res.redirect(url);
    },
  };
  return httpRes;
}