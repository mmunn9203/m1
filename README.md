# 점심메뉴 추천 사이트

정적 웹사이트(`index.html`, `styles.css`, `script.js`)로 구성된 점심메뉴 추천 도구입니다.

## 로컬 실행

```bash
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173` 접속

## Vercel 배포

1. Vercel 계정 로그인
2. 프로젝트 루트에서 실행

```bash
vercel
```

3. 운영 배포

```bash
vercel --prod
```

`vercel.json`이 포함되어 있어 정적 사이트로 바로 배포됩니다.


## GitHub Actions 자동배포

`main` 브랜치에 push 하면 Vercel에 자동으로 배포되도록 워크플로를 추가했습니다.

필수 GitHub Secrets:

- `VERCEL_TOKEN`: Vercel Personal/Team Token
- `VERCEL_ORG_ID`: Vercel Team 또는 개인 계정 ID
- `VERCEL_PROJECT_ID`: Vercel Project ID

설정 방법:

1. Vercel 프로젝트를 한 번 생성/연결합니다.
2. GitHub 저장소 > Settings > Secrets and variables > Actions에 위 3개 시크릿을 등록합니다.
3. `main`에 push 하거나 Actions 탭에서 수동 실행(`workflow_dispatch`)합니다.
