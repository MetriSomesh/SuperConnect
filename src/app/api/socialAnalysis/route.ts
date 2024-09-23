import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai"; // Correct import for OpenAI

// Set up OpenAI API configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Store your OpenAI API Key in an .env file
});

export async function POST(req: NextRequest) {
  try {
    const { twitterDescription, prompt } = await req.json();

    if (!twitterDescription || !prompt) {
      return NextResponse.json(
        { message: "Please provide both a twitterDescription and a prompt" },
        { status: 400 }
      );
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can also use "gpt-4" if available
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that summarizes and analyzes Twitter profiles.",
        },
        {
          role: "user",
          content: `Here is a Twitter profile description: "${twitterDescription}". ${prompt}`,
        },
      ],
    });

    const gptResponse = response.choices[0]?.message?.content;

    // Send the response back to the client
    return NextResponse.json({ response: gptResponse });
  } catch (error: any) {
    console.error(
      "Error communicating with OpenAI:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        message: "Error processing request",
        error: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
