const REPO_OWNER = 'Jackie751'
const REPO_NAME  = 'articles'
const BRANCH     = 'main'
const RAW_BASE   = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`
const API_BASE   = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`

// 拉取文章列表 (index.json)
export async function fetchIndex() {
  const res = await fetch(`${RAW_BASE}/index.json?t=${Date.now()}`)
  if (!res.ok) return []
  return res.json()
}

// 拉取单篇文章内容
export async function fetchArticle(id) {
  const res = await fetch(`${RAW_BASE}/articles/${id}.json?t=${Date.now()}`)
  if (!res.ok) throw new Error('文章不存在')
  return res.json()
}

// 推送文件到 GitHub（需要 token）
export async function pushFile(path, content, message, token, existingSha = null) {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
    branch: BRANCH,
  }
  if (existingSha) body.sha = existingSha

  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || '推送失败')
  }
  return res.json()
}

// 获取文件的 sha（用于更新已有文件）
export async function getFileSha(path, token) {
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    headers: { Authorization: `token ${token}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.sha
}

export { RAW_BASE }
