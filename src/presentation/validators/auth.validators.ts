import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

const passwordComplexityRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

export const signupSchema = z.object({
  email: z.string().min(1, 'Email is required'),

  otp: z
    .string()
    .length(6,   'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),

  password: z
    .string()
    .regex(
      passwordComplexityRegex,
      'Password must contain uppercase, lowercase, number, and special character',
    ),

  firstName: z.string().optional(),
  lastName:  z.string().optional(),
});

export const requestOtpSchema = z.object({
  email:   z.string().min(1, 'Email is required'),
  purpose: z.enum(['signup', 'forgot-password']).optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  otp: z
    .string()
    .length(6,   'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const resetPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required'),

  password: z
    .string()
    .regex(
      passwordComplexityRegex,
      'Password must contain uppercase, lowercase, number, and special character',
    ),
});