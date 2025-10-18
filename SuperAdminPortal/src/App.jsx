
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/login/login'
import DashboardPage from './components/Pages/Dashboard'
import ReportPage from './components/Pages/Report'
import AdminProtectdRoute from './components/protectedroutes/protect'
import EmployeePage from './components/Pages/Employee'
import SummaryReportPage from './components/Pages/MyCampsReport'
import EmpanormBlitzPage from './components/Pages/EmpanormBlitz'
import BccDistributionPage from './components/Pages/BccDistributionPage'
import PrescriptionUploadPage from './components/Pages/PrescriptionUploadPage'
import CathlabPage from './components/Pages/CathlabPage'
import MyCampsAbmPage from './components/Pages/MyCampsAbmPage'
import CamptypePage from './components/Pages/CamptypePage'
import MonthlyCampPage from './components/Pages/MonthlyCampPage'
import MonthlyCampsReportPage from './components/Pages/MonthlyCampsReportPage'
import ClientPage from './components/Pages/ClientPage'
import DepartmentPage from './components/Pages/DepartmentPage'




function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/camptype' element={<AdminProtectdRoute><CamptypePage /></AdminProtectdRoute>}></Route>
        <Route path='/monthlyCamp' element={<AdminProtectdRoute><MonthlyCampPage /></AdminProtectdRoute>}></Route>
         <Route path='/clients' element={<AdminProtectdRoute><ClientPage /></AdminProtectdRoute>}></Route>
          <Route path='/departments' element={<AdminProtectdRoute><DepartmentPage /></AdminProtectdRoute>}></Route>
        <Route path='/dashboard' element={<AdminProtectdRoute><DashboardPage /></AdminProtectdRoute>}></Route>
        <Route path='/report' element={<AdminProtectdRoute><ReportPage /></AdminProtectdRoute>}></Route>
        <Route path='/employee' element={<AdminProtectdRoute><EmployeePage /></AdminProtectdRoute>}></Route>
        <Route path='/myCampsReport' element={<AdminProtectdRoute><SummaryReportPage /></AdminProtectdRoute>}></Route>
        <Route path='/empanormBlitz' element={<AdminProtectdRoute><EmpanormBlitzPage /></AdminProtectdRoute>}></Route>
        <Route path='/bccDistribution' element={<AdminProtectdRoute><BccDistributionPage /></AdminProtectdRoute>}></Route>
        <Route path='/prescriptionUpload' element={<AdminProtectdRoute><PrescriptionUploadPage /></AdminProtectdRoute>}></Route>
        <Route path='/cathlabRequests' element={<AdminProtectdRoute><CathlabPage /></AdminProtectdRoute>}></Route>
        <Route path='/myCampsAbmReport' element={<AdminProtectdRoute><MyCampsAbmPage /></AdminProtectdRoute>}></Route>
        <Route path='/monthlyCampsReport' element={<AdminProtectdRoute><MonthlyCampsReportPage /></AdminProtectdRoute>}></Route>

      </Routes>
    </>
  )
}

export default App
