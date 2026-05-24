import "dotenv/config";
export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    API_PREFIX: string;
    JWT_SECRET: string;
    CORS_ORIGIN: string;
    ACCESS_TOKEN_TTL: string;
    REFRESH_TOKEN_DAYS: number;
    DEFAULT_TENANT_SLUG: string;
    DEFAULT_TENANT_NAME: string;
};
