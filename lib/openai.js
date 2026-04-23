import OpenAI from 'openai';

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY가 설정되어야 합니다.');
  }
  return new OpenAI({ apiKey });
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
      { role: 'system', content: prompt },
      { role: 'user', content },
    ],
    temperature: 0.5,
  });

  const text = res.output_text?.trim();
  if (!text) {
    throw new Error('레이아웃 생성 결과가 비어 있습니다.');
  }

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    throw new Error(`레이아웃 JSON 파싱 실패: ${text.slice(0, 200)}...`);
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
