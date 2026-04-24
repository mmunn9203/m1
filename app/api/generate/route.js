import { NextResponse } from 'next/server';
import { buildPpt } from '@/lib/pptBuilder';
import { generateDraftImages, generateSlideBlueprint, hasOpenAIKey, resolveOpenAIKey } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function fallbackBlueprint(content) {
  const lines = content
    .split(/\n+/)
    .map((v) => v.trim())
    .filter(Boolean);

  const chunks = lines.length > 0 ? lines : [content.trim() || '제안 개요'];
  const slides = chunks.slice(0, 5).map((topic, idx) => {
    const next = chunks[idx + 1] || '세부 실행 항목';
    const next2 = chunks[idx + 2] || '기대 성과';

    return {
      title: topic.slice(0, 42),
      subtitle: `로컬 fallback 자동 구성 · section ${idx + 1}`,
      bullets: [
        `${topic} 핵심 맥락 정리`,
        `${next} 실행 방안`,
        `${next2} 측정 지표`,
      ],
      cards: [
        { title: '핵심 과제', body: topic },
        { title: '실행 액션', body: next },
        { title: '예상 효과', body: next2 },
      ],
      kpi: [
        { label: '우선순위', value: `${idx + 1}` },
        { label: '완료율 목표', value: `${70 + idx * 5}%` },
        { label: '리뷰주기', value: '주간' },
      ],
      table: {
        headers: ['구분', '내용', '비고'],
        rows: [
          ['요약', topic.slice(0, 24), '필수'],
          ['실행', next.slice(0, 24), '중요'],
          ['성과', next2.slice(0, 24), '추적'],
        ],
      },
    };
  });

  return slides;
}

function buildEnvDiagnostics() {
  const resolved = resolveOpenAIKey();
  return {
    vercelEnv: process.env.VERCEL_ENV || 'unknown',
    nodeEnv: process.env.NODE_ENV || 'unknown',
    has_OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    has_OPENAI_KEY: Boolean(process.env.OPENAI_KEY),
    has_OPENAI_APIKEY: Boolean(process.env.OPENAI_APIKEY),
    usingKeyName: resolved.keyName || 'none',
  };
}

export async function POST(req) {
  try {
    const { content } = await req.json();
    const normalizedContent = String(content || '').trim();

    if (!normalizedContent) {
      return NextResponse.json({ error: '내용을 입력해 주세요.' }, { status: 400 });
    }

    if (!hasOpenAIKey()) {
      return NextResponse.json(
        {
          error:
            'OPENAI API 키를 서버 런타임에서 읽지 못했습니다. Environment Variables 등록 후 재배포해 주세요.',
          diagnostics: buildEnvDiagnostics(),
        },
        { status: 500 },
      );
    }

    let blueprint;
    let previews = [];
    let usedFallback = false;
    let warning = '';

    try {
      blueprint = await generateSlideBlueprint(normalizedContent);
      previews = await generateDraftImages(blueprint);
    } catch (err) {
      const message = err?.message || '';
      if (message.includes('OPENAI_API_KEY')) {
        return NextResponse.json({ error: message, diagnostics: buildEnvDiagnostics() }, { status: 500 });
      }
      usedFallback = true;
      warning = message || 'AI 생성 실패로 fallback이 사용되었습니다.';
      blueprint = fallbackBlueprint(normalizedContent);
    }

    const buffer = await buildPpt(blueprint);

    return NextResponse.json(
      {
        fileName: `proposal-c-${Date.now()}.pptx`,
        pptxBase64: Buffer.from(buffer).toString('base64'),
        previews,
        usedFallback,
        warning,
        sourcePreview: normalizedContent.slice(0, 120),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message || '서버 오류' }, { status: 500 });
  }
}
