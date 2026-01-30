import { useLocation, useNavigate } from 'react-router-dom';

function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 로그인 화면에서 넘겨준 유저 이름 받기 (없으면 '사용자'로 표시)
  const userName = location.state?.name || '사용자';

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>환영합니다, {userName}님!</h1>
      <p>원하시는 서비스를 선택해주세요.</p>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
        <button style={{ padding: '20px', fontSize: '18px' }}>🏥 증상 체크</button>
        <button style={{ padding: '20px', fontSize: '18px' }}>💊 약국 찾기</button>
      </div>

      <button 
        onClick={() => navigate('/')} 
        style={{ marginTop: '50px', background: '#ccc' }}
      >
        로그아웃
      </button>
    </div>
  );
}

export default Main;