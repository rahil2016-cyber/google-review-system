export declare function ensureUserForLogin(input: {
    tenantId: string;
    email: string;
}): Promise<{
    userId: string;
    role: string;
}>;
export declare function issueSessionTokens(input: {
    userId: string;
    tenantId: string;
    subject: string;
    role: string;
}): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: string;
}>;
export declare function rotateRefreshToken(refreshToken: string): Promise<{
    tokenType: "Bearer";
    expiresIn: string;
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: string;
} | null>;
export declare function revokeRefreshToken(refreshToken: string): Promise<void>;
