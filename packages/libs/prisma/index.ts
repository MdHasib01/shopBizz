import { PrismaClient } from "@prisma/client/extension";
import exp from "constants";

declare global {
  namespace globalThis {
    var prismadb: PrismaClient;
  }
}

const prisma = new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prismadb = prisma;

export default prisma;
