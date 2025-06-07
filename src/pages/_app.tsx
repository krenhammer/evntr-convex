import { Link, Outlet } from '@tanstack/react-router'

export default function App() {
  return (
    <section style={{ margin: 24 }}>
    
      <main>
        <Outlet />
      </main>
    </section>
  )
}
