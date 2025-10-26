import { useEffect, useMemo, useRef, useState } from 'react'
import mermaid from 'mermaid'
import svgPanZoom from 'svg-pan-zoom'
import { generateMindmapData, summarizeTopic } from '../lib/claudeClient.js'

function norm(s) {
  return (s || '').toLowerCase().trim()
}

export default function Roadmap() {
  const [branch, setBranch] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [summary, setSummary] = useState('')
  const [graphSvg, setGraphSvg] = useState('')
  const svgHostRef = useRef(null)
  const panzoomRef = useRef(null)
  const nodeIndexRef = useRef({})

  const branches = [
    'software development',
    'systems programming & infrastructure',
    'artificial intelligence & machine learning (ML)',
    'networking & security',
    'theory of computation',
    'human-computer interaction (HCI)',
    'computational biology',
    'computational linguistics',
    'theoretical & applied mathematics in computer science',
    'artificial intelligence & specialized technologies',
    'quantum computing',
    'computational creativity',
    'educational technology',
    'ethical & legal aspects of computing',
  ]

  const domainMap = useMemo(
    () => ({
      [norm('software development')]: [
        'web development',
        'game development',
        'desktop application development',
        'embedded systems',
        'software engineering',
      ],
      [norm('systems programming & infrastructure')]: [
        'operating systems',
        'computer architecture',
        'database management',
        'cloud computing',
        'DevOPs',
      ],
      [norm('artificial intelligence & machine learning (ML)')]: [
        'Artificial Intelligence (AI)',
        'Machine Learning (ML)',
        'Data Science',
        'Reinforcement Learning',
        'AI Ethics',
      ],
      [norm('networking & security')]: [
        'Network Engineering',
        'Cybersecurity',
        'Ethical Hacking',
        'Blockchain Technology',
      ],
      [norm('theory of computation')]: [
        'Automata Theory',
        'Computational Complexity Theory',
        'Formal Languages',
        'Parallel and Distributed Computing',
      ],
      [norm('human-computer interaction (HCI)')]: [
        'User Interface (UI) Design',
        'User Experience (UX)',
        'Augmented Reality (AR) & Virtual Reality (VR)',
      ],
      [norm('computational biology')]: [
        'Bioinformatics',
        'Computational Neuroscience',
        'Systems Biology',
      ],
      [norm('computational linguistics')]: [
        'Natural Language Processing (NLP)',
        'Speech Processing',
      ],
      [norm('theoretical & applied mathematics in computer science')]: [
        'Mathematical Foundations of Computing',
        'Algorithms & Data Structures',
        'Computational Geometry',
      ],
      [norm('artificial intelligence & specialized technologies')]: [
        'Autonomous Systems',
        'Computer Vision',
        'Natural Language Generation (NLG)',
      ],
      [norm('quantum computing')]: [
        'Quantum Algorithms',
        'Quantum Hardware',
        'Quantum Software Development',
      ],
      [norm('computational creativity')]: [
        'Generative Art',
        'Game AI',
      ],
      [norm('educational technology')]: [
        'E-learning Platforms',
        'Adaptive Learning Systems',
      ],
      [norm('ethical & legal aspects of computing')]: [
        'Privacy',
        'Technology & Society',
      ],
    }),
    [],
  )

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('sparkcs_questionnaire') || '{}')
    if (saved && saved.branch) setBranch(saved.branch)
  }, [])

  useEffect(() => {
    if (!branch) {
      setGraphSvg('')
      setSummary('')
      setAiError('')
      setAiLoading(false)
      return
    }
    const doms = domainMap[norm(branch)] || []
    const controller = new AbortController()
    const run = async () => {
      try {
        setAiLoading(true)
        setAiError('')
        nodeIndexRef.current = {}
        const items = await generateMindmapData({ branch, domains: doms, signal: controller.signal })
        const mapByDomain = new Map(items.map((it) => [norm(it.domain), it.subdomains || []]))
        const lines = []
        lines.push('mindmap')
        const rootId = 'root'
        lines.push(`  ${rootId}(${branch})`)
        for (const d of doms) {
          const did = `d_${d.replace(/[^a-z0-9]/gi, '_')}`
          lines.push(`    ${did}(${d})`)
          const subs = mapByDomain.get(norm(d)) || []
          for (const s of subs) {
            const sName = typeof s === 'string' ? s : (s?.name ?? '')
            const sid = `s_${d.replace(/[^a-z0-9]/gi, '_')}_${String(sName).replace(/[^a-z0-9]/gi, '_')}`
            lines.push(`      ${sid}(${sName})`)
            nodeIndexRef.current[sid] = { branch, domain: d, subdomain: String(sName) }
            const children = typeof s === 'object' && Array.isArray(s.children) ? s.children : []
            for (const c of children) {
              const cid = `c_${d.replace(/[^a-z0-9]/gi, '_')}_${String(sName).replace(/[^a-z0-9]/gi, '_')}_${String(c).replace(/[^a-z0-9]/gi, '_')}`
              lines.push(`        ${cid}(${c})`)
              nodeIndexRef.current[cid] = { branch, domain: d, subdomain: String(c) }
            }
          }
        }
        const def = lines.join('\n')
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          themeVariables: {
            textColor: '#ffffff',
            primaryTextColor: '#ffffff',
            lineColor: '#8aa1ff',
          },
        })
        const id = `mm_${Date.now()}`
        const { svg } = await mermaid.render(id, def)
        setGraphSvg(svg)
      } catch (e) {
        if (e.name !== 'AbortError') setAiError(e.message || 'Failed to build mindmap')
      } finally {
        setAiLoading(false)
      }
    }
    run()
    return () => controller.abort()
  }, [branch])

  useEffect(() => {
    if (!graphSvg) return
    const host = svgHostRef.current
    if (!host) return
    host.innerHTML = graphSvg
    const svgEl = host.querySelector('svg')
    if (svgEl) {
      // Expand SVG to fill host fully
      svgEl.setAttribute('width', '100%')
      svgEl.setAttribute('height', '100%')
      svgEl.style.width = '100%'
      svgEl.style.height = '100%'
      if (panzoomRef.current) {
        panzoomRef.current.destroy()
        panzoomRef.current = null
      }
      panzoomRef.current = svgPanZoom(svgEl, {
        controlIconsEnabled: false,
        zoomEnabled: true,
        panEnabled: true,
        minZoom: 0.3,
        maxZoom: 8,
        fit: true,
        center: true,
        contain: 'outside',
      })
      for (const id of Object.keys(nodeIndexRef.current)) {
        const el = svgEl.querySelector(`#${CSS.escape(id)}`)
        if (el) {
          el.style.cursor = 'pointer'
          el.addEventListener('click', () => handleNodeClick(id))
        }
      }
      // Force white text for visibility unless styles override
      const textNodes = svgEl.querySelectorAll('text')
      textNodes.forEach((t) => { t.setAttribute('fill', '#ffffff') })
    }
  }, [graphSvg])

  async function handleNodeClick(id) {
    const meta = nodeIndexRef.current[id]
    if (!meta) return
    const controller = new AbortController()
    try {
      setAiLoading(true)
      setAiError('')
      const text = await summarizeTopic({ ...meta, signal: controller.signal })
      setSummary(text)
    } catch (e) {
      if (e.name !== 'AbortError') setAiError(e.message || 'Failed to summarize')
    } finally {
      setAiLoading(false)
    }
  }

  function zoomIn() {
    panzoomRef.current?.zoomIn()
  }
  function zoomOut() {
    panzoomRef.current?.zoomOut()
  }
  function resetView() {
    panzoomRef.current?.resetZoom()
    panzoomRef.current?.center()
  }
  function savePng() {
    const svgEl = svgHostRef.current?.querySelector('svg')
    if (!svgEl) return
    const xml = new XMLSerializer().serializeToString(svgEl)
    const svg64 = btoa(unescape(encodeURIComponent(xml)))
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      const a = document.createElement('a')
      a.download = `${branch || 'mindmap'}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    image.src = 'data:image/svg+xml;base64,' + svg64
  }

  return (
    <div>
      <h1>Roadmap</h1>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn" onClick={savePng} disabled={!graphSvg}>Save PNG</button>
        <button className="btn" onClick={zoomIn} disabled={!graphSvg}>Zoom In</button>
        <button className="btn" onClick={zoomOut} disabled={!graphSvg}>Zoom Out</button>
        <button className="btn" onClick={resetView} disabled={!graphSvg}>Reset</button>
        <div style={{ marginLeft: 'auto', opacity: .8 }}>
          {branch ? `Branch: ${branch}` : 'Select a branch on Report page to personalize'}
        </div>
      </div>

      {aiError && <div role="alert" style={{ color: 'crimson', marginTop: 8 }}>{aiError}</div>}
      {aiLoading && <div role="status" style={{ marginTop: 8 }}>Working…</div>}

      <div className="card" style={{ marginTop: 16, height: '170vh', overflow: 'auto' }}>
        <div ref={svgHostRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {summary && (
        <section className="card" style={{ marginTop: 16, maxWidth: 860 }}>
          <h2 style={{ marginTop: 0 }}>Summary</h2>
          <div style={{ whiteSpace: 'pre-wrap' }}>{summary}</div>
        </section>
      )}
    </div>
  )
}
