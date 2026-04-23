import pptxgen from 'pptxgenjs';
import { proposalC } from './designSystem';

function drawHeader(slide, index, title, subtitle) {
  const { colors, fonts } = proposalC;
  slide.background = { color: colors.bg };

  slide.addShape(pptxgen.ShapeType.line, {
    x: 0.7,
    y: 0.65,
    w: 11.9,
    h: 0,
    line: { color: colors.line, pt: 1 },
  });

  slide.addText(String(index + 1).padStart(2, '0'), {
    x: 11.9,
    y: 0.2,
    w: 0.9,
    h: 0.4,
    fontFace: 'Inter',
    fontSize: 12,
    color: colors.muted,
    align: 'right',
  });

  slide.addText(title || 'Untitled Slide', {
    x: 0.8,
    y: 0.2,
    w: 10.7,
    h: 0.45,
    fontFace: 'Inter',
    bold: true,
    fontSize: fonts.subtitle,
    color: colors.primary,
  });

  slide.addText(subtitle || '', {
    x: 0.8,
    y: 0.72,
    w: 10.5,
    h: 0.32,
    fontFace: 'Inter',
    fontSize: fonts.caption,
    color: colors.muted,
  });
}

function drawBody(slide, spec) {
  const { colors, fonts } = proposalC;

  slide.addShape(pptxgen.ShapeType.roundRect, {
    x: 0.8,
    y: 1.2,
    w: 5.9,
    h: 5.8,
    rectRadius: 0.08,
    fill: { color: 'F9FBFF' },
    line: { color: colors.line, pt: 1 },
  });

  slide.addText(spec.title || '핵심 메시지', {
    x: 1.1,
    y: 1.55,
    w: 5.2,
    h: 0.7,
    fontFace: 'Inter',
    bold: true,
    fontSize: fonts.title,
    color: colors.primary,
  });

  const bulletLines = (spec.bullets || []).slice(0, 5).map((item) => ({
    text: `• ${item}`,
    options: { breakLine: true },
  }));

  if (bulletLines.length > 0) {
    slide.addText(bulletLines, {
      x: 1.15,
      y: 2.5,
      w: 5.1,
      h: 2.8,
      fontFace: 'Inter',
      fontSize: fonts.body,
      color: colors.text,
      valign: 'top',
      paraSpaceAfterPt: 8,
    });
  }

  const cards = (spec.cards || []).slice(0, 3);
  cards.forEach((card, idx) => {
    const y = 1.35 + idx * 1.78;
    slide.addShape(pptxgen.ShapeType.roundRect, {
      x: 7.0,
      y,
      w: 5.45,
      h: 1.58,
      rectRadius: 0.06,
      fill: { color: 'FFFFFF' },
      line: { color: colors.line, pt: 1 },
    });
    slide.addShape(pptxgen.ShapeType.roundRect, {
      x: 7.0,
      y,
      w: 0.16,
      h: 1.58,
      rectRadius: 0.06,
      fill: { color: colors.accent },
      line: { color: colors.accent, pt: 0 },
    });
    slide.addText(card.title || `카드 ${idx + 1}`, {
      x: 7.35,
      y: y + 0.25,
      w: 4.8,
      h: 0.35,
      bold: true,
      fontFace: 'Inter',
      fontSize: 15,
      color: colors.primary,
    });
    slide.addText(card.body || '-', {
      x: 7.35,
      y: y + 0.68,
      w: 4.8,
      h: 0.68,
      fontFace: 'Inter',
      fontSize: 12,
      color: colors.muted,
    });
    if (idx < cards.length - 1) {
      slide.addShape(pptxgen.ShapeType.chevron, {
        x: 12.1,
        y: y + 1.45,
        w: 0.2,
        h: 0.2,
        fill: { color: colors.accent },
        line: { color: colors.accent, pt: 1 },
      });
    }
  });

  const kpi = (spec.kpi || []).slice(0, 3);
  kpi.forEach((item, idx) => {
    slide.addShape(pptxgen.ShapeType.roundRect, {
      x: 1.05 + idx * 1.9,
      y: 5.65,
      w: 1.72,
      h: 1.15,
      rectRadius: 0.06,
      fill: { color: proposalC.colors.primarySoft },
      line: { color: colors.line, pt: 1 },
    });
    slide.addText(item.value || '-', {
      x: 1.15 + idx * 1.9,
      y: 5.9,
      w: 1.55,
      h: 0.38,
      align: 'center',
      bold: true,
      fontFace: 'Inter',
      fontSize: 17,
      color: colors.primary,
    });
    slide.addText(item.label || '', {
      x: 1.15 + idx * 1.9,
      y: 6.3,
      w: 1.55,
      h: 0.27,
      align: 'center',
      fontFace: 'Inter',
      fontSize: 10,
      color: colors.muted,
    });
  });

  if (spec.table?.headers?.length && spec.table?.rows?.length) {
    const rows = [spec.table.headers, ...spec.table.rows.slice(0, 4)];
    slide.addTable(rows, {
      x: 7.02,
      y: 6.0,
      w: 5.4,
      h: 0.9,
      color: colors.text,
      border: { pt: 1, color: colors.line },
      fontFace: 'Inter',
      fontSize: 10,
      fill: 'FFFFFF',
      valign: 'mid',
    });
  }
}

export async function buildPpt(slidesSpec) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Proposal C Generator';
  pptx.subject = 'Auto-generated proposal deck';
  pptx.title = 'Proposal C Presentation';

  slidesSpec.forEach((spec, idx) => {
    const slide = pptx.addSlide();
    drawHeader(slide, idx, spec.title, spec.subtitle);
    drawBody(slide, spec);
  });

  return pptx.write({ outputType: 'nodebuffer' });
}
