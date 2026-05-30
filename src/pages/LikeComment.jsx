import React, { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://yoocjtjwolwbvptaefqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_e145oCJXa2hck4U3pGDhAg_vCAYKv6S'

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

export default function LikeComment({ articleId, accentColor = '#c4503a', dark = true }) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const bg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const txt = dark ? '#cfc4b4' : '#3d3028'
  const txt2 = dark ? '#7a6e63' : '#8b7355'
  const inputBg = dark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)'
  const inputBorder = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'

  useEffect(() => {
    // 读取点赞数
    fetch(`${SUPABASE_URL}/rest/v1/likes?article_id=eq.${articleId}&select=id`, { headers })
      .then(r => r.json())
      .then(d => setLikes(Array.isArray(d) ? d.length : 0))
      .catch(() => {})

    // 读取评论
    fetch(`${SUPABASE_URL}/rest/v1/comments?article_id=eq.${articleId}&order=created_at.asc&select=*`, { headers })
      .then(r => r.json())
      .then(d => setComments(Array.isArray(d) ? d : []))
      .catch(() => {})

    // 本地记录是否点过赞
    const likedKey = `liked_${articleId}`
    if (localStorage.getItem(likedKey)) setLiked(true)
  }, [articleId])

  async function handleLike() {
    if (liked) return
    const likedKey = `liked_${articleId}`
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/likes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ article_id: articleId }),
      })
      setLikes(l => l + 1)
      setLiked(true)
      localStorage.setItem(likedKey, '1')
    } catch {}
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!nickname.trim() || !content.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ article_id: articleId, nickname: nickname.trim(), content: content.trim() }),
      })
      const newComment = await res.json()
      if (Array.isArray(newComment) && newComment[0]) {
        setComments(c => [...c, newComment[0]])
      }
      setContent('')
      setShowForm(false)
    } catch {}
    setSubmitting(false)
  }

  function formatDate(str) {
    if (!str) return ''
    return new Date(str).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div style={{ marginTop: 64, borderTop: `1px solid ${border}`, paddingTop: 40 }}>
      {/* 点赞 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
        <button
          onClick={handleLike}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 24,
            border: `1px solid ${liked ? accentColor : border}`,
            background: liked ? `${accentColor}15` : 'transparent',
            color: liked ? accentColor : txt2,
            cursor: liked ? 'default' : 'pointer',
            fontSize: 13, fontFamily: 'monospace',
            transition: 'all .2s',
          }}>
          {liked ? '♥' : '♡'} {likes}
        </button>
        <span style={{ fontSize: 12, color: txt2, fontFamily: 'monospace' }}>
          {liked ? '谢谢你的喜欢' : '觉得不错就点个赞'}
        </span>
      </div>

      {/* 评论区标题 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '.2em', color: txt2, textTransform: 'uppercase' }}>
          Comments · {comments.length}
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            padding: '5px 14px', borderRadius: 20,
            border: `1px solid ${accentColor}`,
            background: 'transparent', color: accentColor,
            fontFamily: 'monospace', fontSize: 11,
            cursor: 'pointer', letterSpacing: '.08em',
          }}>
          {showForm ? '取消' : '+ 留言'}
        </button>
      </div>

      {/* 留言表单 */}
      {showForm && (
        <form onSubmit={handleComment} style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="你的名字"
            maxLength={20}
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: `1px solid ${inputBorder}`,
              background: inputBg, color: txt,
              fontFamily: 'inherit', fontSize: 14, outline: 'none',
            }}
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="说点什么..."
            maxLength={500}
            rows={4}
            style={{
              padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${inputBorder}`,
              background: inputBg, color: txt,
              fontFamily: 'inherit', fontSize: 14,
              outline: 'none', resize: 'vertical',
            }}
          />
          <button
            type="submit"
            disabled={submitting || !nickname.trim() || !content.trim()}
            style={{
              alignSelf: 'flex-end',
              padding: '7px 20px', borderRadius: 8,
              background: accentColor, border: 'none',
              color: '#fff', fontFamily: 'monospace',
              fontSize: 12, cursor: 'pointer',
              opacity: submitting ? .5 : 1,
            }}>
            {submitting ? '发送中...' : '发送'}
          </button>
        </form>
      )}

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <p style={{ color: txt2, fontFamily: 'monospace', fontSize: 12, textAlign: 'center', padding: '32px 0' }}>
          还没有评论，来说点什么吧
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comments.map(c => (
            <div key={c.id} style={{
              padding: '16px 20px', borderRadius: 10,
              background: bg, border: `1px solid ${border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: accentColor, fontWeight: 600, fontSize: 14 }}>{c.nickname}</span>
                <span style={{ color: txt2, fontSize: 11, fontFamily: 'monospace' }}>{formatDate(c.created_at)}</span>
              </div>
              <p style={{ color: txt, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
