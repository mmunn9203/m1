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


## Vercel 오류 트러블슈팅

오류: `빌드가 완료된 후 "public"이라는 이름의 출력 디렉터리를 찾을 수 없습니다.`

원인:
- Vercel 프로젝트의 Framework Preset이 `Next.js`가 아니라 `Other`로 잡혀 있거나,
- Output Directory가 `public`으로 강제 설정된 상태입니다.

해결:
1. Vercel 프로젝트 Settings → Build and Deployment로 이동
2. **Framework Preset = Next.js** 로 변경
3. **Output Directory 값을 비움(기본값 사용)**
4. Root Directory는 저장소 루트(`/`)로 설정
5. Environment Variables에 `OPENAI_API_KEY` 추가
6. Redeploy 실행

추가로 저장소에 `vercel.json`을 넣어 Framework를 `nextjs`로 명시했습니다.


`vercel.json`에도 `outputDirectory: ".next"`를 명시해 두었습니다.


## 보안 공지

Vercel 경고(취약한 Next.js 버전 감지)에 대응해 `next` 버전을 보안 패치 포함 버전으로 상향했습니다.
