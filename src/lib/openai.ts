import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export const getChatCompletion = async (
  messages: ChatCompletionMessageParam[],
  tools?: Array<any>
) => {
  if (!openai) {
    throw new Error("OpenAI API key is not configured");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 1000,
    tools: tools || undefined,
  });

  return response.choices[0]?.message;
};

export const getStreamingChatCompletion = async (
  messages: ChatCompletionMessageParam[]
) => {
  if (!openai) {
    throw new Error("OpenAI API key is not configured");
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 1000,
    stream: true,
  });

  return stream;
};
