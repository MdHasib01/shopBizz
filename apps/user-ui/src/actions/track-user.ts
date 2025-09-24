export async function sendKafkaEvent(eventData: {
  userId: string;
  productId: string;
  shopId: string;
  action: string;
  device: string;
  country: string;
  city: string;
}) {
  try {
    const doFetch = (globalThis as any).fetch;
    if (doFetch) {
      await doFetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
    }
  } catch (error) {
    console.log(error);
  }
}
