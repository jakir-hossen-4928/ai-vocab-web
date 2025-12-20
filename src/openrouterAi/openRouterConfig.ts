export interface OpenRouterModel {
    id: string;
    name: string;
    description: string;
}

export const OPENROUTER_MODELS: OpenRouterModel[] = [
    { id: "x-ai/grok-4.1-fast:free", name: "Grok 4.1 Fast", description: "Fast specialized model" },
    { id: "tngtech/deepseek-r1t2-chimera:free", name: "Deepseek R1t2 Chimera", description: "Deepseek optimized model" },
    { id: "kwaipilot/kat-coder-pro:free", name: "Kat Coder Pro", description: "Coding specialized model" },
    { id: "tngtech/deepseek-r1t-chimera:free", name: "Deepseek R1t Chimera", description: "Efficient reasoning model" },
    { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air", description: "Versatile AI model" },
    { id: "nvidia/nemotron-nano-12b-v2-vl:free", name: "Nemotron Nano 12B v2 VL", description: "Vision-enabled nano model" },
    { id: "qwen/qwen3-coder:free", name: "Qwen 3 Coder", description: "Advanced coding assistant" },
    { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B IT", description: "Google's lightweight instruction-tuned model" },
    { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B", description: "Open-source GPT alternative" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct", description: "High-performance instruction model" },
    { id: "moonshotai/kimi-k2:free", name: "Kimi K2", description: "Moonshot AI specialized model" },
];

export const DEFAULT_MODEL = "google/gemma-3-27b-it:free"; // Updated to a valid free model


export function getModelById(modelId: string): OpenRouterModel | undefined {
    return OPENROUTER_MODELS.find(m => m.id === modelId);
}

export function isGoogleModel(modelId: string): boolean {
    return modelId.startsWith('google/');
}