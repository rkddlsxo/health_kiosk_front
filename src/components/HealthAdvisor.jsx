import { useState, useEffect } from 'react';
import axios from 'axios';

// props로 userId를 받아서 스스로 데이터를 가져오는 똑똑한 부품
const HealthAdvisor = ({ userId }) => {
  const [advice, setAdvice] = useState("음료 습관을 분석 중입니다... ☕️");

  useEffect(() => {
    if (!userId) return;

    axios.get(`http://localhost:8000/api/analytics/advice/${userId}`)
      .then(res => setAdvice(res.data.advice))
      .catch(err => setAdvice("서버 연결 실패 ㅠ"));
  }, [userId]);

  return (
    <div style={{
      background: '#fff',
      padding: '25px',
      borderRadius: '20px',
      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
      marginTop: '20px',
      borderLeft: '6px solid #FF6B6B' // 포인트 컬러
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1.2rem' }}>
        🥤 나만의 음료 코칭
      </h3>
      <p style={{ 
        fontSize: '1rem', color: '#555', lineHeight: '1.5', margin: 0 
      }}>
        {advice}
      </p>
    </div>
  );
};

export default HealthAdvisor;