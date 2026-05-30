import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const RAW = 'https://raw.githubusercontent.com/Jackie751/articles/refs/heads/main'

const CATS = [
  { key: 'all',     label: '全部',    color: '#00e5ff' },
  { key: 'Opinion', label: 'Opinion', color: '#ff6eb4' },
  { key: 'Journal', label: 'Journal', color: '#ffd166' },
  { key: 'Focus',   label: 'Focus',   color: '#00e5ff' },
  { key: 'Ideas',   label: 'Ideas',   color: '#b47eff' },
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
  left1:   'translateX(-55%) scale(.8) rotateY(20deg)',
  right1:  'translateX(55%) scale(.8) rotateY(-20deg)',
  left2:   'translateX(-80%) scale(.62) rotateY(30deg)',
  right2:  'translateX(80%) scale(.62) rotateY(-30deg)',
  hidden:  'translateX(0) scale(0)',
}
const OPACITY = { center: 1, left1: .5, right1: .5, left2: .2, right2: .2, hidden: 0 }
const ZINDEX  = { center: 5, left1: 4, right1: 4, left2: 3, right2: 3, hidden: 1 }
const FILTER  = { center: 'none', left1: 'brightness(.5)', right1: 'brightness(.5)', left2: 'brightness(.3)', right2: 'brightness(.3)', hidden: 'none' }

