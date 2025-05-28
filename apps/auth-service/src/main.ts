import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../../../packages/errorHandler/errorMiddleware";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

app.use(errorMiddleware);

const port = process.env.PORT ?? 6001;

const server = app.listen(port, () => {
  console.log(`Auth Service is Listening at http://localhost:${port}`);
});
server.on("error", console.error);
