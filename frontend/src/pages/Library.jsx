export default function Library() {
  const resources = [
    { name: 'Official Docs', url: 'https://react.dev' },
    { name: 'Tutorials', url: 'https://developer.mozilla.org/' },
    { name: 'Community', url: 'https://stackoverflow.com/' },
  ]

  return (
    <div>
      <h1>Library</h1>
      <p>Handy resources to accelerate your learning.</p>
      <ul>
        {resources.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noreferrer">
              {r.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
