import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Auth Service",
    description: "Auth Service API",
  },
  host: "localhost:6001",
  schemes: ["http"],
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./controller/auth.controller.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
