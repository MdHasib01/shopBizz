import { kafka } from "../../../packages/libs/kafka";
import { updateUserAnalytics } from "./services/analytics.service";

const cousumer = kafka.consumer({ groupId: "users-events-group" });

const eventQueue: any[] = [];

const processQueue = async () => {
  if (eventQueue.length === 0) return;
  const events = [...eventQueue];
  eventQueue.length = 0;

  for (const event of events) {
    if (event.action === "shop_visit") {
    }

    const validActions = [
      "add_to_wishlist",
      "add_to_cart",
      "product_view",
      "remove_from_wishlist",
      "remove_from_cart",
    ];

    if (!event.action || !validActions.includes(event.action)) continue;

    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.log("Error Processing Event: ", error);
    }
  }
};

setInterval(processQueue, 3000);

// Kafka Consumer ----
export const consumeKafkaMessages = async () => {
  await cousumer.connect();
  await cousumer.subscribe({ topic: "users-events", fromBeginning: false });
  await cousumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());
      eventQueue.push(event);
    },
  });
};

consumeKafkaMessages().catch(console.error);
