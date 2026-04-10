import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `Kamu adalah asisten konseling sekolah yang ramah dan helpful. Kamu membantu siswa dengan pertanyaan seputar:
- Pengembangan diri dan motivasi belajar
- Kesehatan mental dan manajemen stres
- Panduan karir dan pilihan jurusan
- Masalah sosial dan pergaulan
- Informasi seputar kegiatan konseling di sekolah

Jawablah dengan bahasa Indonesia yang sopan, hangat, dan mudah dipahami oleh siswa. Jika pertanyaan di luar topik konseling, tetap jawab dengan ramah namun arahkan kembali ke topik yang relevan.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Gemma does not support system role; prepend instructions to the first user message
    const messagesWithPrompt = [...messages];
    if (messagesWithPrompt.length > 0 && messagesWithPrompt[0].role === "user") {
      messagesWithPrompt[0] = {
        ...messagesWithPrompt[0],
        content: `${SYSTEM_PROMPT}\n\n${messagesWithPrompt[0].content}`,
      };
    }
    const fullMessages = messagesWithPrompt;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-12b-it:free",
        messages: fullMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          let done = false;
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;

            if (value) {
              buffer += decoder.decode(value, { stream: true });

              const lines = buffer.split("\n");
              // Keep the last (potentially incomplete) line in the buffer
              buffer = lines.pop() ?? "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") {
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    done = true;
                    break;
                  }
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                      );
                    }
                  } catch {
                    // skip malformed chunks
                  }
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

