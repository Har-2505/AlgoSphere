import {Routes, Route ,Navigate } from "react-router";
import Homepage from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Admin from "./pages/Admin.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import AdminDelete from "./components/AdminDelete.jsx";
import AdminVideo from "./components/AdminVideo.jsx";
import AdminUpload from "./components/AdminUpload.jsx";
import AdminUpdate from "./components/AdminUpdate.jsx";
import {checkAuth} from "./authSlice.js"
import { useDispatch,useSelector} from "react-redux";
import ProblemPage from "./pages/ProblemPage.jsx";
import Profile from "./pages/Profile.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import {useEffect} from "react";
function App()
{
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-300">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return(
 <Routes>
<Route path="/" element={isAuthenticated?  <Homepage></Homepage>:<Navigate to="/signup"></Navigate>} />
<Route path="/login" element={isAuthenticated?<Navigate to="/"></Navigate>:<Login></Login>} />
 <Route path="/signup" element={isAuthenticated?<Navigate to="/"></Navigate>:<Signup></Signup>} />
 <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin></Admin> : <Navigate to="/"></Navigate>} />
 <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel></AdminPanel> : <Navigate to="/"></Navigate>} />
 <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete></AdminDelete> : <Navigate to="/"></Navigate>} />
 <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate></AdminUpdate> : <Navigate to="/"></Navigate>} />
 <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo></AdminVideo> : <Navigate to="/"></Navigate>} />
 <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload></AdminUpload> : <Navigate to="/"></Navigate>} />
 <Route path="/problem/:problemId" element={isAuthenticated ? <ProblemPage></ProblemPage> : <Navigate to="/login"></Navigate>} />
 <Route path="/profile" element={isAuthenticated ? <Profile></Profile> : <Navigate to="/login"></Navigate>} />
 <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard></Leaderboard> : <Navigate to="/login"></Navigate>} />
 </Routes>
  )
}
export default App;