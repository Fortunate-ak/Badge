import './App.css'
import DashboardLayout from './ui/layouts/dashboard'
import { Route, Routes } from 'react-router'
import ApplicantRoutes from './pages/applicant'
import OpportunityRoutes from './pages/opportunity'
import AuthRoutes from './pages/auth'


function App() {

  return (
      <Routes>
        {/*<Route path="/" element={<Myapp />} />*/}
        <Route element={<DashboardLayout />}>
        {ApplicantRoutes()}
        {OpportunityRoutes()}
      </Route>

      {AuthRoutes()}

    </Routes>
  )
}


export default App;
