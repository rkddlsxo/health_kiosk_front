// 파일 위치: src/pages/Main/Main.jsx

import { useLocation, useNavigate } from 'react-router-dom';
import HealthAdvisor from '../../components/HealthAdvisor'; 
// import TotalSolution from ... (이제 여기서 직접 임포트 안 해도 됨, 라우터에서 처리)

function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const userName = location.state?.name || "사용자";
  const accountId = location.state?.account_id;

  // ★ 상세 페이지로 이동 함수
  const goToTotalSolution = () => {
    // accountId가 없을 경우 예외처리 (안전장치)
    if (!accountId) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      navigate('/');
      return;
    }

    // 이동하면서 account_id와 name을 짐(state)으로 싸서 보냄
    navigate('/solution', { 
      state: { 
        account_id: accountId, 
        name: userName 
      } 
    });
  };

  const handlePaymentClick = () => {
    alert("💳 결제 수단 관리 기능은 준비 중입니다.");
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9', padding: '20px' }}>
      <div style={{ maxWidth: '420px', width: '100%', background: '#ffffff', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.08)', padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 헤더 */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '5px' }}>
            <span style={{ color: '#007BFF' }}>{userName}</span>님의 건강 리포트
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>오늘의 건강 상태를 분석했습니다.</p>
        </div>

        {/* 1. 간단 음료 코칭 (Main에서 바로 보임) */}
        {/* 주의: src/components/HealthAdvisor.jsx 파일이 있어야 에러가 안 납니다! */}
        <HealthAdvisor userId={accountId} />

        {/* 2. ★ 종합 건강 솔루션 버튼 (클릭 시 이동!) */}
        <button 
          onClick={goToTotalSolution}
          style={{
            background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', // 강조되는 그라데이션
            color: 'white',
            padding: '18px',
            borderRadius: '16px',
            border: 'none',
            fontSize: '1.05rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(37, 117, 252, 0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🩺 AI 종합 건강 정밀 분석 보러가기
        </button>

        <div style={{ height: '1px', background: '#eee', width: '100%', margin: '10px 0' }}></div>

        {/* 결제 관리 등 기타 버튼 */}
        <button onClick={handlePaymentClick} style={{ width: '100%', padding: '16px', background: '#f8f9fa', color: '#444', border: '1px solid #ddd', borderRadius: '16px', cursor: 'pointer', fontWeight: '600' }}>
            💳 결제 수단 / 내 정보 관리
        </button>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#999', textDecoration: 'underline', cursor: 'pointer' }}>로그아웃</button>
        </div>

      </div>
    </div>
  );
}

export default Main;