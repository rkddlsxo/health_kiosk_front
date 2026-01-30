import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    account_id: '',
    password: '',
    name: ''
  });

  // 입력창 포커스 상태 관리를 위한 간단한 상태 (선택 사항)
  const [focusedInput, setFocusedInput] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/user/register', formData);
      alert('회원가입 성공! DB를 확인해보세요.');
    } catch (error) {
      alert('가입 실패: ' + (error.response?.data?.detail || '오류 발생'));
      console.error(error);
    }
  };

  // 공통 입력 스타일
  const inputStyle = (name) => ({
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    borderRadius: '12px',
    border: focusedInput === name ? '1px solid #4CAF50' : '1px solid #e0e0e0',
    background: '#f9fafb',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box', // 패딩 포함 너비 계산
    color: '#333'
  });

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: '#f0f2f5',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'white',
        padding: '50px 40px',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)', // 더 부드럽고 넓은 그림자
        border: '1px solid rgba(255, 255, 255, 0.8)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>📝</div>
        <h2 style={{
          color: '#1a1a1a',
          marginBottom: '10px',
          fontSize: '2rem',
          fontWeight: '800'
        }}>회원가입</h2>
        <p style={{
          color: '#6b7280',
          marginBottom: '40px',
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>간편하게 가입하고<br />건강 관리를 시작하세요.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>아이디</label>
            <input
              type="text"
              name="account_id"
              value={formData.account_id}
              onChange={handleChange}
              placeholder="예: user123"
              style={inputStyle('account_id')}
              onFocus={() => setFocusedInput('account_id')}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              style={inputStyle('password')}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="실명 입력"
              style={inputStyle('name')}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '15px',
              padding: '18px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: '700',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.25)',
              transition: 'transform 0.1s ease, box-shadow 0.2s ease',
              letterSpacing: '0.5px'
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'scale(0.98)';
              e.target.style.boxShadow = 'none';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.25)';
            }}
          >
            가입하기 🚀
          </button>
        </form>

        <div style={{ marginTop: '30px', borderTop: '1px solid #f3f4f6', paddingTop: '25px' }}>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            이미 계정이 있으신가요?
            <Link to="/" style={{
              color: '#4CAF50',
              textDecoration: 'none',
              fontWeight: '700',
              marginLeft: '8px',
              transition: 'color 0.2s'
            }}>
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;