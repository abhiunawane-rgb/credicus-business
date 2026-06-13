import { NextResponse } from "next/server";
import { memoryCreateContact } from "@/lib/memory-store";
import { prisma } from "@/lib/prisma";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const name = payload.name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const message = payload.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "name, email, and message are required." }, { status: 400 });
  }

  try {
    const contact = await prisma.contact.create({
      data: { name, email, message },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json(
      {
        message: "Thanks! Your inquiry has been submitted successfully.",
        data: contact,
      },
      { status: 201 },
    );
  } catch (error) {
    const details = (error as Error).message;
    const isDatabaseUnavailable =
      details.includes("Can't reach database server") ||
      details.includes("P1001") ||
      details.includes("Unknown arg");

    if (isDatabaseUnavailable) {
      const contact = memoryCreateContact({ name, email, message });
      return NextResponse.json(
        {
          message: "Thanks! Your inquiry has been submitted successfully.",
          data: contact,
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      { error: "Failed to submit contact form.", details },
      { status: 500 },
    );
  }
}
