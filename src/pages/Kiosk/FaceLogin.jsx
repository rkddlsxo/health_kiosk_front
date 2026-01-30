import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function FaceLogin() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [status, setStatus] = useState("대기 중... 얼굴을 비춰주세요 😊");
  const [isScanning, setIsScanning] = useState(true); // 스캔 중 여부

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
      // 나갈 때 카메라 끄기
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. 주기적으로 얼굴 캡처해서 서버로 전송 (3초마다)
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      detectFace();
    }, 3000); // 3초 간격으로 시도

    return () => clearInterval(interval);
  }, [isScanning]);

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // 캡처
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // Blob 변환 후 전송
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const formData = new FormData();
      formData.append("file", blob, "current_face.jpg");

      try {
        setStatus("🔍 얼굴 확인 중...");
        
        // ★ API 명세에 맞춘 엔드포인트 호출
        const res = await axios.post("http://localhost:8000/api/kiosk/detect-face", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.match === true) {
          // 로그인 성공!
          setIsScanning(false); // 스캔 중단
          setStatus(`🎉 환영합니다, ${res.data.name}님!`);
          
          // 2초 뒤 메뉴판으로 이동
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
    <div style={{ 
      height: '100vh', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', background: '#222', color: '#fff' 
    }}>
      <h1 style={{ marginBottom: '20px', fontSize: '2.5rem' }}>Health Kiosk</h1>
      
      <div style={{ 
        width: '500px', height: '400px', borderRadius: '20px', overflow: 'hidden', 
        border: '5px solid #007BFF', position: 'relative', background: '#000'
      }}>
        <video 
          ref={videoRef} autoPlay playsInline muted 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
        />
        {/* 얼굴 가이드라인 */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '250px', height: '300px', border: '3px dashed rgba(255,255,255,0.7)', borderRadius: '50%'
        }}></div>
      </div>
      
      <p style={{ marginTop: '30px', fontSize: '1.5rem', fontWeight: 'bold' }}>{status}</p>
      
      {/* 캔버스는 숨김 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <button 
        onClick={() => navigate("/")}
        style={{ marginTop: '50px', padding: '10px 20px', background: 'transparent', border: '1px solid #666', color: '#aaa', borderRadius: '5px' }}
      >
        (관리자) 회원가입 화면으로
      </button>
    </div>
  );
}

export default FaceLogin;