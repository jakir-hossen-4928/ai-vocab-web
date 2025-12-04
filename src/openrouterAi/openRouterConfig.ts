export interface OpenRouterModel {
    id: string;
    name: string;
    inputPricePerMillion: number;
    outputPricePerMillion: number;
    contextWindow: number;
    description: string;
}

export const OPENROUTER_MODELS: OpenRouterModel[] = [
    { id: "x-ai/grok-4.1-fast:free", name: "Grok 4.1 Fast (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
    { id: "tngtech/deepseek-r1t2-chimera:free", name: "Deepseek R1t2 Chimera (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
    { id: "kwaipilot/kat-coder-pro:free", name: "Kat Coder Pro (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
    { id: "tngtech/deepseek-r1t-chimera:free", name: "Deepseek R1t Chimera (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
    { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
    { id: "nvidia/nemotron-nano-12b-v2-vl:free", name: "Nemotron Nano 12B v2 VL (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
    { id: "qwen/qwen3-coder:free", name: "Qwen 3 Coder (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
    { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B IT (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
    { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
    { id: "moonshotai/kimi-k2:free", name: "Kimi K2 (Free)", inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 0, description: "Free model" },
];

export const DEFAULT_MODEL = "google/gemma-3-27b-it:free"; // Updated to a valid free model

export function calculateCost(inputTokens: number, outputTokens: number, modelId: string): number {
    return 0; // All free models
}

export function formatCost(cost: number): string {
    return "$0.00";
}

export function getModelById(modelId: string): OpenRouterModel | undefined {
    return OPENROUTER_MODELS.find(m => m.id === modelId);
}

export function isGoogleModel(modelId: string): boolean {
    return modelId.startsWith('google/');
}