import { useLocation, useNavigate } from 'react-router-dom';

function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const userName = location.state?.name || "사용자";

  // 결제 수단 버튼 클릭 시 (시늉만 함)
  const handlePaymentClick = () => {
    alert("💳 결제 수단 관리 기능은 준비 중입니다.\n(등록된 카드로 자동 결제됩니다.)");
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f6f9', // 배경색: 아주 연한 회색 (눈이 편안함)
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '20px'
    }}>
      
      {/* 메인 카드 컨테이너 */}
      <div style={{ 
        maxWidth: '420px', // 모바일~태블릿 사이즈에 최적화
        width: '100%',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.08)', // 부드럽고 깊은 그림자
        padding: '40px 30px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '25px' // 요소 사이 간격 일괄 적용
      }}>
        
        {/* 1. 환영 헤더 */}
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '10px', fontWeight: '800' }}>
            환영합니다, <span style={{ color: '#007BFF' }}>{userName}</span>님! 🎉
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
            모든 데이터가 안전하게 등록되었습니다.<br/>
            이제 맞춤형 키오스크를 경험해보세요.
          </p>
        </div>

        {/* 2. 상태 배지 (데이터 등록 확인용) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px',
          flexWrap: 'wrap' 
        }}>
          <StatusBadge icon="👤" text="얼굴 등록됨" />
          <StatusBadge icon="🏥" text="건강 데이터 분석됨" />
        </div>

        {/* 구분선 */}
        <div style={{ height: '1px', background: '#eee', width: '100%' }}></div>

        {/* 3. 액션 버튼 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          
          {/* 서브: 결제 수단 관리 (요청하신 부분) */}
          <button 
            onClick={handlePaymentClick} 
            style={{ 
              width: '100%',
              padding: '16px', 
              fontSize: '1rem', 
              background: '#fff', 
              color: '#444', 
              border: '1px solid #ddd', // 회색 테두리로 구분
              borderRadius: '16px', 
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            💳 결제 수단 등록 / 관리
          </button>
        </div>

        {/* 4. 하단 로그아웃 */}
        <div>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#999', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            로그아웃
          </button>
        </div>

      </div>
    </div>
  );
}

// 작은 컴포넌트: 상태 배지 (디자인 통일성을 위해 분리)
const StatusBadge = ({ icon, text }) => (
  <div style={{ 
    padding: '8px 14px', 
    background: '#F0F7FF', 
    borderRadius: '20px', 
    color: '#007BFF', 
    fontWeight: '600',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }}>
    <span>{icon}</span> {text}
  </div>
);

export default Main;