import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchIndex, fetchArticle } from '../github.js'
import { parseMarkdown } from '../markdown.js'

const CATEGORIES = [
  { key: 'all',   label: '全部',   icon: '' },
  { key: '影评',  label: '🎬 影评', icon: '🎬' },
  { key: '随笔',  label: '✍️ 随笔', icon: '✍️' },
  { key: '分析',  label: '🔍 分析', icon: '🔍' },
  { key: '其他',  label: '📄 其他', icon: '📄' },
]

const CAT_COLORS = {
  '影评': '#ff6eb4',
  '随笔': '#ffd166',
  '分析': '#00e5ff',
  '其他': '#b47eff',
}

const IS_MOBILE = () => window.innerWidth <= 768

export default function Home() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [activeMon, setActiveMon] = useState('all')
  const [searchQ, setSearchQ]     = useState('')
  const [cur, setCur]             = useState(0)
  const [expanded, setExpanded]   = useState({})
  const [bodies, setBodies]       = useState({})  // id -> full content
  const [loadingBody, setLoadingBody] = useState({})

  useEffect(() => {
    fetchIndex().then(data => {
      setArticles(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // 键盘导航
  useEffect(() => {
    const handler = (e) => {
      if (IS_MOBILE()) return
      if (document.activeElement?.tagName === 'INPUT') return
      if (e.key === 'ArrowLeft')  move(-1)
      if (e.key === 'ArrowRight') move(+1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const visible = articles.filter(a => {
    const tabOk = activeTab === 'all' || a.category === activeTab
    const monOk = activeMon === 'all' || a.date?.startsWith(activeMon)
    const qOk   = !searchQ || a.title?.toLowerCase().includes(searchQ.toLowerCase())
    return tabOk && monOk && qOk
  })

  function move(dir) {
    if (visible.length < 2) return
    setCur(c => (c + dir + visible.length) % visible.length)
  }

  function getState(vi) {
    const len = visible.length
    const off  = ((vi - cur) % len + len) % len
    const offN = off > len / 2 ? off - len : off
    const map  = { 0: 'center', 1: 'right1', '-1': 'left1', 2: 'right2', '-2': 'left2' }
    return map[offN] || 'hidden'
  }

  // 懒加载文章正文
  async function loadBody(article) {
    if (bodies[article.id] || loadingBody[article.id]) return
    setLoadingBody(p => ({ ...p, [article.id]: true }))
    try {
      const full = await fetchArticle(article.id)
      setBodies(p => ({ ...p, [article.id]: full.content || '' }))
    } catch {
      setBodies(p => ({ ...p, [article.id]: article.excerpt || '（无法加载内容）' }))
    }
    setLoadingBody(p => ({ ...p, [article.id]: false }))
  }

  function toggleExpand(article) {
    const id = article.id
    if (!expanded[id]) loadBody(article)
    setExpanded(p => ({ ...p, [id]: !p[id] }))
  }

  // 月份列表
  const months = [...new Set(articles.map(a => a.date?.slice(0, 7)).filter(Boolean))].sort().reverse()

  // 分类计数
  const count = (key) => key === 'all'
    ? articles.length
    : articles.filter(a => a.category === key).length

  return (
    <>
      {/* 顶栏 */}
      <div className="topbar">
        <div className="live-dot" />
        <div>
          <div className="topbar-title grad-text">柒安的文章</div>
          <div className="topbar-sub">ARTICLES // PERSONAL BLOG</div>
        </div>
        <div className="topbar-right">
          <button className="nav-link" onClick={() => navigate('/editor')}>
            ✏️ 写文章
          </button>
          <a className="nav-link" href="https://index.jackie3137.xyz" target="_blank" rel="noopener">
            ⌂ 主页
          </a>
        </div>
      </div>

      {/* 过滤栏 */}
      <div className="bars">
        <div className="bar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`fb ${activeTab === cat.key ? 'on' : ''}`}
              onClick={() => { setActiveTab(cat.key); setCur(0) }}
            >
              {cat.label} ({count(cat.key)})
            </button>
          ))}
        </div>
        {months.length > 0 && (
          <div className="bar">
            <button
              className={`mb ${activeMon === 'all' ? 'active' : ''}`}
              onClick={() => { setActiveMon('all'); setCur(0) }}
            >全部</button>
            {months.map(m => (
              <button
                key={m}
                className={`mb ${activeMon === m ? 'active' : ''}`}
                onClick={() => { setActiveMon(m); setCur(0) }}
              >
                {m.replace('-', '年')}月
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 主舞台 */}
      <div className="stage">
        {loading && (
          <div className="no-result">
            <p style={{ fontFamily: 'var(--mono)', color: 'var(--dim)' }}>LOADING...</p>
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="no-result">
            <p>（找不到文章）<br />换个条件试试？</p>
          </div>
        )}

        <button className="nav-btn prev" onClick={() => move(-1)} disabled={visible.length <= 1}>‹</button>

        <div className="carousel">
          {visible.map((article, vi) => {
            const state = IS_MOBILE() ? (visible.includes(article) ? 'center' : 'hidden') : getState(vi)
            const ac    = CAT_COLORS[article.category] || '#00e5ff'
            const isExp = !!expanded[article.id]
            const bodyContent = bodies[article.id] || article.excerpt || ''

            return (
              <div
                key={article.id}
                className="slide"
                data-state={state}
                onClick={state !== 'center' && !IS_MOBILE() ? () => setCur(vi) : undefined}
              >
                <div className="slide-inner" style={{ '--ac': ac }}>
                  {/* 头部 */}
                  <div className="s-head">
                    <span className="s-badge">{article.category || '文章'}</span>
                    <span className="s-date">{article.date?.replace(/-/g, ' // ')}</span>
                    <button
                      className="nav-link"
                      style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: '10px' }}
                      onClick={() => navigate(`/editor/${article.id}`)}
                    >
                      ✏️ 编辑
                    </button>
                  </div>

                  {/* 标题 */}
                  <h2 className="s-title">{article.title}</h2>

                  {/* 正文 */}
                  <div className={`s-body ${isExp ? 'expanded' : 'collapsed'}`}>
                    {isExp && bodyContent
                      ? <div dangerouslySetInnerHTML={{ __html: parseMarkdown(bodyContent) }} />
                      : <p style={{ color: 'var(--txt2)' }}>{article.excerpt}</p>
                    }
                    {loadingBody[article.id] && (
                      <p style={{ color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: '11px' }}>加载中...</p>
                    )}
                  </div>

                  {!isExp && <div className="s-body-fade" />}

                  <button className="s-expand-btn" onClick={() => toggleExpand(article)}>
                    <span>{isExp ? '收起全文' : '展开全文'}</span>
                    <span className={`s-exp-arrow ${isExp ? 'open' : ''}`}>▾</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <button className="nav-btn next" onClick={() => move(1)} disabled={visible.length <= 1}>›</button>
      </div>

      {/* 底部 dots */}
      <div className="bottom">
        <div className="dots">
          {visible.slice(0, 15).map((_, i) => (
            <button key={i} className={`dot-item ${i === cur % 15 ? 'on' : ''}`} onClick={() => setCur(i)} />
          ))}
        </div>
        <div className="counter">{visible.length > 0 ? `${cur + 1} / ${visible.length}` : '// 暂无'}</div>
      </div>
    </>
  )
}
