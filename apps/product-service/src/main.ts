import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../../../packages/errorHandler/errorMiddleware";
import productRouter from "./routes/product.routes";
import productImageRouter from "./routes/productImage.routes";
// import swaggerUi from "swagger-ui-express";
// const swaggerDocument = require("./swagger.json");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://192.168.2.102:3000",
      "http://192.168.2.102:3001",
    ],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send({ message: "Hello Product API" });
});

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.get("/docs-json", (req, res) => res.json(swaggerDocument));

//Routes
app.use("/api", productRouter);
app.use("/api", productImageRouter);

app.use(errorMiddleware);

const port = process.env.PORT ?? 6002;

const server = app.listen(port, () => {
  console.log(`Product Service is Listening at http://localhost:${port}`);
  console.log(`Swagger Docs at http://localhost:${port}/api-docs`);
});
server.on("error", console.error);
