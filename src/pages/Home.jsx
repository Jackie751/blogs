import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const RAW = 'https://raw.githubusercontent.com/Jackie751/articles/refs/heads/main'

const CATS = [
  { key: 'all',     label: '全部',       color: '#00e5ff' },
  { key: 'Opinion', label: '📢 Opinion',  color: '#ff6eb4' },
  { key: 'Journal', label: '🎬 Journal',  color: '#ffd166' },
  { key: 'Focus',   label: '📚 Focus',    color: '#00e5ff' },
  { key: 'Ideas',   label: '💡 Ideas',    color: '#b47eff' },
]

const COLORS = {
  Opinion: '#ff6eb4',
  Journal: '#ffd166',
  Focus:   '#00e5ff',
  Ideas:   '#b47eff',
}

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

export default function Home() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('all')
  const [mon, setMon]           = useState('all')
  const [search, setSearch]     = useState('')
  const [cur, setCur]           = useState(0)
  const [hovered, setHovered]   = useState(null)

  useEffect(() => {
    fetch(`${RAW}/index.json?t=${Date.now()}`)
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
    const tOk = tab === 'all' || a.folder === tab || a.category === tab
    const mOk = mon === 'all' || (a.date || '').startsWith(mon)
    const sOk = !search || (a.title || '').toLowerCase().includes(search.toLowerCase())
    return tOk && mOk && sOk
  })

  function move(dir) {
    if (visible.length < 2) return
    setCur(c => (c + dir + visible.length) % visible.length)
  }

  const months = [...new Set(articles.map(a => (a.date || '').slice(0,7)).filter(Boolean))].sort().reverse()
  const count  = k => k === 'all' ? articles.length : articles.filter(a => a.folder === k || a.category === k).length

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#080b12',color:'#ccd6f0',fontFamily:"'Noto Sans SC',sans-serif",fontSize:14}}>

      {/* 顶栏 */}
      <div style={{display:'flex',alignItems:'center',gap:14,padding:'10px 28px',background:'rgba(20,26,44,0.95)',borderBottom:'1px solid rgba(40,55,90,0.7)',flexShrink:0,backdropFilter:'blur(12px)',zIndex:20}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:'#00e5ff',boxShadow:'0 0 8px #00e5ff',flexShrink:0}} />
        <div>
          <div style={{fontSize:17,fontWeight:900,background:'linear-gradient(270deg,#00e5ff,#ff6eb4,#ffd166,#b47eff,#00e5ff)',backgroundSize:'400% 400%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>柒安的小窝</div>
          <div style={{fontFamily:'monospace',fontSize:10,color:'#4a5878',letterSpacing:'.15em'}}>ARTICLES // PERSONAL BLOG</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}>
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
              style={{padding:'3px 12px',border:`1px solid ${tab===c.key ? c.color : 'rgba(40,55,90,0.7)'}`,color:tab===c.key ? c.color : '#4a5878',background:tab===c.key ? `${c.color}15` : 'transparent',borderRadius:20,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>
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
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <p style={{color:'#4a5878',fontFamily:'monospace',fontSize:12}}>找不到文章</p>
          </div>
        )}

        <button onClick={() => move(-1)} disabled={visible.length <= 1}
          style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',zIndex:30,width:44,height:100,background:'rgba(8,11,18,.6)',border:'1px solid rgba(40,55,90,0.7)',color:'#4a5878',fontSize:24,cursor:'pointer',borderRadius:'0 10px 10px 0',display:'flex',alignItems:'center',justifyContent:'center',opacity:visible.length<=1?.15:1}}>
          ‹
        </button>

        <div style={{position:'relative',width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',transformStyle:'preserve-3d'}}>
          {visible.map((a, i) => {
            const state = IS_MOBILE ? 'center' : getState(i, cur, visible.length)
            const ac = COLORS[a.folder] || COLORS[a.category] || '#00e5ff'
            const isHovered = hovered === a.id && state === 'center'
            const isCurrent = i === cur % visible.length

            return (
              <div key={a.id}
                onClick={state !== 'center' && !IS_MOBILE ? () => setCur(i) : undefined}
                onMouseEnter={() => state === 'center' && setHovered(a.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: IS_MOBILE ? 'relative' : 'absolute',
                  width:'clamp(300px,55vw,680px)',
                  transition:'transform .55s cubic-bezier(.4,0,.2,1),opacity .45s,filter .45s',
                  transform: IS_MOBILE ? 'none' : TRANSFORMS[state],
                  opacity: IS_MOBILE ? 1 : OPACITY[state],
                  zIndex: IS_MOBILE ? 1 : ZINDEX[state],
                  filter: IS_MOBILE ? 'none' : FILTER[state],
                  cursor: state === 'center' ? 'default' : 'pointer',
                  borderRadius:16,
                  display: IS_MOBILE && state === 'hidden' ? 'none' : 'block',
                }}>

                <div style={{
                  borderRadius:16,
                  overflow:'hidden',
                  boxShadow: isHovered ? `0 32px 80px rgba(0,0,0,.9), 0 0 60px ${ac}33` : '0 20px 60px rgba(0,0,0,.7)',
                  transition:'box-shadow .3s, transform .3s',
                  transform: isHovered ? 'translateY(-4px)' : 'none',
                  position:'relative',
                }}>
                  {/* 封面图区域 */}
                  <div style={{position:'relative',width:'100%',height: a.cover ? 340 : 0,overflow:'hidden',background:'#0e1020'}}>
                    {a.cover && (
                      <>
                        <img src={a.cover} alt="" style={{
                          width:'100%', height:'100%', objectFit:'cover', display:'block',
                          transition:'transform .5s', transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }} />
                        {/* 渐变遮罩 */}
                        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(8,11,18,0.95) 100%)'}} />
                      </>
                    )}

                    {/* 标签浮在图片左上角 */}
                    {a.cover && (
                      <div style={{position:'absolute',top:16,left:16,display:'flex',gap:6,flexWrap:'wrap'}}>
                        {isCurrent && (
                          <span style={{fontFamily:'monospace',fontSize:9,padding:'3px 10px',borderRadius:4,background:ac,color:'#000',fontWeight:700,letterSpacing:'.1em'}}>
                            LATEST POST
                          </span>
                        )}
                        <span style={{fontFamily:'monospace',fontSize:9,padding:'3px 10px',borderRadius:4,background:'rgba(0,0,0,0.6)',color:ac,border:`1px solid ${ac}66`,backdropFilter:'blur(8px)',letterSpacing:'.08em'}}>
                          {a.folder || a.category}
                        </span>
                      </div>
                    )}

                    {/* 阅读时间浮在图片右上角 */}
                    {a.cover && a.read_time && (
                      <div style={{position:'absolute',top:16,right:16,fontFamily:'monospace',fontSize:9,padding:'3px 10px',borderRadius:4,background:'rgba(0,0,0,0.6)',color:'#ccd6f0',backdropFilter:'blur(8px)'}}>
                        ⏱ {a.read_time} min
                      </div>
                    )}
                  </div>

                  {/* 卡片底部内容 */}
                  <div style={{background:'rgba(10,13,24,0.97)',borderTop: a.cover ? 'none' : `3px solid ${ac}`,padding:'20px 22px 0'}}>

                    {/* 无封面时显示顶部信息 */}
                    {!a.cover && (
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                        <span style={{fontFamily:'monospace',fontSize:10,padding:'2px 10px',borderRadius:20,border:`1px solid ${ac}`,color:ac}}>{a.folder || a.category}</span>
                        <span style={{fontFamily:'monospace',fontSize:10,color:'#4a5878'}}>{(a.date||'').replace(/-/g,' // ')}</span>
                        {a.read_time && <span style={{fontFamily:'monospace',fontSize:10,color:'#4a5878',marginLeft:'auto'}}>⏱ {a.read_time} min</span>}
                      </div>
                    )}

                    {/* 有封面时日期在标题上方 */}
                    {a.cover && (
                      <div style={{fontFamily:'monospace',fontSize:10,color:'#4a5878',marginBottom:8,letterSpacing:'.1em'}}>
                        {(a.date||'').replace(/-/g,' // ')}
                      </div>
                    )}

                    {/* 标题 */}
                    <h2 style={{fontSize:18,fontWeight:700,lineHeight:1.4,color:'#f0e8d8',marginBottom:10,fontFamily:"'Noto Serif SC',serif",letterSpacing:'.01em'}}>
                      {a.title}
                    </h2>

                    {/* 标签 */}
                    {a.tags?.length > 0 && (
                      <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
                        {a.tags.map(t => (
                          <span key={t} style={{fontFamily:'monospace',fontSize:9,padding:'2px 8px',borderRadius:20,border:`1px solid ${ac}44`,color:`${ac}cc`,letterSpacing:'.05em'}}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 摘要 */}
                    <p style={{fontSize:13,color:'#7a8aaa',lineHeight:1.8,margin:'0 0 16px',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',fontFamily:"'Noto Serif SC',serif",fontWeight:300}}>
                      {a.excerpt}
                    </p>

                    {/* 按钮行 */}
                    <div style={{display:'flex',borderTop:'1px solid rgba(40,55,90,0.5)',margin:'0 -22px'}}>
                      <button onClick={() => navigate(`/article/${a.folder}/${a.id}`)}
                        style={{flex:1,padding:'12px 0',background:'transparent',border:'none',color:ac,fontFamily:'monospace',fontSize:11,letterSpacing:'.1em',cursor:'pointer',transition:'background .2s'}}
                        onMouseEnter={e => e.currentTarget.style.background=`${ac}10`}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        阅读全文 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

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
