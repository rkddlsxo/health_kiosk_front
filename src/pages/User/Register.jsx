import { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    account_id: '',
    password: '',
    name: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 백엔드 서버(8000번 포트)로 데이터 전송
      await axios.post('http://localhost:8000/user/register', formData);
      alert('회원가입 성공! DB를 확인해보세요.');
    } catch (error) {
      alert('가입 실패: ' + (error.response?.data?.detail || '오류 발생'));
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>키오스크 회원가입</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>아이디: </label>
          <input 
            type="text" 
            name="account_id" 
            value={formData.account_id} 
            onChange={handleChange} 
            placeholder="예: user123"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label>비밀번호: </label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label>이름: </label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
          가입하기
        </button>
      </form>
    </div>
  );
}

export default Register;