import express from "express";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});
const port = process.env.PORT ?? 6001;

const server = app.listen(port, () => {
  console.log(`Auth Service is Listening at http://localhost:${port}`);
});
server.on("error", console.error);
