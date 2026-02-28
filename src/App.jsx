import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ExamDashboard from './pages/ExamDashboard'
import CreateExam from './pages/CreateExam'
import ManageExam from './pages/ManageExam'
import TakeExam from './pages/TakeExam'
import ResultDashboard from './pages/ResultDashboard'
import GradingDashboard from './pages/GradingDashboard'
import GradeSubmission from './pages/GradeSubmission'
import JoinExam from './pages/JoinExam'
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
        <Route path="/dashboard" element={<ExamDashboard />} />
        <Route path="/exams/create" element={<CreateExam />} />
        <Route path="/exams/:id" element={<ManageExam />} />
        <Route path="/exams/:id/take" element={<TakeExam />} />
        <Route path="/my-results" element={<ResultDashboard />} />
        <Route path="/grading" element={<GradingDashboard />} />
        <Route path="/exams/:examId/grade/:subId" element={<GradeSubmission />} />
        <Route path="/exam/join/:code" element={<JoinExam />} />
      </Routes>
    </>
  )
}

export default App
