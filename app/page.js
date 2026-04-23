'use client';

import { useState } from 'react';

export default function HomePage() {
  const [content, setContent] = useState('서비스 소개\n문제 정의\n핵심 기능\n기대 효과\n로드맵');
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || '생성 실패');
      }

      const payload = await res.json();
      const fileName = payload.fileName || 'proposal-c.pptx';
      setPreviewImages(payload.previews || []);

      const mime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      const byteChars = atob(payload.pptxBase64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i += 1) byteNums[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNums)], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Proposal C PPT 자동 생성기</h1>
      <p className="lead">
        입력한 슬라이드 내용을 기반으로 GPT 이미지 스타일 시안 + 완전 편집 가능한 16:9 PPTX를 생성합니다.
      </p>
      <section className="panel">
        <label htmlFor="content">슬라이드 내용 입력</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="슬라이드에 넣을 핵심 내용을 줄바꿈으로 입력하세요."
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? '생성 중...' : 'PPTX 생성하기'}
        </button>
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      </section>

      {previewImages.length > 0 && (
        <>
          <h2 style={{ marginTop: 28 }}>GPT 이미지 시안</h2>
          <div className="grid">
            {previewImages.map((src, idx) => (
              <figure className="thumb" key={idx}>
                <img src={src} alt={`slide draft ${idx + 1}`} />
                <figcaption className="code">slide-{idx + 1}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
