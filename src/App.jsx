import React, { useState, useEffect } from 'react'

const COLORS = { '影评': '#ff6eb4', '随笔': '#ffd166', '分析': '#00e5ff', '其他': '#b47eff' }
const CATS = [
  { key: 'all', label: '全部' },
  { key: '影评', label: '🎬 影评' },
  { key: '随笔', label: '✍️ 随笔' },
  { key: '分析', label: '🔍 分析' },
  { key: '其他', label: '📄 其他' },
]

const IS_MOBILE = window.innerWidth <= 768

function getState(i, cur, total) {
  const off = ((i - cur) % total + total) % total
  const o = off > total / 2 ? off - total : off
  return { 0: 'center', 1: 'right1', '-1': 'left1', 2: 'right2', '-2': 'left2' }[o] || 'hidden'
}

const TRANSFORMS = {
  center:  'translateX(0) scale(1) rotateY(0deg)',
  left1:   'translateX(-60%) scale(.82) rotateY(22deg)',
  right1:  'translateX(60%) scale(.82) rotateY(-22deg)',
  left2:   'translateX(-85%) scale(.66) rotateY(32deg)',
  right2:  'translateX(85%) scale(.66) rotateY(-32deg)',
  hidden:  'translateX(0) scale(0)',
}
const OPACITY = { center: 1, left1: .5, right1: .5, left2: .2, right2: .2, hidden: 0 }
const ZINDEX  = { center: 5, left1: 4, right1: 4, left2: 3, right2: 3, hidden: 1 }
const FILTER  = { center: 'none', left1: 'brightness(.6)', right1: 'brightness(.6)', left2: 'brightness(.4)', right2: 'brightness(.4)', hidden: 'none' }

