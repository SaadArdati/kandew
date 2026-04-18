import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'

export default function Layout({ onLogout }) {
  return (
    <div className="h-screen bg-surface text-on-surface transition-colors flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto min-h-0">
        <Outlet context={{ onLogout }} />
      </main>
    </div>
  )
}
