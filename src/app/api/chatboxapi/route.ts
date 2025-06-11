import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { adminDb } from "@/lib/firebaseAdmin";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const { question } = await req.json();
    console.log("Received question:", question);

    // Fetch leads from Firestore
    const snapshot = await adminDb.collection("leads").get();
    console.log("Fetched leads:", Date.now() - start, "ms");

    // Map leads data to a context string to send to OpenAI
    const leads = snapshot.docs.map((doc) => doc.data());
    const context = leads
      .map(
        (lead) =>
          `Name: ${lead.name}, Company: ${lead.company}, Email: ${lead.email}, Status: ${lead.status}, Group: ${lead.group}, Notes: ${lead.notes || ""}`
      )
      .join("\n");

    // Ask OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Answer questions using the provided leads data. Answer in Thai or English based on the question language.",
        },
        {
          role: "user",
          content: `Leads Data:\n${context}\n\nQuestion: ${question}`,
        },
      ],
      max_tokens: 300,
    });
    console.log("OpenAI response:", Date.now() - start, "ms");

    return NextResponse.json({ answer: completion.choices[0]?.message?.content });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}