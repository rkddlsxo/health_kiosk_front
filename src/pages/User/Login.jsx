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
      // 1. 백엔드로 로그인 요청 (주소에 /user 포함 확인)
      const res = await axios.post('http://localhost:8000/user/login', {
        account_id,
        password
      });
      
      // 2. 로그인 성공 시 처리
      alert(`환영합니다, ${res.data.name}님! 건강 정보를 입력해주세요.`);
      
      // 3. 설문조사 페이지(/survey)로 이동하면서 사용자 정보(아이디, 이름)를 전달
      navigate('/survey', { 
        state: { 
          account_id: res.data.account_id, 
          name: res.data.name 
        } 
      });

    } catch (error) {
      console.error(error);
      alert('로그인 실패: 아이디나 비밀번호를 확인하세요.');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#333' }}>키오스크 로그인</h2>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
        <input 
          type="text" 
          placeholder="아이디" 
          value={account_id}
          onChange={(e) => setAccountId(e.target.value)}
          style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
        <input 
          type="password" 
          placeholder="비밀번호" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
        
        <button 
          type="submit" 
          style={{ 
            padding: '12px', 
            backgroundColor: '#007BFF', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            fontSize: '18px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          로그인 후 정보 입력하기
        </button>
      </form>
      
      <p style={{ marginTop: '20px', color: '#666' }}>
        아직 계정이 없으신가요? <br/>
        <Link to="/register" style={{ color: '#007BFF', textDecoration: 'none', fontWeight: 'bold' }}>
          회원가입 하러가기
        </Link>
      </p>
    </div>
  );
}

export default Login;