// 卡片内容（桌面和移动共用）
function ArticleCard({ a, ac, isHovered, isCurrent, navigate, mobile }) {
  return (
    <div style={{
      borderRadius: mobile ? 14 : 16,
      overflow: 'hidden',
      background: '#0a0d18',
      boxShadow: isHovered ? `0 40px 100px rgba(0,0,0,.9),0 0 60px ${ac}44` : '0 20px 60px rgba(0,0,0,.8)',
      transition: 'box-shadow .3s,transform .3s',
      transform: isHovered ? 'translateY(-6px)' : 'none',
      position: 'relative',
    }}>
      {a.cover ? (
        /* 有封面：全图卡片，文字叠在上面 */
        <div style={{position:'relative', width:'100%', paddingTop: mobile ? '120%' : '140%', overflow:'hidden'}}>
          {/* 背景图 */}
          <img src={a.cover} alt="" style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', display:'block',
            transition:'transform .5s',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }} />

          {/* 全图渐变遮罩：从上到下越来越暗 */}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.96) 100%)'}} />

          {/* 左上：LATEST POST + 分类 */}
          <div style={{position:'absolute',top:14,left:14,display:'flex',gap:6,flexWrap:'wrap'}}>
            {isCurrent && (
              <span style={{fontFamily:'monospace',fontSize:9,padding:'3px 10px',borderRadius:4,background:ac,color:'#000',fontWeight:700,letterSpacing:'.1em'}}>
                LATEST POST
              </span>
            )}
            <span style={{fontFamily:'monospace',fontSize:9,padding:'3px 10px',borderRadius:4,background:'rgba(0,0,0,0.5)',color:ac,border:`1px solid ${ac}66`,backdropFilter:'blur(8px)',letterSpacing:'.08em'}}>
              {a.folder||a.category}
            </span>
          </div>

          {/* 右上：阅读时间 */}
          {a.read_time && (
            <div style={{position:'absolute',top:14,right:14,fontFamily:'monospace',fontSize:9,padding:'3px 10px',borderRadius:4,background:'rgba(0,0,0,0.5)',color:'#fff',backdropFilter:'blur(8px)'}}>
              ⏱ {a.read_time} min
            </div>
          )}

          {/* 底部：日期 + 标题 + 标签 + 摘要 + 按钮 全部叠在图片上 */}
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 18px 0'}}>
            <div style={{fontFamily:'monospace',fontSize:9,color:'rgba(255,255,255,0.5)',marginBottom:6,letterSpacing:'.1em'}}>
              {(a.date||'').replace(/-/g,' // ')}
            </div>
            <h2 style={{fontSize: mobile ? 17 : 18,fontWeight:700,lineHeight:1.35,color:'#fff',margin:'0 0 8px',fontFamily:"'Noto Serif SC',serif",textShadow:'0 2px 8px rgba(0,0,0,0.8)'}}>
              {a.title}
            </h2>
            {a.tags?.length > 0 && (
              <div style={{display:'flex',gap:5,marginBottom:8,flexWrap:'wrap'}}>
                {a.tags.map(t => (
                  <span key={t} style={{fontFamily:'monospace',fontSize:9,padding:'2px 7px',borderRadius:20,background:'rgba(0,0,0,0.4)',border:`1px solid ${ac}55`,color:`${ac}dd`,backdropFilter:'blur(4px)'}}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            <p style={{fontSize:12,color:'rgba(255,255,255,0.65)',lineHeight:1.7,margin:'0',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',fontFamily:"'Noto Serif SC',serif",fontWeight:300,textShadow:'0 1px 4px rgba(0,0,0,0.8)'}}>
              {a.excerpt}
            </p>
            <div style={{borderTop:'1px solid rgba(255,255,255,0.1)',margin:'12px -18px 0'}}>
              <button onClick={() => navigate(`/article/${a.folder}/${a.id}`)}
                style={{width:'100%',padding: mobile ? '13px 0' : '11px 0',background:'transparent',border:'none',color:ac,fontFamily:'monospace',fontSize: mobile ? 12 : 11,letterSpacing:'.1em',cursor:'pointer',transition:'background .2s'}}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                阅读全文 →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 无封面：普通卡片 */
        <div style={{borderTop:`3px solid ${ac}`,padding:'18px 18px 0'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <span style={{fontFamily:'monospace',fontSize:9,padding:'2px 8px',borderRadius:20,border:`1px solid ${ac}`,color:ac}}>{a.folder||a.category}</span>
            <span style={{fontFamily:'monospace',fontSize:9,color:'#4a5878'}}>{(a.date||'').replace(/-/g,' // ')}</span>
            {a.read_time && <span style={{fontFamily:'monospace',fontSize:9,color:'#4a5878',marginLeft:'auto'}}>⏱ {a.read_time} min</span>}
          </div>
          <h2 style={{fontSize:16,fontWeight:700,lineHeight:1.4,color:'#f0e8d8',marginBottom:8,fontFamily:"'Noto Serif SC',serif"}}>{a.title}</h2>
          {a.tags?.length > 0 && (
            <div style={{display:'flex',gap:5,marginBottom:8,flexWrap:'wrap'}}>
              {a.tags.map(t => <span key={t} style={{fontFamily:'monospace',fontSize:9,padding:'2px 7px',borderRadius:20,border:`1px solid ${ac}44`,color:`${ac}cc`}}>{t}</span>)}
            </div>
          )}
          <p style={{fontSize:12,color:'#6a7a9a',lineHeight:1.8,margin:'0',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden',fontFamily:"'Noto Serif SC',serif",fontWeight:300}}>{a.excerpt}</p>
          <div style={{borderTop:'1px solid rgba(40,55,90,0.4)',margin:'12px -18px 0'}}>
            <button onClick={() => navigate(`/article/${a.folder}/${a.id}`)}
              style={{width:'100%',padding:'11px 0',background:'transparent',border:'none',color:ac,fontFamily:'monospace',fontSize:11,letterSpacing:'.1em',cursor:'pointer'}}>
              阅读全文 →
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

  // 移动端
  if (IS_MOBILE) {
    return (
      <div style={{background:'#080b12',minHeight:'100vh',color:'#ccd6f0',fontFamily:"'Noto Sans SC',sans-serif"}}>
        <div style={{padding:'16px 16px 12px',background:'rgba(20,26,44,0.98)',borderBottom:'1px solid rgba(40,55,90,0.7)',position:'sticky',top:0,zIndex:20,backdropFilter:'blur(12px)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div>
              <div style={{fontSize:20,fontWeight:900,background:'linear-gradient(270deg,#00e5ff,#ff6eb4,#ffd166,#b47eff)',backgroundSize:'400% 400%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>柒安的小窝</div>
              <div style={{fontFamily:'monospace',fontSize:9,color:'#4a5878',letterSpacing:'.12em'}}>ARTICLES // BLOG</div>
            </div>
            <a href="https://index.jackie3137.xyz" target="_blank" rel="noopener"
              style={{padding:'6px 12px',borderRadius:20,border:'1px solid rgba(40,55,90,0.7)',color:'#8a99c0',fontFamily:'monospace',fontSize:10,textDecoration:'none'}}>⌂</a>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索文章..."
            style={{width:'100%',padding:'9px 14px',background:'rgba(0,0,0,.3)',border:'1px solid rgba(40,55,90,0.7)',borderRadius:20,color:'#ccd6f0',fontFamily:'monospace',fontSize:12,outline:'none',boxSizing:'border-box'}} />
        </div>
        <div style={{padding:'10px 16px',display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none',borderBottom:'1px solid rgba(40,55,90,0.4)'}}>
          {CATS.map(c => (
            <button key={c.key} onClick={() => setTab(c.key)}
              style={{padding:'5px 14px',border:`1px solid ${tab===c.key?c.color:'rgba(40,55,90,0.7)'}`,color:tab===c.key?c.color:'#4a5878',background:tab===c.key?`${c.color}15`:'transparent',borderRadius:20,cursor:'pointer',fontSize:11,fontFamily:'monospace',whiteSpace:'nowrap',flexShrink:0}}>
              {c.label} ({count(c.key)})
            </button>
          ))}
        </div>
        <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:16}}>
          {loading && <p style={{color:'#4a5878',fontFamily:'monospace',fontSize:12,textAlign:'center',padding:'40px 0'}}>LOADING...</p>}
          {!loading && visible.length === 0 && <p style={{color:'#4a5878',fontFamily:'monospace',fontSize:12,textAlign:'center',padding:'40px 0'}}>找不到文章</p>}
          {visible.map(a => {
            const ac = COLORS[a.folder]||COLORS[a.category]||'#00e5ff'
            return <ArticleCard key={a.id} a={a} ac={ac} isHovered={false} isCurrent={false} navigate={navigate} mobile={true} />
          })}
        </div>
      </div>
    )
  }

  // 桌面端
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#080b12',color:'#ccd6f0',fontFamily:"'Noto Sans SC',sans-serif",fontSize:14}}>
      <div style={{display:'flex',alignItems:'center',gap:14,padding:'10px 28px',background:'rgba(20,26,44,0.95)',borderBottom:'1px solid rgba(40,55,90,0.7)',flexShrink:0,backdropFilter:'blur(12px)',zIndex:20}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:'#00e5ff',boxShadow:'0 0 8px #00e5ff',flexShrink:0}} />
        <div>
          <div style={{fontSize:17,fontWeight:900,background:'linear-gradient(270deg,#00e5ff,#ff6eb4,#ffd166,#b47eff,#00e5ff)',backgroundSize:'400% 400%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>柒安的文章</div>
          <div style={{fontFamily:'monospace',fontSize:10,color:'#4a5878',letterSpacing:'.15em'}}>ARTICLES // PERSONAL BLOG</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setCur(0)}} placeholder="搜索..."
            style={{padding:'5px 12px',background:'rgba(0,0,0,.3)',border:'1px solid rgba(40,55,90,0.7)',borderRadius:20,color:'#ccd6f0',fontFamily:'monospace',fontSize:11,outline:'none',width:160}} />
          <a href="https://index.jackie3137.xyz" target="_blank" rel="noopener"
            style={{display:'inline-flex',alignItems:'center',padding:'5px 14px',borderRadius:20,border:'1px solid rgba(40,55,90,0.7)',color:'#8a99c0',fontFamily:'monospace',fontSize:10,textDecoration:'none'}}>⌂ 主页</a>
        </div>
      </div>
      <div style={{background:'rgba(20,26,44,0.95)',borderBottom:'1px solid rgba(40,55,90,0.7)',flexShrink:0}}>
        <div style={{display:'flex',gap:8,padding:'8px 28px',flexWrap:'wrap',alignItems:'center'}}>
          {CATS.map(c => (
            <button key={c.key} onClick={()=>{setTab(c.key);setCur(0)}}
              style={{padding:'3px 12px',border:`1px solid ${tab===c.key?c.color:'rgba(40,55,90,0.7)'}`,color:tab===c.key?c.color:'#4a5878',background:tab===c.key?`${c.color}15`:'transparent',borderRadius:20,cursor:'pointer',fontSize:10,fontFamily:'monospace',letterSpacing:'.08em'}}>
              {c.label} ({count(c.key)})
            </button>
          ))}
        </div>
        {months.length > 0 && (
          <div style={{display:'flex',gap:8,padding:'6px 28px',flexWrap:'wrap',alignItems:'center',borderTop:'1px solid rgba(40,55,90,0.3)'}}>
            {['all',...months].map(m=>(
              <button key={m} onClick={()=>{setMon(m);setCur(0)}}
                style={{padding:'3px 12px',border:`1px solid ${mon===m?'#ffd166':'rgba(40,55,90,0.7)'}`,color:mon===m?'#ffd166':'#4a5878',background:mon===m?'rgba(255,209,102,.07)':'transparent',borderRadius:20,cursor:'pointer',fontSize:10,fontFamily:'monospace'}}>
                {m==='all'?'全部':m.replace('-','年')+'月'}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{flex:1,position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',perspective:1400}}>
        {loading && <p style={{color:'#4a5878',fontFamily:'monospace',fontSize:12}}>LOADING...</p>}
        {!loading && visible.length===0 && (
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <p style={{color:'#4a5878',fontFamily:'monospace',fontSize:12}}>找不到文章</p>
          </div>
        )}
        <button onClick={()=>move(-1)} disabled={visible.length<=1}
          style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',zIndex:30,width:44,height:100,background:'rgba(8,11,18,.6)',border:'1px solid rgba(40,55,90,0.7)',color:'#4a5878',fontSize:24,cursor:'pointer',borderRadius:'0 10px 10px 0',display:'flex',alignItems:'center',justifyContent:'center',opacity:visible.length<=1?.15:1}}>‹</button>
        <div style={{position:'relative',width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',transformStyle:'preserve-3d'}}>
          {visible.map((a,i) => {
            const state = getState(i,cur,visible.length)
            const ac = COLORS[a.folder]||COLORS[a.category]||'#00e5ff'
            const isHovered = hovered===a.id && state==='center'
            const isCurrent = i===cur%visible.length
            return (
              <div key={a.id}
                onClick={state!=='center'&&!IS_MOBILE?()=>setCur(i):undefined}
                onMouseEnter={()=>state==='center'&&setHovered(a.id)}
                onMouseLeave={()=>setHovered(null)}
                style={{
                  position:'absolute',
                  width:'clamp(260px,30vw,400px)',
                  transition:'transform .55s cubic-bezier(.4,0,.2,1),opacity .45s,filter .45s',
                  transform:TRANSFORMS[state],
                  opacity:OPACITY[state],
                  zIndex:ZINDEX[state],
                  filter:FILTER[state],
                  cursor:state==='center'?'default':'pointer',
                  borderRadius:16,
                }}>
                <ArticleCard a={a} ac={ac} isHovered={isHovered} isCurrent={isCurrent} navigate={navigate} mobile={false} />
              </div>
            )
          })}
        </div>
        <button onClick={()=>move(1)} disabled={visible.length<=1}
          style={{position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',zIndex:30,width:44,height:100,background:'rgba(8,11,18,.6)',border:'1px solid rgba(40,55,90,0.7)',color:'#4a5878',fontSize:24,cursor:'pointer',borderRadius:'10px 0 0 10px',display:'flex',alignItems:'center',justifyContent:'center',opacity:visible.length<=1?.15:1}}>›</button>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'8px 0',background:'rgba(20,26,44,0.95)',borderTop:'1px solid rgba(40,55,90,0.7)',flexShrink:0}}>
        <div style={{display:'flex',gap:7}}>
          {visible.slice(0,15).map((_,i)=>(
            <button key={i} onClick={()=>setCur(i)}
              style={{width:i===cur%15?20:6,height:6,borderRadius:i===cur%15?3:'50%',background:i===cur%15?'#00e5ff':'rgba(40,55,90,0.7)',border:'none',cursor:'pointer',transition:'all .25s'}} />
          ))}
        </div>
        <div style={{fontFamily:'monospace',fontSize:10,color:'#4a5878'}}>
          {visible.length>0?`${cur+1} / ${visible.length}`:'// 暂无'}
        </div>
      </div>
    </div>
  )
}
