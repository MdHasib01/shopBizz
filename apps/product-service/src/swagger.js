import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Product Service",
    description: "Product Service API",
  },
  host: "localhost:6002",
  schemes: ["http"],
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./routes/product.routes.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
