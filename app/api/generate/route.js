import { NextResponse } from 'next/server';
import { buildPpt } from '@/lib/pptBuilder';
import { generateDraftImages, generateSlideBlueprint } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function fallbackBlueprint(content) {
  const points = content
    .split(/\n+/)
    .map((v) => v.trim())
    .filter(Boolean);

  return [
    {
      title: points[0] || '제안 개요',
      subtitle: '자동 생성된 구조 (fallback)',
      bullets: points.slice(0, 5),
      cards: [
        { title: '문제', body: points[0] || '핵심 문제 정의' },
        { title: '해결', body: points[1] || '해결 전략' },
        { title: '효과', body: points[2] || '기대 효과' },
      ],
      kpi: [
        { label: '도입기간', value: '4주' },
        { label: '효율개선', value: '+32%' },
        { label: '만족도', value: '4.8/5' },
      ],
      table: {
        headers: ['단계', '내용', '기간'],
        rows: [
          ['1', '기획', '1주'],
          ['2', '디자인', '2주'],
          ['3', '구현', '1주'],
        ],
      },
    },
  ];
}

export async function POST(req) {
  try {
    const { content } = await req.json();
    const normalizedContent = String(content || '').trim();

    if (!normalizedContent) {
      return NextResponse.json({ error: '내용을 입력해 주세요.' }, { status: 400 });
    }

    let blueprint;
    let previews = [];
    let usedFallback = false;
    let warning = '';

    try {
      blueprint = await generateSlideBlueprint(normalizedContent);
      previews = await generateDraftImages(blueprint);
    } catch (err) {
      usedFallback = true;
      warning = err?.message || 'AI 생성 실패로 fallback이 사용되었습니다.';
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
