import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TotalSolutionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Main에서 넘겨준 ID 받기
  const accountId = location.state?.account_id; 
  const userName = location.state?.name || "사용자";

  const [solution, setSolution] = useState("사용자의 데이터를 심층 분석 중입니다... 🩺");

  useEffect(() => {
    // ★ 수정 포인트: userId -> accountId로 변경
    if (!accountId) {
      alert("잘못된 접근입니다. 다시 로그인해주세요.");
      navigate('/'); 
      return;
    }

    // ★ 수정 포인트: API 호출 시 변수명 변경 (userId -> accountId)
    axios.get(`http://localhost:8000/api/analytics/total_solution/${accountId}`)
      .then(res => setSolution(res.data.solution))
      .catch(err => setSolution("분석 서버 연결 실패 ㅠ"));

  }, [accountId, navigate]); // ★ 의존성 배열도 accountId로 변경

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f4f6f9', 
      padding: '20px',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <div style={{ 
        maxWidth: '420px', 
        width: '100%', 
        background: '#fff', 
        borderRadius: '24px', 
        padding: '30px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        
        {/* 헤더 & 뒤로가기 */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#333' }}>📋 상세 건강 리포트</h2>
            <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
        </div>

        <p style={{ color: '#666', marginBottom: '20px' }}>
          <strong style={{ color: '#007bff' }}>{userName}</strong>님을 위한 AI 분석 결과입니다.
        </p>
        
        {/* 분석 내용 박스 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '16px', 
          lineHeight: '1.6', 
          color: '#444', 
          whiteSpace: 'pre-line',
          border: '1px solid #e9ecef'
        }}>
          {solution}
        </div>

        {/* 하단 버튼 */}
        <button 
          onClick={() => navigate(-1)}
          style={{
            width: '100%',
            marginTop: '25px',
            padding: '15px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          확인했습니다
        </button>

      </div>
    </div>
  );
};

export default TotalSolutionPage;