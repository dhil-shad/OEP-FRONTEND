import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterInstitution from './pages/RegisterInstitution'
import InstitutionDashboard from './pages/InstitutionDashboard'
import ExamDashboard from './pages/ExamDashboard'
import CreateExam from './pages/CreateExam'
import ManageExam from './pages/ManageExam'
import TakeExam from './pages/TakeExam'
import ResultDashboard from './pages/ResultDashboard'
import GradingDashboard from './pages/GradingDashboard'
import GradeSubmission from './pages/GradeSubmission'
import JoinExam from './pages/JoinExam'
import JoinInstitution from './pages/JoinInstitution'
import JoinInstitutionInstructor from './pages/JoinInstitutionInstructor'
import Profile from './pages/Profile'
import DepartmentDetails from './pages/DepartmentDetails'
import SectionDetails from './pages/SectionDetails'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import './App.css'

function App() {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  return (
    <>
      {!isLandingPage && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-institution" element={<RegisterInstitution />} />
        <Route path="/institution" element={<InstitutionDashboard />} />
        <Route path="/institution/departments/:id" element={<DepartmentDetails />} />
        <Route path="/institution/sections/:id" element={<SectionDetails />} />
        <Route path="/dashboard" element={<ExamDashboard />} />
        <Route path="/exams/create" element={<CreateExam />} />
        <Route path="/exams/:id" element={<ManageExam />} />
        <Route path="/exams/:id/take" element={<TakeExam />} />
        <Route path="/my-results" element={<ResultDashboard />} />
        <Route path="/grading" element={<GradingDashboard />} />
        <Route path="/exams/:examId/grade/:subId" element={<GradeSubmission />} />
        <Route path="/exam/join/:code" element={<JoinExam />} />
        <Route path="/join-institution" element={<JoinInstitution />} />
        <Route path="/instructor/join-institution" element={<JoinInstitutionInstructor />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      </Routes>
    </>
  )
}

export default App
