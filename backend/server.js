require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const yaml = require("js-yaml");
const swaggerUi = require("swagger-ui-express");
const loginRouter = require("./routes/login");
const businessRouter = require("./routes/business");
const insightsRouter = require("./routes/insights");
const reviewsRouter = require("./routes/reviews");

const app = express();
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      callback(null, requestOrigin || true);
    },
    credentials: false,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      message: "Made with love by Manya Shukla",
      year: 2026,
      contact: "8005586588",
    },
  });
});

app.get("/health", (req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;
  const payload = {
    success: mongoOk,
    data: {
      ok: mongoOk,
      api: "running",
      mongodb: mongoOk ? "connected" : "disconnected",
    },
  };
  res.status(mongoOk ? 200 : 503).json(payload);
});

const openApiPath = path.join(__dirname, "openapi.yaml");
const openApiSpec = yaml.load(fs.readFileSync(openApiPath, "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: "Business Insights API" }));
app.get("/openapi.yaml", (req, res) => {
  res.type("application/yaml").sendFile(openApiPath);
});

app.use(loginRouter);
app.use(businessRouter);
app.use(insightsRouter);
app.use(reviewsRouter);

const port = Number(process.env.PORT) || 4000;
const uri = process.env.MONGODB_URI;
const secret = process.env.JWT_SECRET;

if (!uri || !secret) {
  console.error("Missing MONGODB_URI or JWT_SECRET");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => {
    const dbName = mongoose.connection.db?.databaseName ?? "?";
    console.log(`[Business Insights API] MongoDB connected (database: ${dbName})`);
    app.listen(port, "0.0.0.0", () => {
      console.log(`[Business Insights API] HTTP server listening on port ${port}`);
      console.log(`[Business Insights API]   Local:  http://127.0.0.1:${port}/health`);
      console.log(`[Business Insights API]   Swagger: http://127.0.0.1:${port}/api-docs`);
    });
  })
  .catch((e) => {
    console.error("[Business Insights API] MongoDB connection failed:", e.message || e);
    process.exit(1);
  });
