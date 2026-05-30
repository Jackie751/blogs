import React from 'react'
import { Routes, Route } from 'react-router-dom'

const Home = React.lazy(() => import('./pages/Home.jsx'))
const Article = React.lazy(() => import('./pages/Article.jsx'))

export default function App() {
  return (
    <React.Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/article/:folder/:id" element={<Article />} />
      </Routes>
    </React.Suspense>
  )
}
