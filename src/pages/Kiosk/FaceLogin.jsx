import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function FaceLogin() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [status, setStatus] = useState("대기 중... 얼굴을 비춰주세요 😊");
  const [isScanning, setIsScanning] = useState(true);

  // 1. 카메라 시작
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error(err);
        setStatus("카메라를 켤 수 없습니다.");
      }
    };
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. 주기적으로 얼굴 캡처
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      detectFace();
    }, 3000);
    return () => clearInterval(interval);
  }, [isScanning]);

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "current_face.jpg");

      try {
        setStatus("🔍 얼굴 확인 중...");

        const res = await axios.post("http://localhost:8000/api/kiosk/detect-face", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.match === true) {
          setIsScanning(false);
          setStatus(`🎉 환영합니다, ${res.data.name}님!`);
          setTimeout(() => {
            navigate("/menu", { state: { user: res.data } });
          }, 2000);
        } else {
          setStatus("등록된 사용자가 아닙니다. 다시 시도해주세요.");
        }
      } catch (err) {
        console.error("인식 실패:", err);
        setStatus("얼굴 인식 중 오류가 발생했습니다.");
      }
    }, 'image/jpeg');
  };

  return (
    // [외부 컨테이너] PC 화면 전체를 어둡게 하고 중앙 정렬 (Menu 컴포넌트와 통일)
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '100vh',
      background: '#2d3436', // 바깥 배경색
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'sans-serif'
    }}>

      {/* [키오스크 프레임] 중앙에 위치하는 기기 화면 */}
      <div style={{
        width: '100%',
        maxWidth: '600px', // 너비 제한
        height: '100%',
        maxHeight: '100vh',
        background: '#f5f6fa', // 안쪽 배경색
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)', // 입체감 있는 그림자
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* 상단 헤더 영역 */}
        <div style={{ marginTop: '80px', marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.2rem', color: '#2d3436', margin: 0, fontWeight: '800' }}>Medi-Pass</h1>
          <p style={{ color: '#636e72', marginTop: '10px', fontSize: '1rem' }}>카메라를 정면으로 응시해주세요</p>
        </div>

        {/* 카메라 영역 */}
        <div style={{
          width: '85%',
          maxWidth: '400px',
          aspectRatio: '3/4', // 세로형 비율 (증명사진 비율)
          borderRadius: '30px',
          overflow: 'hidden',
          position: 'relative',
          background: '#000',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          border: '8px solid white'
        }}>
          {/* 비디오 (좌우반전) */}
          <video
            ref={videoRef} autoPlay playsInline muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />

          {/* 얼굴 가이드라인 (점선 원) */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '65%', height: '45%',
            border: '3px dashed rgba(255,255,255,0.6)',
            borderRadius: '50%',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)' // 원 바깥을 어둡게 처리하여 집중도 향상
          }}></div>

          {/* 스캔 애니메이션 효과 (선이 위아래로 움직임) */}
          {isScanning && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              pointerEvents: 'none'
            }}>
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '4px',
                background: '#00cec9',
                boxShadow: '0 0 10px #00cec9',
                animation: 'scanAnimation 2s infinite ease-in-out'
              }}></div>
              <style>{`
                 @keyframes scanAnimation {
                   0% { top: 10%; opacity: 0; }
                   10% { opacity: 1; }
                   90% { opacity: 1; }
                   100% { top: 90%; opacity: 0; }
                 }
               `}</style>
            </div>
          )}
        </div>

        {/* 상태 메시지 */}
        <div style={{
          marginTop: '40px',
          padding: '15px 30px',
          background: 'white',
          borderRadius: '50px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          textAlign: 'center',
          minWidth: '250px'
        }}>
          <p style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: status.includes('환영합니다') ? '#00b894' : '#0984e3',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            {status}
          </p>
        </div>

        {/* 캔버스 (숨김) */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* 하단 관리자 버튼 */}
        <div style={{ marginTop: 'auto', marginBottom: '40px' }}>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              color: '#b2bec3',
              borderRadius: '5px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            처음으로 (회원가입)
          </button>
        </div>

      </div>
    </div>
  );
}

export default FaceLogin;