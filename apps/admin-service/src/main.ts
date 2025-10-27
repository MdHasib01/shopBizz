import express, { Router } from "express";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "@packages/errorHandler/errorMiddleware";
import router from "./routes/admin.route";

const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to admin-service!" });
});

// routes
app.use("/api", router);

app.use(errorMiddleware);
const port = process.env.PORT || 6005;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
