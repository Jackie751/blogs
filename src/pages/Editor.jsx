import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { pushFile, getFileSha, fetchArticle, fetchIndex } from '../github.js'
import { parseMarkdown } from '../markdown.js'

const CATEGORIES = ['影评', '随笔', '分析', '其他']

function genId(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) + '-' + Date.now().toString(36)
}

export default function Editor() {
  const navigate   = useNavigate()
  const { id }     = useParams()
  const textareaRef = useRef(null)

  const [token,    setToken]    = useState(() => localStorage.getItem('gh_token') || '')
  const [title,    setTitle]    = useState('')
  const [category, setCategory] = useState('随笔')
  const [tags,     setTags]     = useState('')
  const [content,  setContent]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [status,   setStatus]   = useState('')   // '', 'ok', 'err'
  const [statusMsg, setStatusMsg] = useState('')
  const [articleId, setArticleId] = useState(id || null)
  const [showToken, setShowToken] = useState(!token)

  // 编辑模式：加载已有文章
  useEffect(() => {
    if (!id) return
    fetchArticle(id).then(a => {
      setTitle(a.title || '')
      setCategory(a.category || '随笔')
      setTags((a.tags || []).join(', '))
      setContent(a.content || '')
      setArticleId(id)
    }).catch(() => setStatusMsg('加载文章失败'))
  }, [id])

  function saveToken(t) {
    setToken(t)
    localStorage.setItem('gh_token', t)
  }

  // 插入语法快捷键
  function insert(before, after = '') {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const sel   = content.slice(start, end) || '文字'
    const newContent = content.slice(0, start) + before + sel + after + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + sel.length)
    }, 0)
  }

  async function handleSave() {
    if (!token) { setShowToken(true); return }
    if (!title.trim()) { setStatusMsg('请填写标题'); setStatus('err'); return }
    if (!content.trim()) { setStatusMsg('内容不能为空'); setStatus('err'); return }

    setSaving(true)
    setStatus('')
    setStatusMsg('推送中...')

    try {
      const aid   = articleId || genId(title)
      const today = new Date().toISOString().slice(0, 10)
      const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean)

      const articleData = {
        id: aid,
        title: title.trim(),
        category,
        tags: tagArr,
        date: today,
        excerpt: content.slice(0, 120).replace(/[#*>\n]/g, '').trim() + '…',
        content: content,
      }

      // 推送文章 JSON
      const articlePath = `articles/${aid}.json`
      const articleSha  = await getFileSha(articlePath, token)
      await pushFile(articlePath, articleData, `${id ? 'update' : 'add'}: ${title}`, token, articleSha)

      // 更新 index.json
      let index = []
      try {
        const res = await fetch(`https://raw.githubusercontent.com/Jackie751/articles/main/index.json?t=${Date.now()}`)
        if (res.ok) index = await res.json()
      } catch {}

      const indexEntry = { id: aid, title: title.trim(), category, tags: tagArr, date: today, excerpt: articleData.excerpt }
      const existing   = index.findIndex(a => a.id === aid)
      if (existing >= 0) index[existing] = indexEntry
      else index.unshift(indexEntry)

      const indexSha = await getFileSha('index.json', token)
      await pushFile('index.json', index, `index: ${title}`, token, indexSha)

      setArticleId(aid)
      setStatus('ok')
      setStatusMsg('✓ 已推送到 GitHub')
      if (!id) navigate(`/editor/${aid}`, { replace: true })
    } catch (e) {
      setStatus('err')
      setStatusMsg('✗ ' + e.message)
    }
    setSaving(false)
  }

  const preview = parseMarkdown(content)

  return (
    <div className="editor-page">
      {/* 顶栏 */}
      <div className="topbar">
        <div className="live-dot" />
        <div>
          <div className="topbar-title grad-text">{id ? '编辑文章' : '写新文章'}</div>
          <div className="topbar-sub">EDITOR // MARKDOWN</div>
        </div>
        <div className="topbar-right">
          <button className="nav-link" onClick={() => navigate('/')}>← 返回列表</button>
          {token
            ? <button className="nav-link" onClick={() => setShowToken(t => !t)}>🔑 Token</button>
            : <button className="nav-link" style={{ color: '#ff6eb4', borderColor: '#ff6eb4' }} onClick={() => setShowToken(true)}>⚠️ 设置 Token</button>
          }
        </div>
      </div>

      {/* Token 设置条 */}
      {showToken && (
        <div style={{ background: 'rgba(196,80,58,0.08)', borderBottom: '1px solid rgba(196,80,58,0.3)', padding: '10px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--dim)', whiteSpace: 'nowrap' }}>GitHub Token:</span>
          <input
            type="password"
            className="meta-input"
            style={{ flex: 1, maxWidth: 400 }}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={token}
            onChange={e => saveToken(e.target.value)}
          />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--dim)' }}>
            需要 repo 权限 · 仅存本地
          </span>
          <button className="nav-link" onClick={() => setShowToken(false)}>✕</button>
        </div>
      )}

      {/* 文章元信息 */}
      <div className="editor-meta">
        <input
          className="meta-input title-input"
          placeholder="文章标题..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <select className="tag-select" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          className="meta-input tags-input"
          placeholder="标签，用逗号分隔"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />
      </div>

      {/* 编辑器主体 */}
      <div className="editor-body">
        {/* 左：编辑区 */}
        <div className="editor-panel">
          <div className="panel-label">MARKDOWN 编辑</div>
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            placeholder={`开始写作...\n\n支持 Markdown 语法：\n# 大标题\n## 小标题\n**粗体** *斜体*\n> 引用块\n---（分割线）`}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        {/* 右：预览区 */}
        <div className="preview-panel">
          <div className="panel-label">预览</div>
          <div
            className="preview-scroll"
            dangerouslySetInnerHTML={{ __html: preview || '<p style="color:var(--dim);font-family:var(--mono);font-size:12px">在左侧开始输入...</p>' }}
          />
        </div>
      </div>

      {/* 工具栏 */}
      <div className="editor-toolbar">
        <button className="tool-btn" onClick={() => insert('# ')}>H1</button>
        <button className="tool-btn" onClick={() => insert('## ')}>H2</button>
        <button className="tool-btn" onClick={() => insert('**', '**')}>粗体</button>
        <button className="tool-btn" onClick={() => insert('*', '*')}>斜体</button>
        <button className="tool-btn" onClick={() => insert('> ')}>引用</button>
        <button className="tool-btn" onClick={() => insert('\n---\n')}>分割线</button>
        <button className="tool-btn" onClick={() => insert('\n\n')}>换段</button>

        {statusMsg && (
          <span className={`save-status ${status}`}>{statusMsg}</span>
        )}

        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'PUSHING...' : '保存 → GitHub'}
        </button>
      </div>
    </div>
  )
}
