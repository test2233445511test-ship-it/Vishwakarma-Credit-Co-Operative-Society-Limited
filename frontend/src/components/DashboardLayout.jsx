import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopNav />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  )
}
