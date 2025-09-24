import { NextResponse } from "next/server";
import { kafka } from "../../../../../../packages/libs/kafka";

export async function POST(request: any) {
  const producer = kafka.producer();
  try {
    const body = await request.json();
    await producer.connect();
    await producer.send({
      topic: "users-events",
      messages: [{ value: JSON.stringify(body) }],
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  } finally {
    try {
      await producer.disconnect();
    } catch {}
  }
}
