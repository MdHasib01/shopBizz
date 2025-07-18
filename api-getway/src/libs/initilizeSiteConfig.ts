import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initilizeConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();
    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Sports & Fitness",
          ],
          subCategories: {
            Electronics: ["TV", "Mobile", "Laptop"],
            Fashion: ["Men", "Women", "Kids"],
            "Home & Kitchen": ["Kitchen", "Furniture"],
            "Sports & Fitness": ["Cricket", "Football"],
          },
        },
      });
    }
  } catch (error) {
    console.error("Error initilizing site config:", error);
  }
};

export default initilizeConfig;
