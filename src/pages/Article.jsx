import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const RAW = 'https://raw.githubusercontent.com/Jackie751/articles/main'

function parseMarkdown(md) {
  if (!md) return ''
  const lines = md.split('\n')
  const html = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // 分割线
    if (/^---+$/.test(line.trim())) {
      html.push('<div class="art-divider">· · ·</div>')
      i++; continue
    }
    // section-label (## xxx)
    if (/^## (.+)/.test(line)) {
      html.push(`<div class="art-section-label">${line.replace(/^## /, '')}</div>`)
      i++; continue
    }
    // h1
    if (/^# (.+)/.test(line)) {
      html.push(`<h1 class="art-h1">${line.replace(/^# /, '')}</h1>`)
      i++; continue
    }
    // blockquote（连续多行）
    if (/^> /.test(line)) {
      const bqLines = []
      while (i < lines.length && /^> /.test(lines[i])) {
        bqLines.push(lines[i].replace(/^> /, ''))
        i++
      }
      html.push(`<blockquote class="art-blockquote"><p>${bqLines.join('<br>')}</p></blockquote>`)
      continue
    }
    // pull-quote（以 === 开头结尾）
    if (line.trim() === '===') {
      const pqLines = []
      i++
      while (i < lines.length && lines[i].trim() !== '===') {
        pqLines.push(lines[i])
        i++
      }
      i++ // skip closing ===
      const pqContent = pqLines.join('<br>').replace(/\*\*(.+?)\*\*/g, '<span class="art-accent">$1</span>')
      html.push(`<div class="art-pull-quote">${pqContent}</div>`)
      continue
    }
    // 空行跳过
    if (!line.trim()) { i++; continue }
    // 普通段落
    const p = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
    html.push(`<p class="art-p">${p}</p>`)
    i++
  }
  return html.join('\n')
}

export default function Article() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${RAW}/articles/${id}.json?t=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setArticle(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0e0c0a',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{fontFamily:'monospace',color:'#7a6e63',fontSize:12}}>LOADING...</p>
    </div>
  )

  if (error || !article) return (
    <div style={{minHeight:'100vh',background:'#0e0c0a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
      <p style={{color:'#7a6e63',fontFamily:'monospace'}}>找不到这篇文章</p>
      <button onClick={() => navigate('/')} style={{background:'transparent',border:'1px solid rgba(196,80,58,0.4)',color:'#c4503a',padding:'6px 18px',borderRadius:6,cursor:'pointer',fontFamily:'monospace',fontSize:12}}>← 返回</button>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&family=Noto+Sans+SC:wght@300;400&display=swap');
        .art-wrap{background:#0e0c0a;min-height:100vh;color:#e8ddd0;font-family:'Noto Serif SC',serif;font-weight:300;line-height:1.95;font-size:17px;}
        .art-inner{max-width:720px;margin:0 auto;padding:80px 32px 120px;}
        .art-back{display:inline-flex;align-items:center;gap:6px;font-family:'Noto Sans SC',sans-serif;font-size:11px;letter-spacing:.15em;color:#7a6e63;text-transform:uppercase;cursor:pointer;border:none;background:transparent;margin-bottom:40px;padding:0;transition:color .2s;}
        .art-back:hover{color:#c4503a;}
        .art-eyebrow{font-family:'Noto Sans SC',sans-serif;font-size:11px;letter-spacing:.25em;color:#c4503a;text-transform:uppercase;margin-bottom:28px;opacity:.85;}
        .art-title{font-size:clamp(24px,5vw,38px);font-weight:700;line-height:1.3;color:#f5ece0;margin-bottom:12px;letter-spacing:-.01em;}
        .art-subtitle{font-family:'Noto Sans SC',sans-serif;font-size:14px;color:#7a6e63;margin-bottom:40px;font-weight:300;}
        .art-tags{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 56px;}
        .art-tag{font-family:'Noto Sans SC',sans-serif;font-size:11px;padding:5px 12px;border:1px solid rgba(196,80,58,0.35);border-radius:2px;color:#c4503a;letter-spacing:.05em;opacity:.8;}
        .art-p{margin-bottom:22px;color:#cfc4b4;}
        .art-p strong{color:#e8ddd0;font-weight:600;}
        .art-section-label{font-family:'Noto Sans SC',sans-serif;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#c4503a;margin:60px 0 20px;opacity:.7;}
        .art-h1{font-size:clamp(20px,4vw,30px);font-weight:700;color:#f5ece0;margin:40px 0 16px;line-height:1.3;}
        .art-blockquote{border-left:2px solid #c4503a;padding:16px 24px;margin:36px 0;background:rgba(196,80,58,0.06);border-radius:0 4px 4px 0;}
        .art-blockquote p{color:#ddd0be;font-size:16px;margin:0;font-style:italic;}
        .art-pull-quote{font-size:clamp(20px,4vw,28px);font-weight:600;color:#f0e6d6;line-height:1.4;padding:40px 0;border-top:1px solid rgba(196,80,58,0.2);border-bottom:1px solid rgba(196,80,58,0.2);margin:48px 0;text-align:center;letter-spacing:-.01em;}
        .art-accent{color:#c4503a;}
        .art-divider{text-align:center;color:#7a6e63;margin:52px 0;font-size:18px;letter-spacing:.5em;opacity:.4;}
        .art-end{font-family:'Noto Sans SC',sans-serif;font-size:13px;color:#7a6e63;text-align:center;margin-top:80px;padding-top:32px;border-top:1px solid rgba(255,255,255,0.06);line-height:2;}
        ::selection{background:rgba(196,80,58,0.3);}
      `}</style>
      <div className="art-wrap">
        <div className="art-inner">
          <button className="art-back" onClick={() => navigate('/')}>← 返回列表</button>
          <div className="art-eyebrow">{article.category} · 深度分析 · {article.date?.slice(0,4)}</div>
          <h1 className="art-title">{article.title}</h1>
          {article.subtitle && <div className="art-subtitle">{article.subtitle}</div>}
          {article.tags?.length > 0 && (
            <div className="art-tags">
              {article.tags.map(t => <span key={t} className="art-tag">{t}</span>)}
            </div>
          )}
          <div dangerouslySetInnerHTML={{ __html: parseMarkdown(article.content || '') }} />
          <div className="art-end">{article.date} · {article.category}<br/>转载请注明出处</div>
        </div>
      </div>
    </>
  )
}
