import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/User/Login';
import Register from './pages/User/Register';
import Main from './pages/Main';
import Survey from './pages/User/Survey'; // ★ 추가

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Main />} />
        <Route path="/survey" element={<Survey />} /> {/* ★ 추가 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;