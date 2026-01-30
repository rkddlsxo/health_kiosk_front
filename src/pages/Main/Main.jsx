import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Main() {
  const location = useLocation();
  const navigate = useNavigate();

  // 로그인 화면에서 넘겨받은 데이터 (없을 경우 기본값)
  const userName = location.state?.name || "사용자";

  // 중요: 백엔드 API 경로가 /{account_id}/advice 이므로, 실제 DB의 account_id가 필요합니다.
  // 로그인 시 account_id를 state로 넘겨주어야 합니다. (테스트용 기본값: user123)
  const accountId = location.state?.account_id || "user123";

  // 상태 관리
  const [advice, setAdvice] = useState('');       // AI 조언 텍스트 저장
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [showModal, setShowModal] = useState(false); // 모달 표시 여부

  // AI 건강 리포트 요청 함수
  const handleGetAdvice = async () => {
    setIsLoading(true);
    try {
      // 백엔드 API 호출 (경로 수정: /api/users/{account_id}/advice)
      const response = await axios.get(`http://localhost:8000/api/users/${accountId}/advice`);
      setAdvice(response.data); // 결과 저장
      setShowModal(true);       // 모달 열기
    } catch (error) {
      console.error(error);
      alert("건강 리포트를 불러오는 데 실패했습니다.\n" + (error.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };

  // 결제 수단 버튼 클릭 시
  const handlePaymentClick = () => {
    alert("💳 결제 수단 관리 기능은 준비 중입니다.\n(등록된 카드로 자동 결제됩니다.)");
  };

  return (
    // [외부 컨테이너]
    <div style={{
      width: '100%', height: '100%', minHeight: '100vh',
      background: '#2d3436', display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* [키오스크 프레임] */}
      <div style={{
        width: '100%', maxWidth: '600px', height: '90%', maxHeight: '800px',
        background: '#f5f6fa', borderRadius: '30px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px 30px', position: 'relative', boxSizing: 'border-box'
      }}>

        {/* 1. 상단 장식 */}
        <div style={{ marginBottom: '20px', color: '#b2bec3', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem' }}>
          Medi-Pass Kiosk
        </div>

        {/* 2. 메인 컨텐츠 영역 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', textAlign: 'center' }}>

          <div style={{ fontSize: '5rem', marginBottom: '20px', animation: 'wobble 2s infinite ease-in-out' }}>
            🎉
            <style>{`
              @keyframes wobble {
                0% { transform: rotate(0deg); }
                15% { transform: rotate(-10deg); }
                30% { transform: rotate(10deg); }
                45% { transform: rotate(-5deg); }
                60% { transform: rotate(5deg); }
                75% { transform: rotate(0deg); }
                100% { transform: rotate(0deg); }
              }
            `}</style>
          </div>

          <h1 style={{ fontSize: '2rem', color: '#2d3436', marginBottom: '15px', fontWeight: '800', lineHeight: '1.3' }}>
            환영합니다,<br />
            <span style={{ color: '#0984e3' }}>{userName}</span>님!
          </h1>

          <p style={{ color: '#636e72', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px' }}>
            모든 데이터가 안전하게 확인되었습니다.<br />
            오늘도 건강한 하루 되세요 🌿
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '50px' }}>
            <StatusBadge icon="👤" text="본인 인증 완료" color="#00b894" bg="#daf7f1" />
            <StatusBadge icon="🏥" text="검진 데이터 연동" color="#6c5ce7" bg="#e8e3fc" />
          </div>

          {/* 3. 액션 버튼 영역 */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>

            {/* [수정됨] AI 건강 리포트 조회 버튼 */}
            <button
              onClick={handleGetAdvice}
              disabled={isLoading}
              style={{
                width: '100%', padding: '20px', fontSize: '1.2rem',
                background: isLoading ? '#bdc3c7' : 'linear-gradient(135deg, #0984e3, #74b9ff)',
                color: 'white', border: 'none', borderRadius: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', boxShadow: '0 8px 20px rgba(9, 132, 227, 0.3)',
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}
              onMouseDown={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isLoading ? (
                <span>⏳ 분석 중입니다...</span>
              ) : (
                <>🤖 AI 건강 리포트 조회</>
              )}
            </button>

            {/* 결제 수단 관리 */}
            <button
              onClick={handlePaymentClick}
              style={{
                width: '100%', padding: '18px', fontSize: '1.1rem',
                background: 'white', color: '#636e72', border: '2px solid #dfe6e9',
                borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#b2bec3'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#dfe6e9'}
            >
              💳 결제 수단 관리
            </button>
          </div>
        </div>

        {/* 4. 하단 로그아웃 */}
        <div style={{ marginTop: '30px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent', border: 'none', color: '#b2bec3',
              textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500'
            }}
          >
            로그아웃
          </button>
        </div>

      </div>

      {/* [결과 모달] 건강 조언 표시 */}
      {showModal && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '20px', boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'white', width: '100%', maxWidth: '500px', maxHeight: '80vh',
            borderRadius: '20px', padding: '30px', display: 'flex', flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#2d3436', fontSize: '1.5rem' }}>📋 AI 건강 분석 결과</h2>

            {/* 스크롤 가능한 텍스트 영역 */}
            <div style={{
              flex: 1, overflowY: 'auto', background: '#f8f9fa', padding: '20px',
              borderRadius: '10px', marginBottom: '20px', color: '#444',
              lineHeight: '1.6', whiteSpace: 'pre-wrap', textAlign: 'left',
              fontSize: '1rem', border: '1px solid #eee'
            }}>
              {advice && typeof advice === 'object' ? (
                <>
                  <h3 style={{ color: '#2d3436' }}>🥗 식습관 가이드</h3>
                  <p>{advice.diet_advice}</p>

                  <h3 style={{ color: '#e17055', marginTop: '20px' }}>⚠️ 알레르기 주의</h3>
                  <p>{advice.allergy_advice}</p>

                  <h3 style={{ color: '#00b894', marginTop: '20px' }}>🏃‍♂️ 운동 추천</h3>
                  <p>{advice.exercise_advice}</p>
                </>
              ) : (
                <p>{typeof advice === 'string' ? advice : "분석 데이터를 불러오는 중입니다..."}</p>
              )}
            </div>

            <button
              onClick={closeModal}
              style={{
                padding: '15px', background: '#2d3436', color: 'white',
                border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// 상태 배지 컴포넌트
const StatusBadge = ({ icon, text, color, bg }) => (
  <div style={{
    padding: '10px 18px', background: bg, borderRadius: '25px', color: color,
    fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center',
    gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  }}>
    <span style={{ fontSize: '1.1rem' }}>{icon}</span> {text}
  </div>
);

export default Main;