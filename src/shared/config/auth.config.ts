export const authConfig = {
    accessToken: {
        expiresIn: '15m',
    },
    refreshToken: {
        expiresInDays: 7,
        expiresInMs: 7 * 24 * 60 * 60 * 1000,
    }, 

    otp: {
        ttlSeconds: 120,
        maxAttempts: 5,
    }, 
} as const;