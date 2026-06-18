import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@fal-ai/serverless-client"; // Энэ санг суулгах шаардлагатай

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const token = process.env.FAL_AI_API_KEY; // FAL.ai API key-ээ .env файлдаа тохируулах
    if (!token) {
      throw new Error("FAL_AI_API_KEY is not configured");
    }

    const client = new InferenceClient(token);
    const image = await client.textToImage({
      provider: "fal-ai",
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: `A delicious food photograph: ${prompt}`,
      parameters: { num_inference_steps: 5 },
    });

    return new NextResponse(image, {
      headers: { "Content-Type": image.type || "image/png" },
    });
  } catch (error) {
    console.error("Image generation failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
