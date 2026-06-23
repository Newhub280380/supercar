export interface GeneratedImage {
  url: string;
  prompt: string;
  width: number;
  height: number;
}

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt/";

const MOM_AI_IMAGE_PROMPTS = [
  {
    prompt: "A warm, soft illustration of a happy mother holding her baby in a modern German apartment, morning light, cozy atmosphere, professional Scandinavian interior design style",
    width: 1024,
    height: 1024,
  },
  {
    prompt: "Minimalist vector illustration of a mother balancing work and family, sitting at a kitchen table with laptop and child drawing side by side, soft pastel colors, clean design",
    width: 1024,
    height: 1024,
  },
  {
    prompt: "A group of diverse German mothers having coffee together at a playground, laughing, natural daylight, candid lifestyle photography style",
    width: 1024,
    height: 1024,
  },
  {
    prompt: "Self-care scene: a mother taking a warm bath with candles and a book, peaceful, lavender tones, spa-like bathroom, restful mood",
    width: 1024,
    height: 1024,
  },
  {
    prompt: "Modern landing page hero image for an AI parenting assistant, mother using a tablet while child plays, futuristic but warm interface visible, dark gradient background with soft pink and blue accents",
    width: 1200,
    height: 630,
  },
];

function buildPollinationsUrl(prompt: string, width: number, height: number): string {
  const encoded = encodeURIComponent(prompt);
  return `${POLLINATIONS_BASE}${encoded}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 999999)}&nologo=true`;
}

export async function generateMomImages(_posts: Array<{ title: string }>): Promise<string[]> {
  const urls: string[] = [];

  for (const item of MOM_AI_IMAGE_PROMPTS) {
    const url = buildPollinationsUrl(item.prompt, item.width, item.height);
    urls.push(url);
  }

  return urls;
}

export async function generateImageFromPrompt(prompt: string, width = 1024, height = 1024): Promise<GeneratedImage> {
  const url = buildPollinationsUrl(prompt, width, height);
  return { url, prompt, width, height };
}
