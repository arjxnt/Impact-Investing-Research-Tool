import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Investments from './pages/Investments'
import InvestmentDetail from './pages/InvestmentDetail'
import Analytics from './pages/Analytics'
import Tasks from './pages/Tasks'
import AuditLog from './pages/AuditLog'
import VersionHistory from './pages/VersionHistory'
import ClimateRisk from './pages/ClimateRisk'
import Emissions from './pages/Emissions'
import SocialImpact from './pages/SocialImpact'
import ESG from './pages/ESG'
import Reports from './pages/Reports'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Layout>
          <ErrorBoundary>
            <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/investments" element={<Investments />} />
                  <Route path="/investments/:id" element={<InvestmentDetail />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/audit-log" element={<AuditLog />} />
                  <Route path="/versions/:entityType/:entityId" element={<VersionHistory />} />
                  <Route path="/climate-risk" element={<ClimateRisk />} />
                  <Route path="/emissions" element={<Emissions />} />
                  <Route path="/social-impact" element={<SocialImpact />} />
                  <Route path="/esg" element={<ESG />} />
                  <Route path="/reports" element={<Reports />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </ErrorBoundary>
    </Router>
  )
}

export default App

