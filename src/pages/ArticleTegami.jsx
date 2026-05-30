import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function parseMarkdown(md) {
  if (!md) return ''
  md = md.replace(/^---\n.*?\n---\n/s, '')
  const lines = md.split('\n')
  const html = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^---+$/.test(line.trim())) {
      html.push('<div class="tg-divider">✦ ✦ ✦</div>')
      i++; continue
    }
    if (/^## (.+)/.test(line)) {
      html.push(`<div class="tg-section">${line.replace(/^## /, '')}</div>`)
      i++; continue
    }
    if (/^# (.+)/.test(line)) {
      html.push(`<h2 class="tg-h2">${line.replace(/^# /, '')}</h2>`)
      i++; continue
    }
    if (/^!\[.*?\]\((.+?)\)/.test(line)) {
      const url = line.match(/^!\[.*?\]\((.+?)\)/)[1]
      html.push(`<img class="tg-img" src="${url}" alt="" loading="lazy">`)
      i++; continue
    }
    if (/^> /.test(line)) {
      const bqLines = []
      while (i < lines.length && /^> /.test(lines[i])) {
        bqLines.push(lines[i].replace(/^> /, ''))
        i++
      }
      html.push(`<blockquote class="tg-blockquote">${bqLines.join('<br>')}</blockquote>`)
      continue
    }
    if (!line.trim()) { i++; continue }
    const p = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
    html.push(`<p class="tg-p">${p}</p>`)
    i++
  }
  return html.join('\n')
}

