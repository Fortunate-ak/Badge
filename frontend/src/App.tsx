import './App.css'
import DashboardLayout from './ui/layouts/dashboard'
import { Route, Routes } from 'react-router'
import ApplicantRoutes from './pages/applicant'
import OpportunityRoutes from './pages/opportunity'
import AuthRoutes from './pages/auth'
import HomePage from './pages/home'
import InstitutionRoutes from './pages/institution'


function App() {

  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<DashboardLayout />}>
          {ApplicantRoutes()}
          {OpportunityRoutes()}
          {InstitutionRoutes()}
        </Route>
      {AuthRoutes()}

    </Routes>
  )
}


export default App;
