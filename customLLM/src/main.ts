import * as webllm from "@mlc-ai/web-llm";

function setLabel(id: string, text: string) {
  const label = document.getElementById(id);
  if (label == null) {
    throw Error("Cannot find label " + id);
  }
  label.innerText = text;
}

// There are two demonstrations, pick one to run

/**
 * Chat completion (OpenAI style) without streaming, where we get the entire response at once.
 */
async function mainNonStreaming() {
  const initProgressCallback = (report: webllm.InitProgressReport) => {
    setLabel("init-label", report.text);
  };
  // const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";
const selectedModel = "mlc-ai/Qwen1.5-0.5B-Chat-q0f16-MLC";
  

  const engine: webllm.MLCEngineInterface =
    await webllm.CreateWebWorkerMLCEngine(
      new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }),
      selectedModel,
      { initProgressCallback: initProgressCallback },
    );

  const request: webllm.ChatCompletionRequest = {
    messages: [
      {
        role: "system",
        content:
          "You are a software architect who is expert at writing entity and their relationships schema using SQL.",
      },
      { role: "user", content: "provide entity relationships for task management application" },
      // { role: "assistant", content: "California, New York, Pennsylvania." },
      { role: "user", content: "generate the response in JSON format without any other information" },
    ],
    n: 3,
    temperature: 1.5,
    max_tokens: 256,
  };

  const reply0 = await engine.chat.completions.create(request);
  console.log(reply0);

  console.log(reply0.usage);
}

/**
 * Chat completion (OpenAI style) with streaming, where delta is sent while generating response.
 */
async function mainStreaming() {
  const initProgressCallback = (report: webllm.InitProgressReport) => {
    setLabel("init-label", report.text);
  };
  const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

  const engine: webllm.MLCEngineInterface =
    await webllm.CreateWebWorkerMLCEngine(
      new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }),
      selectedModel,
      { initProgressCallback: initProgressCallback },
    );

  const request: webllm.ChatCompletionRequest = {
    stream: true,
    stream_options: { include_usage: true },
    messages: [
      {
        role: "system",
        content:
          "You are a software architect who is expert at writing entity and their relationships schema using SQL.",
      },
      { role: "user", content: "provide entity relationships for task management application" },
      // { role: "assistant", content: "California, New York, Pennsylvania." },
      { role: "user", content: "generate the response in JSON format without any other information" },
    ],
    temperature: 1.5,
    max_tokens: 256,
  };

  const asyncChunkGenerator = await engine.chat.completions.create(request);
  let message = "";
  for await (const chunk of asyncChunkGenerator) {
    console.log(chunk);
    message += chunk.choices[0]?.delta?.content || "";
    setLabel("generate-label", message);
    if (chunk.usage) {
      console.log(chunk.usage); // only last chunk has usage
    }
    // engine.interruptGenerate();  // works with interrupt as well
  }
  console.log("Final message:\n", await engine.getMessage()); // the concatenated message
}

// Run one of the function below
// mainNonStreaming();
mainStreaming();