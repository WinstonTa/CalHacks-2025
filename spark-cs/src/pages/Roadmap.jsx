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
      <div style={{ display: 'grid', gap: 16 }}>
        {steps.map((s, idx) => (
          <div key={idx} style={{ border: '1px solid #444', borderRadius: 8, padding: 16 }}>
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
