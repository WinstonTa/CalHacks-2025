export default function Roadmap() {
  const steps = [
    { title: 'Foundations', items: ['Basics', 'Tools setup', 'Time plan'] },
    { title: 'Core Skills', items: ['Concept A', 'Concept B', 'Project 1'] },
    { title: 'Applied Practice', items: ['Project 2', 'Feedback loop'] },
    { title: 'Mastery', items: ['Capstone', 'Portfolio', 'Interview prep'] },
  ]

  return (
    <div>
      <h1>Roadmap</h1>
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {steps.map((s, idx) => (
          <div key={idx} className="card">
            <h2 style={{ marginTop: 0 }}>{s.title}</h2>
            <ol>
              {s.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  )
}
