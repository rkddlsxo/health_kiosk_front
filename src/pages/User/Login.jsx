import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

function Login() {
  const [account_id, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/user/login', {
        account_id,
        password
      });
      alert(`환영합니다, ${res.data.name}님!`);
      navigate('/survey', {
        state: { account_id: res.data.account_id, name: res.data.name }
      });
    } catch (error) {
      console.error(error);
      alert('로그인 실패: 아이디나 비밀번호를 확인하세요.');
    }
  };

  return (
    <div style={styles.pageBackground}>
      {/* 글로벌 스타일을 대체하기 위한 인라인 스타일 설정 (여백 제거) */}
      <style>
        {`
          body { margin: 0; padding: 0; overflow: hidden; }
        `}
      </style>

      <div style={styles.card}>
        {/* 상단 헤더: 로고와 타이틀의 간격을 좁혀 일체감을 줌 */}
        <header style={styles.header}>
          <img src={logoImg} alt="Medi-Pass" style={styles.logo} />
          <div style={styles.titleGroup}>
            <h2 style={styles.title}>키오스크 로그인</h2>
            <p style={styles.subtitle}>서비스 이용을 위해 로그인해주세요</p>
          </div>
        </header>

        {/* 입력 폼: 요소 간의 비율을 황금비로 조정 */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="아이디"
              value={account_id}
              onChange={(e) => setAccountId(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.loginButton}>
            로그인 및 시작하기
          </button>
        </form>

        <footer style={styles.footer}>
          <span style={styles.footerText}>처음 방문하셨나요?</span>
          <Link to="/register" style={styles.registerLink}>
            회원가입 하러가기
          </Link>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    // 배경이 짤리는 문제를 해결하기 위해 고정 위치와 전체 크기 확보
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F6FA', // 눈이 편안한 연한 그레이 블루
    margin: 0,
    padding: 0,
  },
  card: {
    padding: '50px 40px',
    width: '100%',
    maxWidth: '420px', // 키오스크에서 가독성이 가장 좋은 너비
    backgroundColor: '#ffffff',
    borderRadius: '35px', // 더 둥글게 하여 부드러운 인상
    boxShadow: '0 20px 50px rgba(0, 70, 184, 0.08)', // 은은한 푸른색 그림자
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '35px',
  },
  logo: {
    height: '45px', // 로고 텍스트 크기에 맞춰 비율 조정
    width: 'auto',
    marginBottom: '15px',
    objectFit: 'contain',
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  title: {
    fontSize: '24px',
    color: '#1A365D', // 신뢰감 있는 다크 네이비
    fontWeight: '850',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '18px 22px',
    fontSize: '16px',
    borderRadius: '18px',
    border: '1.5px solid #EDF2F7',
    backgroundColor: '#F8FAFC',
    outline: 'none',
    color: '#2D3748',
    transition: 'all 0.2s ease',
    // 포커스 시 파란색 테두리 효과를 주면 더 예쁩니다.
  },
  loginButton: {
    padding: '20px',
    backgroundColor: '#3182CE', // Medi-Pass 로고와 어울리는 블루
    color: '#ffffff',
    border: 'none',
    borderRadius: '18px',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(49, 130, 206, 0.3)',
    transition: 'transform 0.1s active',
  },
  footer: {
    marginTop: '35px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  },
  footerText: {
    fontSize: '14px',
    color: '#A0AEC0',
  },
  registerLink: {
    fontSize: '14px',
    color: '#3182CE',
    textDecoration: 'none',
    fontWeight: '700',
    borderBottom: '1.5px solid #3182CE',
    paddingBottom: '2px',
  }
};

export default Login;