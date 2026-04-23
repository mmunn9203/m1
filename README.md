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
