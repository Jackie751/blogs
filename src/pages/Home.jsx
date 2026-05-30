import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const RAW = 'https://raw.githubusercontent.com/Jackie751/articles/refs/heads/main'

const CATS = [
  { key: 'all',     label: 'ALL' },
  { key: 'Opinion', label: 'OPINION' },
  { key: 'Journal', label: 'JOURNAL' },
  { key: 'Focus',   label: 'FOCUS' },
  { key: 'Ideas',   label: 'IDEAS' },
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
  center:  'translateX(0) scale(1)',
  left1:   'translateX(-58%) scale(.78)',
  right1:  'translateX(58%) scale(.78)',
  left2:   'translateX(-82%) scale(.60)',
  right2:  'translateX(82%) scale(.60)',
  hidden:  'translateX(0) scale(0)',
}
const OPACITY = { center: 1, left1: .35, right1: .35, left2: .12, right2: .12, hidden: 0 }
const ZINDEX  = { center: 5, left1: 4, right1: 4, left2: 3, right2: 3, hidden: 1 }

function Card({ a, ac, isHovered, isCurrent, navigate, mobile }) {
  return (
    <div style={{
      borderRadius: 4,
      overflow: 'hidden',
      background: '#060608',
      transition: 'transform .4s, box-shadow .4s',
      transform: isHovered ? 'translateY(-8px)' : 'none',
      boxShadow: isHovered ? `0 48px 96px rgba(0,0,0,.95)` : '0 24px 64px rgba(0,0,0,.7)',
    }}>
      {a.cover ? (
        <div style={{position:'relative', width:'100%', paddingTop: mobile ? '125%' : '145%', overflow:'hidden'}}>
          <img src={a.cover} alt="" style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover',
            transition:'transform .6s',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          }} />
          {/* 渐变 */}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(6,6,8,0.7) 60%, rgba(6,6,8,0.97) 100%)'}} />

          {/* 顶部小标签 */}
          <div style={{position:'absolute',top:16,left:16,display:'flex',gap:8,alignItems:'center'}}>
            {isCurrent && (
              <span style={{fontFamily:'monospace',fontSize:11,padding:'2px 8px',letterSpacing:'.15em',background:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.7)',backdropFilter:'blur(8px)',borderRadius:2}}>
                LATEST
              </span>
            )}
            <span style={{fontFamily:'monospace',fontSize:11,padding:'2px 8px',letterSpacing:'.15em',color:ac,background:`${ac}18`,backdropFilter:'blur(8px)',borderRadius:2}}>
              {(a.folder||a.category||'').toUpperCase()}
            </span>
          </div>

          {/* 右上阅读时间 */}
          {a.read_time && (
            <div style={{position:'absolute',top:16,right:16,fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,0.45)',letterSpacing:'.1em'}}>
              {a.read_time} MIN
            </div>
          )}

          {/* 底部文字区 */}
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 0'}}>
            <div style={{fontFamily:'monospace',fontSize:12,color:'rgba(255,255,255,0.3)',letterSpacing:'.15em',marginBottom:8}}>
              {(a.date||'').replace(/-/g,' · ')}
            </div>
            <h2 style={{
              fontSize: mobile ? 18 : 20,
              fontWeight:700,
              lineHeight:1.3,
              color:'#fff',
              margin:'0 0 10px',
              fontFamily:"'Noto Serif SC',serif",
              letterSpacing:'.01em',
            }}>
              {a.title}
            </h2>
            {a.tags?.length > 0 && (
              <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
                {a.tags.slice(0,3).map(t => (
                  <span key={t} style={{fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,0.4)',letterSpacing:'.1em'}}>
                    #{t}
                  </span>
                ))}
              </div>
            )}
            <p style={{
              fontSize:11,
              color:'rgba(255,255,255,0.4)',
              lineHeight:1.8,
              margin:0,
              display:'-webkit-box',
              WebkitLineClamp:2,
              WebkitBoxOrient:'vertical',
              overflow:'hidden',
              fontFamily:"'Noto Serif SC',serif",
              fontWeight:300,
            }}>
              {a.excerpt}
            </p>
            <div style={{margin:'14px -20px 0',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
              <button onClick={() => navigate(`/article/${a.folder}/${a.id}`)}
                style={{
                  width:'100%', padding: mobile ? '13px 0' : '12px 0',
                  background:'transparent', border:'none',
                  color:'rgba(255,255,255,0.5)',
                  fontFamily:'monospace', fontSize:10,
                  letterSpacing:'.12em', cursor:'pointer',
                  transition:'color .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color='#fff'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>
                READ →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 无封面 */
        <div style={{padding:'28px 20px 0',borderTop:`1px solid ${ac}44`}}>
          <div style={{fontFamily:'monospace',fontSize:12,color:'rgba(255,255,255,0.6)',letterSpacing:'.15em',marginBottom:12}}>
            {(a.folder||'').toUpperCase()} · {(a.date||'').replace(/-/g,' · ')}
          </div>
          <h2 style={{fontSize:18,fontWeight:700,lineHeight:1.3,color:'#e8ddd0',margin:'0 0 10px',fontFamily:"'Noto Serif SC',serif"}}>{a.title}</h2>
          <p style={{fontSize:11,color:'rgba(255,255,255,0.3)',lineHeight:1.8,margin:0,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{a.excerpt}</p>
          <div style={{margin:'14px -20px 0',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <button onClick={() => navigate(`/article/${a.folder}/${a.id}`)}
              style={{width:'100%',padding:'12px 0',background:'transparent',border:'none',color:'rgba(255,255,255,0.4)',fontFamily:'monospace',fontSize:10,letterSpacing:'.12em',cursor:'pointer'}}>
              READ →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('all')
  const [search, setSearch]     = useState('')
  const [cur, setCur]           = useState(0)
  const [hovered, setHovered]   = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)

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
    const sOk = !search || (a.title || '').toLowerCase().includes(search.toLowerCase())
    return tOk && sOk
  })

  function move(dir) {
    if (visible.length < 2) return
    setCur(c => (c + dir + visible.length) % visible.length)
  }

  const count = k => k === 'all' ? articles.length : articles.filter(a => a.folder === k || a.category === k).length

  if (IS_MOBILE) {
    return (
      <div style={{background:'#060608',minHeight:'100vh',color:'#e8ddd0',fontFamily:"'Noto Sans SC',sans-serif"}}>
        {/* 移动顶栏 */}
        <div style={{padding:'20px 20px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:16}}>
            <div>
              <div style={{fontFamily:"'Noto Serif SC',serif",fontSize:28,fontWeight:700,color:'#f0e8d8',letterSpacing:'-.01em',lineHeight:1}}>Welcome</div>
              <div style={{fontFamily:'monospace',fontSize:12,color:'rgba(255,255,255,0.6)',letterSpacing:'.12em',marginTop:4}}>PERSONAL WRITING</div>
            </div>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <button onClick={() => setSearchOpen(o => !o)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:16,cursor:'pointer',padding:4}}>⌕</button>
              <a href="https://index.jackie3137.xyz" target="_blank" rel="noopener"
                style={{fontFamily:'monospace',fontSize:12,color:'rgba(255,255,255,0.3)',textDecoration:'none',letterSpacing:'.1em'}}>HOME</a>
            </div>
          </div>
          {searchOpen && (
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索..."
              style={{width:'100%',padding:'8px 0',background:'transparent',border:'none',borderBottom:'1px solid rgba(255,255,255,0.35)',color:'#e8ddd0',fontFamily:"'Noto Serif SC',serif",fontSize:14,outline:'none',boxSizing:'border-box'}} />
          )}
        </div>

        {/* 分类 */}
        <div style={{padding:'14px 20px',display:'flex',gap:28,overflowX:'auto',scrollbarWidth:'none',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          {CATS.map(c => (
            <button key={c.key} onClick={() => setTab(c.key)}
              style={{
                background:'none', border:'none', cursor:'pointer',
                fontFamily:'monospace', fontSize:12, letterSpacing:'.12em',
                color: tab===c.key ? '#fff' : 'rgba(255,255,255,0.6)',
                borderBottom: tab===c.key ? '1px solid #fff' : '1px solid transparent',
                paddingBottom:4, whiteSpace:'nowrap', flexShrink:0,
                transition:'color .2s',
              }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* 文章数 */}
        <div style={{padding:'12px 20px',fontFamily:'monospace',fontSize:12,color:'rgba(255,255,255,0.5)',letterSpacing:'.15em',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          {visible.length} ARTICLES
        </div>

        {/* 列表 */}
        <div style={{padding:'20px',display:'flex',flexDirection:'column',gap:20}}>
          {loading && <p style={{color:'rgba(255,255,255,0.5)',fontFamily:'monospace',fontSize:10,textAlign:'center',padding:'60px 0',letterSpacing:'.12em'}}>LOADING</p>}
          {!loading && visible.length === 0 && <p style={{color:'rgba(255,255,255,0.5)',fontFamily:'monospace',fontSize:10,textAlign:'center',padding:'60px 0',letterSpacing:'.12em'}}>NO ARTICLES</p>}
          {visible.map(a => {
            const ac = COLORS[a.folder]||COLORS[a.category]||'#fff'
            return <Card key={a.id} a={a} ac={ac} isHovered={false} isCurrent={false} navigate={navigate} mobile={true} />
          })}
        </div>
      </div>
    )
  }

  // 桌面
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#060608',color:'#e8ddd0',fontFamily:"'Noto Sans SC',sans-serif"}}>

      {/* 顶栏 */}
      <div style={{display:'flex',alignItems:'center',padding:'18px 48px',borderBottom:'1px solid rgba(255,255,255,0.05)',flexShrink:0,zIndex:20}}>
        <div style={{display:'flex',alignItems:'baseline',gap:16}}>
          <div style={{fontFamily:"'Noto Serif SC',serif",fontSize:28,fontWeight:700,color:'#f0e8d8',letterSpacing:'-.01em'}}>Welcome</div>
          <div style={{fontFamily:'monospace',fontSize:12,color:'rgba(255,255,255,0.5)',letterSpacing:'.15em'}}>PERSONAL WRITING</div>
        </div>

        {/* 分类 - 放顶栏中间 */}
        <div style={{margin:'0 auto',display:'flex',gap:44,alignItems:'center'}}>
          {CATS.map(c => (
            <button key={c.key} onClick={()=>{setTab(c.key);setCur(0)}}
              style={{
                background:'none', border:'none', cursor:'pointer',
                fontFamily:'monospace', fontSize:12, letterSpacing:'.12em',
                color: tab===c.key ? '#fff' : 'rgba(255,255,255,0.6)',
                borderBottom: tab===c.key ? '1px solid rgba(255,255,255,0.6)' : '1px solid transparent',
                paddingBottom:4,
                transition:'color .2s',
              }}>
              {c.label}
              <span style={{marginLeft:6,fontSize:10,color:'rgba(255,255,255,0.35)'}}>{count(c.key)}</span>
            </button>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:24}}>
          {searchOpen ? (
            <input value={search} onChange={e=>{setSearch(e.target.value);setCur(0)}} placeholder="搜索..." autoFocus
              onBlur={()=>!search&&setSearchOpen(false)}
              style={{background:'transparent',border:'none',borderBottom:'1px solid rgba(255,255,255,0.5)',color:'#e8ddd0',fontFamily:"'Noto Serif SC',serif",fontSize:13,outline:'none',width:160,paddingBottom:2}} />
          ) : (
            <button onClick={()=>setSearchOpen(true)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',fontSize:14,cursor:'pointer',padding:0}}>⌕</button>
          )}
          <a href="https://index.jackie3137.xyz" target="_blank" rel="noopener"
            style={{fontFamily:'monospace',fontSize:12,color:'rgba(255,255,255,0.6)',textDecoration:'none',letterSpacing:'.15em',transition:'color .2s'}}
            onMouseEnter={e=>e.currentTarget.style.color='#fff'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.6)'}>
            HOME
          </a>
        </div>
      </div>

      {/* 文章数小标 */}
      <div style={{padding:'8px 48px',fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:'.12em',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
        {visible.length} ARTICLES
      </div>

      {/* 轮播舞台 */}
      <div style={{flex:1,position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
        {loading && <p style={{color:'rgba(255,255,255,0.5)',fontFamily:'monospace',fontSize:12,letterSpacing:'.3em'}}>LOADING</p>}
        {!loading && visible.length===0 && (
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <p style={{color:'rgba(255,255,255,0.35)',fontFamily:'monospace',fontSize:12,letterSpacing:'.3em'}}>NO ARTICLES</p>
          </div>
        )}

        <button onClick={()=>move(-1)} disabled={visible.length<=1}
          style={{position:'absolute',left:20,top:'50%',transform:'translateY(-50%)',zIndex:30,background:'none',border:'none',color:'rgba(255,255,255,0.5)',fontSize:28,cursor:'pointer',padding:'8px',transition:'color .2s',opacity:visible.length<=1?0:1}}
          onMouseEnter={e=>e.currentTarget.style.color='#fff'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>‹</button>

        <div style={{position:'relative',width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {visible.map((a,i) => {
            const state = getState(i,cur,visible.length)
            const ac = COLORS[a.folder]||COLORS[a.category]||'#fff'
            const isHovered = hovered===a.id && state==='center'
            const isCurrent = i===cur%visible.length
            return (
              <div key={a.id}
                onClick={state!=='center'?()=>setCur(i):undefined}
                onMouseEnter={()=>state==='center'&&setHovered(a.id)}
                onMouseLeave={()=>setHovered(null)}
                style={{
                  position:'absolute',
                  width:'clamp(240px,28vw,380px)',
                  transition:'transform .6s cubic-bezier(.4,0,.2,1),opacity .5s',
                  transform:TRANSFORMS[state],
                  opacity:OPACITY[state],
                  zIndex:ZINDEX[state],
                  cursor:state==='center'?'default':'pointer',
                }}>
                <Card a={a} ac={ac} isHovered={isHovered} isCurrent={isCurrent} navigate={navigate} mobile={false} />
              </div>
            )
          })}
        </div>

        <button onClick={()=>move(1)} disabled={visible.length<=1}
          style={{position:'absolute',right:20,top:'50%',transform:'translateY(-50%)',zIndex:30,background:'none',border:'none',color:'rgba(255,255,255,0.5)',fontSize:28,cursor:'pointer',padding:'8px',transition:'color .2s',opacity:visible.length<=1?0:1}}
          onMouseEnter={e=>e.currentTarget.style.color='#fff'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.5)'}>›</button>
      </div>

      {/* 底部 */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20,padding:'12px 0',borderTop:'1px solid rgba(255,255,255,0.04)',flexShrink:0}}>
        <div style={{display:'flex',gap:8}}>
          {visible.slice(0,12).map((_,i)=>(
            <button key={i} onClick={()=>setCur(i)}
              style={{width:i===cur%12?24:4,height:2,borderRadius:1,background:i===cur%12?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.12)',border:'none',cursor:'pointer',transition:'all .3s',padding:0}} />
          ))}
        </div>
        <span style={{fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,0.35)',letterSpacing:'.12em'}}>
          {visible.length>0?`${String(cur+1).padStart(2,'0')} / ${String(visible.length).padStart(2,'0')}`:''}
        </span>
      </div>
    </div>
  )
}