export default function ArticleTegami({ meta, content, folder }) {
  const navigate = useNavigate()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const fn = () => setShowTop((window.scrollY || document.documentElement.scrollTop) > 300)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const tags = meta.tags ? meta.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const date = meta.date ? new Date(meta.date).toLocaleDateString('ja-JP', {year:'numeric', month:'long', day:'numeric'}) : ''

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700&family=Noto+Sans+JP:wght@300;400&display=swap');
        html { overflow-y: overlay !important; height: auto !important; scrollbar-width: thin; scrollbar-color: #8b7355 transparent; }
        body { height: auto !important; background: #f5f0e8; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #8b7355; border-radius: 4px; }
        ::-webkit-scrollbar-button { display: none; height: 0; }
        ::selection { background: rgba(139,115,85,0.25); }

        .tg-wrap {
          background: #f5f0e8;
          min-height: 100vh;
          font-family: 'Shippori Mincho', serif;
          color: #3d3028;
          line-height: 2;
          font-size: 16px;
          user-select: none;
          cursor: default;
        }
        .tg-paper {
          max-width: 680px;
          margin: 0 auto;
          padding: 80px 48px 120px;
          background: #faf7f2;
          min-height: 100vh;
          box-shadow: 0 0 60px rgba(0,0,0,0.08);
          position: relative;
        }
        .tg-paper::before {
          content: '';
          position: absolute;
          left: 80px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(200,180,150,0.4);
        }
        .tg-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Noto Sans JP', sans-serif;
          font-size: 11px;
          color: #8b7355;
          cursor: pointer;
          border: none;
          background: transparent;
          margin-bottom: 48px;
          padding: 0;
          letter-spacing: .1em;
          transition: color .2s;
        }
        .tg-back:hover { color: #5c4a32; }
        .tg-meta {
          font-family: 'Noto Sans JP', sans-serif;
          font-size: 11px;
          color: #a89070;
          letter-spacing: .2em;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tg-meta-dot { opacity: .4; }
        .tg-folder {
          font-size: 10px;
          padding: 2px 10px;
          border: 1px solid rgba(139,115,85,0.4);
          border-radius: 2px;
          color: #8b7355;
        }
        .tg-title {
          font-size: clamp(22px, 4vw, 34px);
          font-weight: 700;
          line-height: 1.4;
          color: #2a2018;
          margin-bottom: 16px;
          letter-spacing: .02em;
        }
        .tg-subtitle {
          font-family: 'Noto Sans JP', sans-serif;
          font-size: 13px;
          color: #a89070;
          margin-bottom: 36px;
          font-weight: 300;
        }
        .tg-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 48px;
        }
        .tg-tag {
          font-family: 'Noto Sans JP', sans-serif;
          font-size: 10px;
          padding: 3px 10px;
          border: 1px solid rgba(139,115,85,0.3);
          border-radius: 20px;
          color: #8b7355;
          letter-spacing: .08em;
        }
        .tg-rule {
          border: none;
          border-top: 1px solid rgba(139,115,85,0.2);
          margin: 0 0 40px;
        }
        .tg-p {
          margin-bottom: 20px;
          color: #3d3028;
          font-weight: 400;
        }
        .tg-p strong { color: #2a2018; font-weight: 700; }
        .tg-p em { color: #5c4a32; font-style: italic; }
        .tg-p code {
          background: rgba(139,115,85,0.1);
          padding: 1px 5px;
          border-radius: 2px;
          font-family: monospace;
          font-size: 13px;
        }
        .tg-section {
          font-family: 'Noto Sans JP', sans-serif;
          font-size: 10px;
          letter-spacing: .35em;
          text-transform: uppercase;
          color: #8b7355;
          margin: 56px 0 18px;
          opacity: .8;
        }
        .tg-h2 {
          font-size: 20px;
          font-weight: 700;
          color: #2a2018;
          margin: 40px 0 14px;
          line-height: 1.4;
        }
        .tg-blockquote {
          border-left: 2px solid #c4a882;
          padding: 14px 20px;
          margin: 32px 0;
          background: rgba(196,168,130,0.08);
          border-radius: 0 4px 4px 0;
          color: #5c4a32;
          font-style: italic;
          line-height: 1.9;
        }
        .tg-img {
          display: block;
          width: 100%;
          border-radius: 4px;
          margin: 28px 0;
          border: 1px solid rgba(139,115,85,0.2);
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .tg-divider {
          text-align: center;
          color: #c4a882;
          margin: 48px 0;
          font-size: 14px;
          letter-spacing: .5em;
          opacity: .7;
        }
        .tg-end {
          font-family: 'Noto Sans JP', sans-serif;
          font-size: 12px;
          color: #a89070;
          text-align: right;
          margin-top: 72px;
          padding-top: 24px;
          border-top: 1px solid rgba(139,115,85,0.15);
          line-height: 2;
          letter-spacing: .05em;
        }
        .tg-top-btn {
          position: fixed;
          right: 24px;
          bottom: 32px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #8b7355;
          border: none;
          color: #faf7f2;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(139,115,85,0.35);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .2s;
        }
        .tg-top-btn:hover { background: #5c4a32; }
        @media(max-width:768px) {
          .tg-paper { padding: 40px 24px 80px; }
          .tg-paper::before { display: none; }
          .tg-title { font-size: 22px; }
        }
      `}</style>

      <div className="tg-wrap">
        <div className="tg-paper">
          <button className="tg-back" onClick={() => navigate('/')}>← Back</button>

          <div className="tg-meta">
            <span className="tg-folder">{folder || meta.category}</span>
            <span className="tg-meta-dot">·</span>
            <span>{date}</span>
          </div>

          <h1 className="tg-title">{meta.title}</h1>
          {meta.subtitle && <div className="tg-subtitle">{meta.subtitle}</div>}

          {tags.length > 0 && (
            <div className="tg-tags">
              {tags.map(t => <span key={t} className="tg-tag">{t}</span>)}
            </div>
          )}

          <hr className="tg-rule" />

          <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />

          <div className="tg-end">
            {meta.date}<br />
            {folder || meta.category}<br />
            Please credit when sharing.
          </div>
        </div>

        {showTop && (
          <button className="tg-top-btn" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            ↑
          </button>
        )}
      </div>
    </>
  )
}
