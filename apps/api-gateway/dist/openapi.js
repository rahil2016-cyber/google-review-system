export const openApiSpec = {
    openapi: "3.1.0",
    info: {
        title: "AI Reputation Platform API",
        version: "1.0.0",
    },
    paths: {
        "/health": {
            get: {
                summary: "Health check",
                responses: { "200": { description: "Healthy" } },
            },
        },
        "/api/v1/auth/login": {
            post: {
                summary: "Login and receive access token",
                responses: { "200": { description: "Token response" } },
            },
        },
        "/api/v1/auth/refresh": {
            post: {
                summary: "Rotate refresh token and receive new session tokens",
                responses: { "200": { description: "Rotated token response" } },
            },
        },
        "/api/v1/auth/logout": {
            post: {
                summary: "Revoke refresh token session",
                responses: { "204": { description: "Revoked session" } },
            },
        },
        "/incrementRating": {
            post: {
                summary: "Legacy endpoint for rating click analytics",
                responses: { "200": { description: "Rating counters updated" } },
            },
        },
        "/submitFeedback": {
            post: {
                summary: "Legacy endpoint for feedback submission",
                responses: { "201": { description: "Feedback accepted" } },
            },
        },
        "/getFeedback": {
            post: {
                summary: "Legacy endpoint for admin feedback retrieval",
                responses: { "200": { description: "Feedback entries" } },
            },
        },
    },
};
