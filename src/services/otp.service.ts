import crypto from "crypto";
import nodemailer from "nodemailer";
import { redisClient } from "../infrastructure/redis/redis.client";

/* -----------------------------
   Types
----------------------------- */

type OtpPurpose = "signup" | "forgot-password";

interface CachedOtp {
  hash: string;
  attempts: number;
}

/* -----------------------------
   Constants
----------------------------- */

const OTP_TTL_SECONDS = 120;
const MAX_ATTEMPTS = 5;

/* -----------------------------
   Service
----------------------------- */

export class OTPService {
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private hashOtp(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex");
  }

  private key(email: string, purpose: OtpPurpose): string {
    return `otp:${purpose}:${email.toLowerCase()}`;
  }

  async sendOtp(email: string, purpose: OtpPurpose): Promise<Date> {
    const otp = this.generateOtp();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.DEEP_LEARN_EMAIL,
        pass: process.env.DEEP_LEARN_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.DEEP_LEARN_EMAIL,
      to: email,
      subject: "Your OTP Code",
      html: `
        <p>Your OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP expires in 2 minutes.</p>
      `,
    });

    await redisClient.set(
      this.key(email, purpose),
      JSON.stringify({
        hash: this.hashOtp(otp),
        attempts: 0,
      }),
      { EX: OTP_TTL_SECONDS }
    );

    return new Date(Date.now() + OTP_TTL_SECONDS * 1000);
  }

  async verifyOtp(
    email: string,
    purpose: OtpPurpose,
    inputOtp: string
  ): Promise<void> {
    const redisKey = this.key(email, purpose);

    const raw = await redisClient.get(redisKey);
    if (!raw) {
      throw new Error("OTP expired or invalid");
    }

    const cached: CachedOtp = JSON.parse(raw);

    if (cached.attempts >= MAX_ATTEMPTS) {
      await redisClient.del(redisKey);
      throw new Error("Too many invalid attempts");
    }

    if (this.hashOtp(inputOtp) !== cached.hash) {
      cached.attempts += 1;

      await redisClient.set(
        redisKey,
        JSON.stringify(cached),
        { EX: OTP_TTL_SECONDS }
      );

      throw new Error("Invalid OTP");
    }

    await redisClient.del(redisKey);
  }
}
