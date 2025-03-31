import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Spinner from "./components/Spinner";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/Home/HomePage";
import AdminLogin from "./pages/Home/Login";
import PageNotFound from "./pages/Error404";
import "antd/dist/reset.css";
import Dashboard from "./pages/Dashboard/Dashboard";
import Student from "./pages/Dashboard/Student";
import Mentor from "./pages/Dashboard/Mentor";
import AddStudents from "./pages/Dashboard/AddStudents";
import AddMentors from "./pages/Dashboard/AddMentor";
import StudentProfile from "./pages/Dashboard/StudentProfile";
import MentorProfile from "./pages/Dashboard/MentorProfile";
import Schedule from "./pages/Dashboard/Schedule";
import AddLineSchedule from "./pages/Dashboard/AddLineSchedule";
import AddClassSchedule from "./pages/Dashboard/AddClassSchedule";
import ClassSchedule from "./pages/Dashboard/ViewClassSchedule";
import LineSchedule from "./pages/Dashboard/ViewLineSchedule";
import Blog from "./pages/Home/Blog";
import Gallery from "./pages/Home/Gallery";
import Team from "./pages/Home/Team";
import AddTestScore from "./pages/Dashboard/AddTestScore";
import PerformancePage from "./pages/Performance/PerformancePage";
import StudentsScoreTabular from "./pages/Performance/StudentsScoreTabular";
import TakeAttendance from "./pages/Dashboard/TakeAttendance";
import Attendance from "./pages/Dashboard/Attendance";
import AttendanceTable from "./pages/Dashboard/AttendanceTable";
import AddTopic from "./pages/Dashboard/AddTopic";
import FindTopic from "./pages/Dashboard/FindTopic";
import ConnectWithUs from "./pages/Home/ConnectWithUs";
import ChangePassword from "./components/Dashboard/ChangePassword";
import EditProfile from "./components/Dashboard/EditProfile";
import ChangeRole from "./pages/Dashboard/ChangeRole";
import EditStudent from "./pages/Dashboard/EditStudent";
import ForgotPassword from "./pages/Home/ForgotPassword";
import Alumni from "./pages/Dashboard/Alumni";
import Notice from "./pages/Dashboard/Notice";
import BackToSchool from "./pages/Home/BackToSchool";
import Admission from "./pages/Dashboard/Admission";
import AdmittedStudents from "./pages/Dashboard/AdmittedStudents";
import AdmittedStudentProfile from "./pages/Dashboard/AdmittedStudentProfile";
import Antyodaya from "./pages/Home/Antyodaya";
import AtyodayaDashboard from "./pages/Dashboard/AntyodayaDashboard";
import AddEvent from "./pages/Dashboard/AddEvent";
import EventList from "./pages/Dashboard/EventList";
import EventDetails from "./pages/Dashboard/EventDetails";
import EditEvent from "./pages/Dashboard/EditEvent";
import AddPoc from "./pages/Dashboard/AddPoc";
import ViewPoc from "./pages/Dashboard/ViewPoc";
import AddAtyodayaParticipant from "./pages/Dashboard/AddAntyodayaParticipant";
import ViewParticipants from "./pages/Dashboard/ViewParticipant";
import ParticipantProfile from "./pages/Dashboard/ParticipantProfile";
import Issue from "./pages/Dashboard/Issue";
import JoinAsMentor from "./pages/Home/JoinAsMentor";
import Winners from "./pages/Dashboard/Winners";
import StudentScoresPictorially from "./pages/Performance/StudentScoresPictorially";
import PromoteStudents from "./pages/Dashboard/PromoteStudents";
const App = () => {
  const { loading } = useSelector((state) => state.alerts);

  return (
    <>
      <BrowserRouter>
        {loading ? (
          <Spinner />
        ) : (
          <Routes>
            <Route
              path="/Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Scores"
              element={
                <ProtectedRoute>
                  <StudentsScoreTabular />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Scores-Pict"
              element={
                <ProtectedRoute>
                  <StudentScoresPictorially />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editStudent"
              element={
                <ProtectedRoute>
                  <EditStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/changeRole"
              element={
                <ProtectedRoute>
                  <ChangeRole />
                </ProtectedRoute>
              }
            />
            checkEvents
            <Route
              path="/checkEvents"
              element={
                <ProtectedRoute>
                  <EventList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editProfile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/viewWinners"
              element={
                <ProtectedRoute>
                  <Winners />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Issue"
              element={
                <ProtectedRoute>
                  <Issue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ParticipantProfile"
              element={
                <ProtectedRoute>
                  <ParticipantProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/viewParticipants"
              element={
                <ProtectedRoute>
                  <ViewParticipants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addParticipant"
              element={
                <ProtectedRoute>
                  <AddAtyodayaParticipant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addPoc"
              element={
                <ProtectedRoute>
                  <AddPoc />
                </ProtectedRoute>
              }
            />
            <Route
              path="/viewPoc"
              element={
                <ProtectedRoute>
                  <ViewPoc />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Admission"
              element={
                <ProtectedRoute>
                  <AdmittedStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddAdmission"
              element={
                <ProtectedRoute>
                  <Admission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/PromotingStudents"
              element={
                <ProtectedRoute>
                  <PromoteStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editEvent"
              element={
                <ProtectedRoute>
                  <EditEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkAttendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/changePassword"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Antyodaya-Dashboard"
              element={
                <ProtectedRoute>
                  <AtyodayaDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/totalAttendance"
              element={
                <ProtectedRoute>
                  <AttendanceTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addEvent"
              element={
                <ProtectedRoute>
                  <AddEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/findTopic"
              element={
                <ProtectedRoute>
                  <FindTopic />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addTopic"
              element={
                <ProtectedRoute>
                  <AddTopic />
                </ProtectedRoute>
              }
            />
            <Route
              path="/takeAttendance"
              element={
                <ProtectedRoute>
                  <TakeAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admittedStudentProfile"
              element={
                <ProtectedRoute>
                  <AdmittedStudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/studentProfile"
              element={
                <ProtectedRoute>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance"
              element={
                <ProtectedRoute>
                  <PerformancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentorProfile"
              element={
                <ProtectedRoute>
                  <MentorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eventManagement"
              element={
                <ProtectedRoute>
                  <EventDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addLineSchedule"
              element={
                <ProtectedRoute>
                  <AddLineSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addClassSchedule"
              element={
                <ProtectedRoute>
                  <AddClassSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classSchedule"
              element={
                <ProtectedRoute>
                  <ClassSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lineSchedule"
              element={
                <ProtectedRoute>
                  <LineSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addTestScore"
              element={
                <ProtectedRoute>
                  <AddTestScore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Students"
              element={
                <ProtectedRoute>
                  <Student />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Schedule"
              element={
                <ProtectedRoute>
                  <Schedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Mentors"
              element={
                <ProtectedRoute>
                  <Mentor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Alumni"
              element={
                <ProtectedRoute>
                  <Alumni />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddStudents"
              element={
                <ProtectedRoute>
                  <AddStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Notice"
              element={
                <ProtectedRoute>
                  <Notice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddMentors7282vdsghbhdghd"
              element={
                <ProtectedRoute>
                  <AddMentors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Join"
              element={
                <PublicRoute>
                  <JoinAsMentor />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              }
            />
            <Route
              path="/forgotPassword"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/blog"
              element={
                <PublicRoute>
                  <Blog />
                </PublicRoute>
              }
            />
            <Route
              path="/gallery"
              element={
                <PublicRoute>
                  <Gallery />
                </PublicRoute>
              }
            />
            <Route
              path="/team"
              element={
                <PublicRoute>
                  <Team />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <PublicRoute>
                  <HomePage />
                </PublicRoute>
              }
            />
            <Route
              path="/connectWithUs"
              element={
                <PublicRoute>
                  <ConnectWithUs />
                </PublicRoute>
              }
            />
            <Route
              path="/backToSchool"
              element={
                <PublicRoute>
                  <BackToSchool />
                </PublicRoute>
              }
            />
            <Route
              path="/Antyodaya"
              element={
                <PublicRoute>
                  <Antyodaya />s
                </PublicRoute>
              }
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        )}
      </BrowserRouter>
    </>
  );
};

export default App;
