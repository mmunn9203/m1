import OpenAI from 'openai';

const OPENAI_KEY_CANDIDATES = ['OPENAI_API_KEY', 'OPENAI_KEY', 'OPENAI_APIKEY'];

export function resolveOpenAIKey() {
  for (const keyName of OPENAI_KEY_CANDIDATES) {
    const value = process.env[keyName];
    if (value && String(value).trim()) {
      return { keyName, value: String(value).trim() };
    }
  }
  return { keyName: null, value: '' };
}

export function hasOpenAIKey() {
  return Boolean(resolveOpenAIKey().value);
}

export function getOpenAIClient() {
  const resolved = resolveOpenAIKey();
  if (!resolved.value) {
    throw new Error('OPENAI_API_KEY가 설정되어야 합니다.');
  }
  return new OpenAI({ apiKey: resolved.value });
}

function extractJsonBlock(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';

  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    return trimmed;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const startArr = trimmed.indexOf('[');
  const endArr = trimmed.lastIndexOf(']');
  if (startArr >= 0 && endArr > startArr) return trimmed.slice(startArr, endArr + 1);

  const startObj = trimmed.indexOf('{');
  const endObj = trimmed.lastIndexOf('}');
  if (startObj >= 0 && endObj > startObj) return trimmed.slice(startObj, endObj + 1);

  return trimmed;
}

export async function generateSlideBlueprint(content) {
  const client = getOpenAIClient();
  const model = process.env.LAYOUT_MODEL || 'gpt-4.1-mini';
  const prompt = `너는 전문 프레젠테이션 디자이너다.
아래 내용을 바탕으로 16:9 발표자료 구성안을 JSON 배열로 반환해라.
슬라이드는 최대 6장.
각 객체 스키마:
{
  "title": string,
  "subtitle": string,
  "bullets": string[],
  "cards": [{"title": string, "body": string}],
  "kpi": [{"label": string, "value": string}],
  "table": {"headers": string[], "rows": string[][]}
}
반드시 JSON만 반환.`;

  const res = await client.responses.create({
    model,
    input: [
      { role: 'system', content: [{ type: 'input_text', text: prompt }] },
      { role: 'user', content: [{ type: 'input_text', text: content }] },
    ],
    temperature: 0.5,
  });

  const raw = res.output_text?.trim();
  if (!raw) {
    throw new Error('레이아웃 생성 결과가 비어 있습니다.');
  }

  const jsonText = extractJsonBlock(raw);

  try {
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    throw new Error(`레이아웃 JSON 파싱 실패: ${raw.slice(0, 200)}...`);
  }
}

export async function generateDraftImages(slides) {
  const client = getOpenAIClient();
  const model = process.env.GPT_IMAGE_MODEL || 'gpt-image-1';

  const limited = slides.slice(0, 3);
  const results = [];

  for (const [idx, slide] of limited.entries()) {
    const prompt = `Create a presentation slide draft image in proposal C style.
White background, deep blue accent, minimal professional infographic.
Korean text allowed.
Title: ${slide.title || `Slide ${idx + 1}`}
Key points: ${(slide.bullets || []).join(', ')}`;

    const image = await client.images.generate({
      model,
      size: '1536x1024',
      prompt,
    });

    const b64 = image.data?.[0]?.b64_json;
    if (b64) {
      results.push(`data:image/png;base64,${b64}`);
    }
  }

  return results;
}
