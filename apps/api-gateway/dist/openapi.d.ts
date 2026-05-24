export declare const openApiSpec: {
    readonly openapi: "3.1.0";
    readonly info: {
        readonly title: "AI Reputation Platform API";
        readonly version: "1.0.0";
    };
    readonly paths: {
        readonly "/health": {
            readonly get: {
                readonly summary: "Health check";
                readonly responses: {
                    readonly "200": {
                        readonly description: "Healthy";
                    };
                };
            };
        };
        readonly "/api/v1/auth/login": {
            readonly post: {
                readonly summary: "Login and receive access token";
                readonly responses: {
                    readonly "200": {
                        readonly description: "Token response";
                    };
                };
            };
        };
        readonly "/api/v1/auth/refresh": {
            readonly post: {
                readonly summary: "Rotate refresh token and receive new session tokens";
                readonly responses: {
                    readonly "200": {
                        readonly description: "Rotated token response";
                    };
                };
            };
        };
        readonly "/api/v1/auth/logout": {
            readonly post: {
                readonly summary: "Revoke refresh token session";
                readonly responses: {
                    readonly "204": {
                        readonly description: "Revoked session";
                    };
                };
            };
        };
        readonly "/incrementRating": {
            readonly post: {
                readonly summary: "Legacy endpoint for rating click analytics";
                readonly responses: {
                    readonly "200": {
                        readonly description: "Rating counters updated";
                    };
                };
            };
        };
        readonly "/submitFeedback": {
            readonly post: {
                readonly summary: "Legacy endpoint for feedback submission";
                readonly responses: {
                    readonly "201": {
                        readonly description: "Feedback accepted";
                    };
                };
            };
        };
        readonly "/getFeedback": {
            readonly post: {
                readonly summary: "Legacy endpoint for admin feedback retrieval";
                readonly responses: {
                    readonly "200": {
                        readonly description: "Feedback entries";
                    };
                };
            };
        };
    };
};
