import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./env.js";
import { attachTenant } from "./middleware/tenant.js";
import { openApiSpec } from "./openapi.js";
import { authRouter } from "./routes/auth.js";
import { customersRouter } from "./routes/customers.js";
import { healthRouter } from "./routes/health.js";
import { legacyRouter } from "./routes/legacy.js";
import { repliesRouter } from "./routes/replies.js";
import { restaurantsRouter } from "./routes/restaurants.js";
import { reviewsRouter } from "./routes/reviews.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));
app.use(attachTenant);

app.use("/health", healthRouter);
app.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});
app.use("/", legacyRouter);
app.use(`${env.API_PREFIX}/auth`, authRouter);
app.use(`${env.API_PREFIX}/reviews`, reviewsRouter);
app.use(`${env.API_PREFIX}/customers`, customersRouter);
app.use(`${env.API_PREFIX}/replies`, repliesRouter);
app.use(`${env.API_PREFIX}/restaurants`, restaurantsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "Route not found" });
});

app.listen(env.PORT, () => {
  console.log(`API Gateway listening on port ${env.PORT}`);
});