export default function App() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('all')
  const [mon, setMon]           = useState('all')
  const [search, setSearch]     = useState('')
  const [cur, setCur]           = useState(0)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/Jackie751/articles/refs/heads/main/index.json?t=' + Date.now())
      .then(r => r.json())
      .then(d => { setArticles(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const fn = e => {
      if (IS_MOBILE) return
      if (document.activeElement?.tagName === 'INPUT') return
      if (e.key === 'ArrowLeft')  move(-1)
      if (e.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  })

  const visible = articles.filter(a => {
    const tOk = tab === 'all' || a.category === tab
    const mOk = mon === 'all' || (a.date || '').startsWith(mon)
    const sOk = !search || (a.title || '').toLowerCase().includes(search.toLowerCase())
    return tOk && mOk && sOk
  })

  function move(dir) {
    if (visible.length < 2) return
    setCur(c => (c + dir + visible.length) % visible.length)
  }

  const months = [...new Set(articles.map(a => (a.date || '').slice(0,7)).filter(Boolean))].sort().reverse()
  const count  = k => k === 'all' ? articles.length : articles.filter(a => a.category === k).length

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#080b12',color:'#ccd6f0',fontFamily:"'Noto Sans SC',sans-serif",fontSize:14}}>

      {/* 顶栏 */}
      <div style={{display:'flex',alignItems:'center',gap:14,padding:'10px 28px',background:'rgba(20,26,44,0.95)',borderBottom:'1px solid rgba(40,55,90,0.7)',flexShrink:0,backdropFilter:'blur(12px)',zIndex:20}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:'#00e5ff',boxShadow:'0 0 8px #00e5ff',flexShrink:0}} />
        <div>
          <div style={{fontSize:17,fontWeight:900,background:'linear-gradient(270deg,#00e5ff,#ff6eb4,#ffd166,#b47eff,#00e5ff)',backgroundSize:'400% 400%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>柒安的文章</div>
          <div style={{fontFamily:'monospace',fontSize:10,color:'#4a5878',letterSpacing:'.15em'}}>ARTICLES // PERSONAL BLOG</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCur(0) }}
            placeholder="搜索..."
            style={{padding:'5px 12px',background:'rgba(0,0,0,.3)',border:'1px solid rgba(40,55,90,0.7)',borderRadius:20,color:'#ccd6f0',fontFamily:'monospace',fontSize:11,outline:'none',width:160}}
          />
          <a href="https://index.jackie3137.xyz" target="_blank" rel="noopener"
            style={{display:'inline-flex',alignItems:'center',padding:'5px 14px',borderRadius:20,border:'1px solid rgba(40,55,90,0.7)',color:'#8a99c0',fontFamily:'monospace',fontSize:10,textDecoration:'none'}}>
            ⌂ 主页
          </a>
        </div>
      </div>

      {/* 过滤栏 */}
      <div style={{background:'rgba(20,26,44,0.95)',borderBottom:'1px solid rgba(40,55,90,0.7)',flexShrink:0}}>
        <div style={{display:'flex',gap:8,padding:'8px 28px',flexWrap:'wrap',alignItems:'center'}}>
          {CATS.map(c => (
            <button key={c.key} onClick={() => { setTab(c.key); setCur(0) }}
              style={{padding:'3px 12px',border:`1px solid ${tab===c.key?'#00e5ff':'rgba(40,55,90,0.7)'}`,color:tab===c.key?'#00e5ff':'#4a5878',background:tab===c.key?'rgba(0,229,255,.07)':'transparent',borderRadius:20,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>
              {c.label} ({count(c.key)})
            </button>
          ))}
        </div>
        {months.length > 0 && (
          <div style={{display:'flex',gap:8,padding:'6px 28px',flexWrap:'wrap',alignItems:'center',borderTop:'1px solid rgba(40,55,90,0.3)'}}>
            {['all', ...months].map(m => (
              <button key={m} onClick={() => { setMon(m); setCur(0) }}
                style={{padding:'3px 12px',border:`1px solid ${mon===m?'#ffd166':'rgba(40,55,90,0.7)'}`,color:mon===m?'#ffd166':'#4a5878',background:mon===m?'rgba(255,209,102,.07)':'transparent',borderRadius:20,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>
                {m === 'all' ? '全部' : m.replace('-','年')+'月'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 舞台 */}
      <div style={{flex:1,position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',perspective:1400}}>

        {loading && <p style={{color:'#4a5878',fontFamily:'monospace',fontSize:12}}>LOADING...</p>}

        {!loading && visible.length === 0 && (
          <p style={{color:'#4a5878',fontFamily:'monospace',fontSize:12}}>找不到文章</p>
        )}

        {/* 左箭头 */}
        <button onClick={() => move(-1)} disabled={visible.length <= 1}
          style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',zIndex:30,width:44,height:100,background:'rgba(8,11,18,.6)',border:'1px solid rgba(40,55,90,0.7)',color:'#4a5878',fontSize:24,cursor:'pointer',borderRadius:'0 10px 10px 0',display:'flex',alignItems:'center',justifyContent:'center',opacity:visible.length<=1?.15:1}}>
          ‹
        </button>

        {/* 卡片 */}
        <div style={{position:'relative',width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',transformStyle:'preserve-3d'}}>
          {visible.map((a, i) => {
            const state = getState(i, cur, visible.length)
            const ac = COLORS[a.category] || '#00e5ff'
            const isExp = !!expanded[a.id]
            return (
              <div key={a.id}
                onClick={state !== 'center' ? () => setCur(i) : undefined}
                style={{
                  position:'absolute',
                  width:'clamp(340px,60vw,780px)',
                  maxHeight:'calc(100% - 40px)',
                  transition:'transform .55s cubic-bezier(.4,0,.2,1),opacity .45s,filter .45s',
                  transform: TRANSFORMS[state],
                  opacity: OPACITY[state],
                  zIndex: ZINDEX[state],
                  filter: FILTER[state],
                  cursor: state === 'center' ? 'default' : 'pointer',
                  borderRadius:14,
                }}>
                <div style={{background:'rgba(14,18,32,0.92)',borderRadius:14,border:'1px solid rgba(40,55,90,0.7)',borderTop:`3px solid ${ac}`,boxShadow:'0 16px 56px rgba(0,0,0,.6)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
                  {/* 卡头 */}
                  <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 18px',background:'rgba(20,26,44,0.95)',borderBottom:'1px solid rgba(40,55,90,0.7)',flexShrink:0}}>
                    <span style={{fontFamily:'monospace',fontSize:10,padding:'2px 10px',borderRadius:20,border:`1px solid ${ac}`,color:ac}}>{a.category || '文章'}</span>
                    <span style={{fontFamily:'monospace',fontSize:10,color:'#4a5878'}}>{(a.date||'').replace(/-/g,' // ')}</span>
                  </div>
                  {/* 标题 */}
                  <h2 style={{padding:'14px 18px 6px',fontSize:16,fontWeight:700,lineHeight:1.4,flexShrink:0,fontFamily:"'Noto Serif SC',serif"}}>{a.title}</h2>
                  {/* 正文 */}
                  <div style={{padding:'6px 18px 0',fontSize:13,color:'#8a99c0',lineHeight:1.85,maxHeight:isExp?'60vh':'220px',overflow:isExp?'auto':'hidden',fontFamily:"'Noto Serif SC',serif",fontWeight:300}}>
                    <p style={{margin:'0 0 10px',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{a.excerpt}</p>
                  </div>
                  {/* 渐变遮罩 */}
                  {!isExp && <div style={{height:60,background:'linear-gradient(to bottom,transparent,rgba(14,18,32,0.96))',pointerEvents:'none',flexShrink:0}} />}
                  {/* 展开按钮 */}
                  <button onClick={() => setExpanded(p => ({...p,[a.id]:!p[a.id]}))}
                    style={{display:'flex',alignItems:'center',justifyContent:'center',gap:5,width:'100%',padding:'7px 0 12px',background:'transparent',border:'none',borderTop:'1px solid rgba(40,55,90,0.7)',color:ac,fontFamily:'monospace',fontSize:11,letterSpacing:'.08em',cursor:'pointer',flexShrink:0}}>
                    <span>{isExp?'收起全文':'展开全文'}</span>
                    <span style={{display:'inline-block',transform:isExp?'rotate(180deg)':'none',transition:'transform .3s',fontSize:10}}>▾</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 右箭头 */}
        <button onClick={() => move(1)} disabled={visible.length <= 1}
          style={{position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',zIndex:30,width:44,height:100,background:'rgba(8,11,18,.6)',border:'1px solid rgba(40,55,90,0.7)',color:'#4a5878',fontSize:24,cursor:'pointer',borderRadius:'10px 0 0 10px',display:'flex',alignItems:'center',justifyContent:'center',opacity:visible.length<=1?.15:1}}>
          ›
        </button>
      </div>

      {/* 底部 dots */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'8px 0',background:'rgba(20,26,44,0.95)',borderTop:'1px solid rgba(40,55,90,0.7)',flexShrink:0}}>
        <div style={{display:'flex',gap:7}}>
          {visible.slice(0,15).map((_,i) => (
            <button key={i} onClick={() => setCur(i)}
              style={{width:i===cur%15?20:6,height:6,borderRadius:i===cur%15?3:'50%',background:i===cur%15?'#00e5ff':'rgba(40,55,90,0.7)',border:'none',cursor:'pointer',transition:'all .25s'}} />
          ))}
        </div>
        <div style={{fontFamily:'monospace',fontSize:10,color:'#4a5878'}}>
          {visible.length > 0 ? `${cur+1} / ${visible.length}` : '// 暂无'}
        </div>
      </div>
    </div>
  )
}
