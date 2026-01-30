import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/User/Login';
import Register from './pages/User/Register';
import Main from './pages/Main';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />       {/* 첫 화면은 로그인 */}
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;