import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- [UI 컴포넌트] ---
const TabButton = ({ active, onClick, children }) => (
  <button 
    onClick={onClick}
    style={{ 
      flex: 1, padding: '15px', border: 'none', borderRadius: '10px', cursor: 'pointer',
      background: active ? '#fff' : 'transparent',
      color: active ? '#007BFF' : '#888',
      fontWeight: 'bold', boxShadow: active ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.2s'
    }}
  >
    {children}
  </button>
);

const OptionButton = ({ selected, onClick, label }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '15px', borderRadius: '12px',
      border: selected ? '2px solid #007BFF' : '1px solid #ddd',
      background: selected ? '#E7F1FF' : '#fff',
      color: selected ? '#007BFF' : '#666',
      fontWeight: selected ? 'bold' : 'normal',
      fontSize: '1rem', cursor: 'pointer', margin: '5px'
    }}
  >
    {label} {selected && '✔'}
  </button>
);

function Survey() {
  const location = useLocation();
  const navigate = useNavigate();
  const accountId = location.state?.account_id;
  const userName = location.state?.name || "사용자";

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('manual');

  // 데이터 상태
  const [healthSimple, setHealthSimple] = useState({ 
    vision: '정상', hearing: '정상', diseases: [] 
  });
  const [allergyList, setAllergyList] = useState([]);
  const [docPreview, setDocPreview] = useState(null);
  
  // --- [얼굴 촬영 관련 상태] ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedFace, setCapturedFace] = useState(null);
  const [countdown, setCountdown] = useState(null); // 카운트다운 숫자 (3, 2, 1)

  // 카메라 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("카메라 에러:", err);
      alert("카메라 권한을 확인해주세요.");
    }
  };

  // 실제 사진 찍는 함수 (내부용)
  const snap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // 좌우 반전해서 그리기
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        setCapturedFace(blob);
      }, 'image/jpeg');
    }
  };

  // 사용자가 버튼 누르면 -> 3초 카운트다운 후 촬영
  const startCountdownAndSnap = () => {
    let count = 3;
    setCountdown(count); // 3 표시

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count); // 2, 1 표시
      } else {
        clearInterval(timer);
        setCountdown(null); // 숫자 숨김
        snap(); // 찰칵!
      }
    }, 1000); // 1초마다 실행
  };

  const retakePhoto = () => {
    setCapturedFace(null);
    startCamera();
  };

  useEffect(() => {
    if (step === 3) startCamera();
    return () => {
      if (step !== 3 && videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  // --- 데이터 핸들러 ---
  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (file) setDocPreview(URL.createObjectURL(file));
  };

  const toggleDisease = (name) => {
    setHealthSimple(prev => ({
      ...prev,
      diseases: prev.diseases.includes(name) ? prev.diseases.filter(d => d !== name) : [...prev.diseases, name]
    }));
  };

  const toggleAllergy = (name) => {
    setAllergyList(prev => prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]);
  };

  // --- 다음 단계 및 전송 ---
  const handleNext = async () => {
    if (step === 1) {
      if (mode === 'upload' && !docPreview) return alert("결과지를 촬영해주세요!");
      setStep(2);
      setMode('manual');
      setDocPreview(null);
      window.scrollTo(0, 0);
    } 
    else if (step === 2) {
      if (mode === 'upload' && !docPreview) return alert("검사표를 촬영해주세요!");
      setStep(3);
      window.scrollTo(0, 0);
    } 
    else {
      if (!capturedFace) return alert("얼굴을 등록해주세요!");

      try {
        const faceFormData = new FormData();
        faceFormData.append("file", capturedFace, "face.jpg");
        await axios.post(`http://localhost:8000/user/${accountId}/face-register`, faceFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const healthPayload = {
          vision_l: healthSimple.vision === '정상' ? 1.0 : 0.5,
          vision_r: healthSimple.vision === '정상' ? 1.0 : 0.5,
          hearing_l: healthSimple.hearing,
          hearing_r: healthSimple.hearing,
          has_hypertension: healthSimple.diseases.includes('고혈압'),
          has_diabetes: healthSimple.diseases.includes('당뇨'),
          has_hyperlipidemia: healthSimple.diseases.includes('고지혈증'),
          has_asthma: healthSimple.diseases.includes('천식'),
        };
        await axios.put(`http://localhost:8000/user/${accountId}/health-info`, healthPayload);

        // 알레르기 리스트 전송 (API가 리스트를 받도록 수정되었다고 가정, 아니면 for문 사용)
        for (const item of allergyList) {
          await axios.post(`http://localhost:8000/user/${accountId}/allergies`, { 
            allergen_name: item, severity: '중간' 
          });
        }

        alert('등록 완료! 얼굴 인식으로 로그인해보세요.');
        navigate('/main', { state: { name: userName } });

      } catch (err) {
        console.error(err);
        alert('전송 실패. 백엔드를 확인해주세요.');
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* 상단 진행바 */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.6rem', color: '#333', marginBottom: '10px' }}>
          {step === 1 && 'Step 1. 건강 상태'}
          {step === 2 && 'Step 2. 알레르기'}
          {step === 3 && 'Step 3. 얼굴 등록'}
        </h2>
        <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px' }}>
          <div style={{ width: `${(step/3)*100}%`, height: '100%', background: '#007BFF', borderRadius: '3px', transition: 'width 0.3s' }}></div>
        </div>
      </div>

      {step < 3 && (
        <div style={{ display: 'flex', marginBottom: '20px', background: '#f1f3f5', borderRadius: '12px', padding: '5px' }}>
          <TabButton active={mode === 'upload'} onClick={() => setMode('upload')}>
            📷 {step === 1 ? '결과지 촬영' : '검사표 촬영'}
          </TabButton>
          <TabButton active={mode === 'manual'} onClick={() => setMode('manual')}>
            👆 {step === 1 ? '간편 입력' : '알레르기 선택'}
          </TabButton>
        </div>
      )}

      {/* Step 1 & 2 UI 생략 (기존과 동일하므로 공간 절약 위해... 실제로는 아까 코드 그대로 쓰시면 됩니다) */}
      {/* (여기에 Step 1, 2 코드들이 그대로 있어야 합니다. 아까 드린 코드의 Step 1, 2 부분 유지!) */}
      {step === 1 && mode === 'manual' && (
         /* ... 아까 드린 Step 1 코드 ... */
         <div>
             {/* 임시로 간단히 표시 */}
             <p>건강 상태 체크</p>
             <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
               <OptionButton label="시력 정상" selected={healthSimple.vision==='정상'} onClick={()=>setHealthSimple({...healthSimple, vision:'정상'})}/>
               <OptionButton label="시력 나쁨" selected={healthSimple.vision==='비정상'} onClick={()=>setHealthSimple({...healthSimple, vision:'비정상'})}/>
             </div>
             {/* ... */}
         </div>
      )}
      
      {/* === [Step 3] 얼굴 가이드 + 타이머 UI === */}
      {step === 3 && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '15px', color: '#666', fontSize: '1.1rem' }}>
            가이드라인 안에 얼굴을 맞춰주세요.<br/>
            촬영 버튼을 누르면 <b>3초 뒤</b>에 찍힙니다.
          </p>

          <div style={{ 
            width: '100%', maxWidth: '400px', height: '450px', margin: '0 auto',
            background: '#000', borderRadius: '20px', overflow: 'hidden', position: 'relative' 
          }}>
            {!capturedFace ? (
              <>
                {/* 비디오 화면 */}
                <video 
                  ref={videoRef} autoPlay playsInline muted 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
                />
                
                {/* ★ 얼굴 가이드라인 (Overlay) ★ */}
                <div style={{
                  position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
                  background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.7) 70%)', // 주변 어둡게
                  pointerEvents: 'none', // 클릭 통과
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {/* 타원형 테두리 */}
                  <div style={{
                    width: '60%', height: '50%', 
                    border: '3px dashed rgba(255, 255, 255, 0.8)', 
                    borderRadius: '50%'
                  }}></div>
                </div>

                {/* ★ 카운트다운 숫자 표시 ★ */}
                {countdown && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    fontSize: '10rem', fontWeight: 'bold', color: 'white', textShadow: '0 0 20px rgba(0,0,0,0.5)',
                    zIndex: 10
                  }}>
                    {countdown}
                  </div>
                )}
              </>
            ) : (
              // 찍은 후 미리보기
              <img 
                src={URL.createObjectURL(capturedFace)} alt="Face" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
              />
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            {!capturedFace ? (
              // 카운트다운 시작 버튼
              <button 
                onClick={startCountdownAndSnap}
                disabled={countdown !== null} // 카운트다운 중엔 클릭 방지
                style={{ 
                  width: '70px', height: '70px', borderRadius: '50%', 
                  background: countdown ? '#ccc' : '#ff4d4d', 
                  border: '5px solid #fff', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {/* 카메라 아이콘 */}
                <span style={{ fontSize: '2rem' }}>📷</span>
              </button>
            ) : (
              <button 
                onClick={retakePhoto}
                style={{ 
                  padding: '12px 25px', borderRadius: '25px', background: '#666', 
                  color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
                }}
              >
                🔄 마음에 안 들어요 (다시 찍기)
              </button>
            )}
          </div>
        </div>
      )}

      {/* 하단 완료 버튼 */}
      <button 
        onClick={handleNext} 
        style={{ 
          width: '100%', padding: '18px', marginTop: '30px', 
          background: '#007BFF', color: 'white', border: 'none', 
          borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' 
        }}
      >
        {step < 3 ? '다음 단계 👉' : '등록 완료 및 시작 🎉'}
      </button>

    </div>
  );
}

export default Survey;