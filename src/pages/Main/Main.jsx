import { useLocation, useNavigate } from 'react-router-dom';

function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 로그인/설문조사 페이지에서 넘겨준 이름 받기
  const userName = location.state?.name || "사용자";

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '2.5rem', color: '#007BFF', marginBottom: '20px' }}>
        🎉 환영합니다, {userName}님!
      </h1>
      
      <div style={{ 
        padding: '30px', 
        borderRadius: '20px', 
        background: '#f8f9fa', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '40px'
      }}>
        <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '20px' }}>
          건강 데이터와 알레르기 정보가 안전하게 등록되었습니다.<br/>
          이제 키오스크에서 얼굴 인식으로 맞춤 서비스를 이용할 수 있습니다.
        </p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <div style={{ padding: '15px 25px', background: '#e7f1ff', borderRadius: '15px', color: '#007BFF', fontWeight: 'bold' }}>
            ✅ 얼굴 인식 등록 완료
          </div>
          <div style={{ padding: '15px 25px', background: '#e7f1ff', borderRadius: '15px', color: '#007BFF', fontWeight: 'bold' }}>
            ✅ 건강 데이터 분석 완료
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={() => navigate('/kiosk')} 
          style={{ 
            padding: '15px 30px', 
            fontSize: '1.1rem', 
            background: '#007BFF', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🚀 키오스크 모드 실행하기
        </button>

        <button 
          onClick={() => navigate('/')} 
          style={{ 
            padding: '15px 30px', 
            fontSize: '1rem', 
            background: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer' 
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default Main;