import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [account_id, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // 페이지 이동용 훅

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/user/login', {
        account_id,
        password
      });
      
      // 로그인 성공 시 메인 페이지로 이동 (이름 데이터 함께 전달)
      alert('로그인 성공!');
      navigate('/main', { state: { name: res.data.name } });

    } catch (error) {
      alert('로그인 실패: 아이디나 비밀번호를 확인하세요.');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>키오스크 로그인</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="아이디" 
          value={account_id}
          onChange={(e) => setAccountId(e.target.value)}
          style={{ padding: '10px' }}
        />
        <input 
          type="password" 
          placeholder="비밀번호" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none' }}>
          로그인
        </button>
      </form>
      
      <p style={{ marginTop: '20px' }}>
        계정이 없으신가요? <Link to="/register">회원가입 하러가기</Link>
      </p>
    </div>
  );
}

export default Login;