import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ArticleTegami from './ArticleTegami.jsx'

const RAW = 'https://raw.githubusercontent.com/Jackie751/articles/refs/heads/main'

function parseMarkdown(md) {
  if (!md) return ''
  md = md.replace(/^---\n.*?\n---\n/s, '')
  const lines = md.split('\n')
  const html = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // 单独一行的 # 忽略
    if (line.trim() === '#') { i++; continue }
    // 底部 Obsidian 内联标签 #xxx 忽略
    if (/^(#[\S]+\s*)+$/.test(line.trim())) { i++; continue }
    if (/^---+$/.test(line.trim())) {
      html.push('<div class="art-divider">· · ·</div>')
      i++; continue
    }
    if (/^## (.+)/.test(line)) {
      html.push(`<div class="art-section-label">${line.replace(/^## /, '')}</div>`)
      i++; continue
    }
    if (/^# (.+)/.test(line)) {
      html.push(`<h1 class="art-h1">${line.replace(/^# /, '')}</h1>`)
      i++; continue
    }
    if (/^!\[.*?\]\((.+?)\)/.test(line)) {
      const url = line.match(/^!\[.*?\]\((.+?)\)/)[1]
      html.push(`<img class="art-img" src="${url}" alt="" loading="lazy">`)
      i++; continue
    }
    if (/^> /.test(line)) {
      const bqLines = []
      while (i < lines.length && /^> /.test(lines[i])) {
        bqLines.push(lines[i].replace(/^> /, ''))
        i++
      }
      html.push(`<blockquote class="art-blockquote"><p>${bqLines.join('<br>')}</p></blockquote>`)
      continue
    }
    if (!line.trim()) { i++; continue }
    const p = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
    html.push(`<p class="art-p">${p}</p>`)
    i++
  }
  return html.join('\n')
}

function ArticleDefault({ meta, content, folder, navigate }) {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const fn = () => setShowTop((window.scrollY || document.documentElement.scrollTop) > 300)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const tags = meta.tags ? meta.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const dateStr = meta.date ? new Date(meta.date + 'T00:00:00').toLocaleDateString('en-US', {month:'long', year:'numeric'}) : ''

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600&display=swap');
        html { overflow-y: overlay !important; height: auto !important; scrollbar-width: thin; scrollbar-color: #c4503a transparent; }
        body { height: auto !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c4503a; border-radius: 4px; }
        ::-webkit-scrollbar-button { display: none; height: 0; }
        .art-wrap{background:#0e0c0a;min-height:100vh;color:#e8ddd0;font-family:'Noto Serif SC',serif;font-weight:600;line-height:1.95;font-size:17px;user-select:none;cursor:default;}
        .art-inner{max-width:720px;margin:0 auto;padding:80px 32px 120px;}
        .art-back{display:inline-flex;align-items:center;gap:6px;font-family:'Noto Sans SC',sans-serif;font-size:11px;letter-spacing:.15em;color:#7a6e63;text-transform:uppercase;cursor:pointer;border:none;background:transparent;margin-bottom:40px;padding:0;transition:color .2s;}
        .art-back:hover{color:#c4503a;}
        .art-eyebrow{font-family:'Noto Sans SC',sans-serif;font-size:11px;letter-spacing:.25em;color:#c4503a;text-transform:uppercase;margin-bottom:28px;opacity:.85;}
        .art-title{font-size:clamp(24px,5vw,38px);font-weight:700;line-height:1.3;color:#f5ece0;margin-bottom:12px;letter-spacing:-.01em;}
        .art-subtitle{font-family:'Noto Sans SC',sans-serif;font-size:14px;color:#7a6e63;margin-bottom:40px;font-weight:300;}
        .art-tags{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 56px;}
        .art-tag{font-family:'Noto Sans SC',sans-serif;font-size:11px;padding:5px 12px;border:1px solid rgba(196,80,58,0.35);border-radius:2px;color:#c4503a;letter-spacing:.05em;opacity:.8;}
        .art-p{margin-bottom:22px;color:#cfc4b4;font-weight:400;}
        .art-p strong{color:#e8ddd0;font-weight:600;}
        .art-p code{background:rgba(196,80,58,0.1);padding:2px 6px;border-radius:3px;font-family:monospace;font-size:14px;color:#e8ddd0;}
        .art-section-label{font-family:'Noto Sans SC',sans-serif;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#c4503a;margin:60px 0 20px;opacity:.7;}
        .art-h1{font-size:clamp(20px,4vw,30px);font-weight:700;color:#f5ece0;margin:40px 0 16px;line-height:1.3;}
        .art-blockquote{border-left:2px solid #c4503a;padding:16px 24px;margin:36px 0;background:rgba(196,80,58,0.06);border-radius:0 4px 4px 0;}
        .art-blockquote p{color:#ddd0be;font-size:16px;margin:0;font-style:italic;font-weight:400;}
        .art-img{display:block;width:100%;border-radius:8px;margin:24px 0;border:1px solid rgba(196,80,58,0.15);}
        .art-divider{text-align:center;color:#7a6e63;margin:52px 0;font-size:18px;letter-spacing:.5em;opacity:.4;}
        .art-end{font-family:'Noto Sans SC',sans-serif;font-size:13px;color:#7a6e63;text-align:center;margin-top:80px;padding-top:32px;border-top:1px solid rgba(255,255,255,0.06);line-height:2;}
        ::selection{background:rgba(196,80,58,0.3);}
        @media(max-width:768px){.art-inner{padding:40px 20px 80px;}.art-title{font-size:24px;}}
      `}</style>
      <div className="art-wrap">
        <div className="art-inner">
          <button className="art-back" onClick={() => navigate('/')}>← Back</button>
          <div className="art-eyebrow">{folder || meta.category} · {dateStr}</div>
          <h1 className="art-title">{meta.title}</h1>
          {meta.subtitle && <div className="art-subtitle">{meta.subtitle}</div>}
          {tags.length > 0 && (
            <div className="art-tags">
              {tags.map(t => <span key={t} className="art-tag">{t}</span>)}
            </div>
          )}
          <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
          <div className="art-end">{meta.date} · {folder || meta.category}<br/>转载请注明出处.</div>
        </div>
        {showTop && (
          <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
            style={{position:'fixed',right:24,bottom:32,width:40,height:40,borderRadius:'50%',background:'#c4503a',border:'none',color:'#fff',fontSize:18,cursor:'pointer',boxShadow:'0 4px 16px rgba(196,80,58,0.4)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
            ↑
          </button>
        )}
      </div>
    </>
  )
}

export default function Article() {
  const { folder, id } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const path = folder ? `${folder}/${id}.md` : `${id}.md`
    fetch(`${RAW}/${path}?t=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error(); return r.text() })
      .then(text => {
        const fm = {}
        const m = text.match(/^---\n(.*?)\n---\n/s)
        if (m) {
          const fmLines = m[1].split('\n')
          let inTags = false
          const tagList = []
          for (const line of fmLines) {
            if (/^tags\s*:\s*$/.test(line)) { inTags = true; continue }
            if (inTags && /^\s+-\s+(.+)/.test(line)) {
              tagList.push(line.match(/^\s+-\s+(.+)/)[1].trim())
              continue
            }
            if (inTags && line.trim() && !line.startsWith(' ')) inTags = false
            if (!inTags && line.includes(':')) {
              const [k, ...v] = line.split(':')
              fm[k.trim()] = v.join(':').trim()
            }
          }
          if (tagList.length) fm.tags = tagList.join(',')
        }
        setMeta(fm)
        setContent(text)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [folder, id])

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0e0c0a',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{fontFamily:'monospace',color:'#7a6e63',fontSize:12,letterSpacing:'.2em'}}>LOADING...</p>
    </div>
  )

  if (error) return (
    <div style={{minHeight:'100vh',background:'#0e0c0a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
      <p style={{color:'#7a6e63',fontFamily:'monospace'}}>找不到这篇文章</p>
      <button onClick={() => navigate('/')} style={{background:'transparent',border:'1px solid rgba(196,80,58,0.4)',color:'#c4503a',padding:'6px 18px',borderRadius:6,cursor:'pointer',fontFamily:'monospace',fontSize:12}}>← Back</button>
    </div>
  )

  if (meta.template === 'tegami') {
    return <ArticleTegami meta={meta} content={content} folder={folder} />
  }

  return <ArticleDefault meta={meta} content={content} folder={folder} navigate={navigate} />
}
