import { useLocation, useNavigate } from 'react-router-dom';

function Main() {
  const location = useLocation();
  const navigate = useNavigate();

  // 로그인 화면에서 넘겨준 유저 이름 받기 (없으면 '사용자'로 표시)
  const userName = location.state?.name || '사용자';

  return (
    // [외부 컨테이너] 어두운 배경 + 중앙 정렬
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#2d3436',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* [키오스크 프레임] 둥근 모서리 카드 */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        height: '90%',
        maxHeight: '800px',
        background: '#f5f6fa',
        borderRadius: '30px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 30px',
        position: 'relative',
        boxSizing: 'border-box'
      }}>

        {/* 1. 상단 로고 */}
        <div style={{
          marginBottom: '30px',
          color: '#b2bec3',
          fontWeight: 'bold',
          letterSpacing: '1px',
          fontSize: '0.9rem'
        }}>
          Medi-Pass Kiosk
        </div>

        {/* 2. 환영 메시지 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2rem',
            color: '#2d3436',
            margin: '0 0 10px 0',
            fontWeight: '800'
          }}>
            환영합니다, <span style={{ color: '#0984e3' }}>{userName}</span>님!
          </h1>
          <p style={{ color: '#636e72', fontSize: '1.1rem', margin: 0 }}>
            원하시는 서비스를 선택해주세요.
          </p>
        </div>

        {/* 3. 메인 서비스 버튼 영역 (카드 형태) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          flex: 1,
          justifyContent: 'center'
        }}>

          {/* 버튼 1: 증상 체크 */}
          <ServiceCard
            icon="🏥"
            title="증상 체크 / 병원 찾기"
            desc="아픈 곳을 선택하고 병원을 추천받으세요"
            color="#e17055"
            bg="#fff0e6"
            onClick={() => alert('증상 체크 기능으로 이동합니다.')}
          />

          {/* 버튼 2: 약국 찾기 */}
          <ServiceCard
            icon="💊"
            title="주변 약국 찾기"
            desc="내 위치 근처의 약국을 찾아드립니다"
            color="#00b894"
            bg="#e3fbf7"
            onClick={() => alert('약국 찾기 기능으로 이동합니다.')}
          />

          {/* (추가 제안) 버튼 3: 건강검진 메뉴 추천 (기존 기능 연결) */}
          <ServiceCard
            icon="🥗"
            title="맞춤 식단 주문"
            desc="건강검진 결과를 바탕으로 메뉴 추천"
            color="#6c5ce7"
            bg="#f0f0ff"
            onClick={() => navigate('/menu', { state: { user: { name: userName } } })}
          />

        </div>

        {/* 4. 하단 로그아웃 */}
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '30px',
            background: 'transparent',
            border: 'none',
            color: '#b2bec3',
            textDecoration: 'underline',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: '10px'
          }}
        >
          로그아웃
        </button>

      </div>
    </div>
  );
}

// [내부 컴포넌트] 서비스 카드 버튼
function ServiceCard({ icon, title, desc, color, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '25px',
        background: 'white',
        border: `2px solid ${bg}`, // 은은한 테두리
        borderRadius: '20px',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        width: '100%'
      }}
      // 마우스 올렸을 때 효과
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = color;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
        e.currentTarget.style.borderColor = bg;
      }}
    >
      {/* 아이콘 영역 */}
      <div style={{
        fontSize: '2.5rem',
        background: bg,
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '20px',
        flexShrink: 0
      }}>
        {icon}
      </div>

      {/* 텍스트 영역 */}
      <div>
        <h3 style={{
          margin: '0 0 5px 0',
          fontSize: '1.2rem',
          color: '#2d3436',
          fontWeight: '800'
        }}>
          {title}
        </h3>
        <p style={{
          margin: 0,
          fontSize: '0.95rem',
          color: '#636e72'
        }}>
          {desc}
        </p>
      </div>

      {/* 화살표 아이콘 (우측 끝) */}
      <div style={{ marginLeft: 'auto', color: '#b2bec3', fontSize: '1.2rem' }}>
        ➜
      </div>
    </button>
  );
}

export default Main;