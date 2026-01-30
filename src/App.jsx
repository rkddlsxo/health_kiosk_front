import React from 'react'; // React import 추가
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main/Main';
import Login from './pages/User/Login';
import Register from './pages/User/Register';
import Survey from './pages/User/Survey';
import FaceLogin from './pages/Kiosk/FaceLogin';
import Menu from './pages/Kiosk/Menu';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Main />} />
        <Route path="/survey" element={<Survey />} />

        {/* 키오스크 관련 */}
        <Route path="/kiosk" element={<FaceLogin />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </Router>
  );
}

export default App;