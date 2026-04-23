# Proposal C PPT Generator

슬라이드 텍스트를 입력하면 다음을 자동 생성합니다.

1. GPT 기반 슬라이드 구성안(JSON)
2. GPT 이미지 모델 기반 스타일 시안 이미지
3. 완전 편집 가능한 16:9 PowerPoint(.pptx)

## 핵심 조건 반영

- 슬라이드 전체를 단일 이미지로 넣지 않고, `PptxGenJS` 기본 객체(텍스트, 도형, 선, 표 등)로 구성
- 텍스트 전부 편집 가능
- 카드/번호/도형/표 개별 편집 가능
- 화이트 + 진한 블루 포인트의 Proposal C 스타일

## 실행 방법

```bash
npm install
npm run dev
```

환경변수 (`.env.local`):

```bash
OPENAI_API_KEY=...
LAYOUT_MODEL=gpt-4.1-mini
GPT_IMAGE_MODEL=gpt-image-1
```

> 요청사항에 맞춰 GPT 이미지 모델 사용 가능하도록 구현했으며, 모델명은 `GPT_IMAGE_MODEL`로 교체 가능합니다.

## Vercel 배포

```bash
npm i -g vercel
vercel
vercel --prod
```

또는 GitHub 연동 후 Vercel에서 Import 하세요.
