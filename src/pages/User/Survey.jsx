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
  
  // 파일 저장용 State (★ 추가됨)
  const [healthFile, setHealthFile] = useState(null);   // Step 1 사진
  const [allergyFile, setAllergyFile] = useState(null); // Step 2 사진
  const [docPreview, setDocPreview] = useState(null);   // 화면 표시용

  // 얼굴 촬영 관련
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedFace, setCapturedFace] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // 카메라 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("카메라 에러:", err);
      alert("카메라 권한을 확인해주세요.");
    }
  };

  // 사진 찍기 함수
  const snap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => setCapturedFace(blob), 'image/jpeg');
    }
  };

  // 카운트다운 촬영
  const startCountdownAndSnap = () => {
    let count = 3;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      if (count > 0) setCountdown(count);
      else {
        clearInterval(timer);
        setCountdown(null);
        snap();
      }
    }, 1000);
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
    if (file) {
      setDocPreview(URL.createObjectURL(file));
      // 현재 단계에 따라 파일 저장 (★ 추가됨)
      if (step === 1) setHealthFile(file);
      if (step === 2) setAllergyFile(file);
    }
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

  // --- 다음 단계 및 최종 전송 (★ 여기가 핵심 로직 수정됨) ---
  const handleNext = async () => {
    // [Step 1] 건강검진 -> Step 2
    if (step === 1) {
      if (mode === 'upload' && !healthFile) return alert("결과지를 촬영해주세요!");
      setStep(2);
      setMode('manual');
      setDocPreview(null); // 미리보기 초기화
      window.scrollTo(0, 0);
    } 
    // [Step 2] 알레르기 -> Step 3
    else if (step === 2) {
      if (mode === 'upload' && !allergyFile) return alert("검사표를 촬영해주세요!");
      setStep(3);
      window.scrollTo(0, 0);
    } 
    // [Step 3] 최종 전송
    else {
      if (!capturedFace) return alert("얼굴을 등록해주세요!");

      try {
        // 1. 얼굴 사진 전송 (무조건 전송)
        const faceFormData = new FormData();
        faceFormData.append("file", capturedFace, "face.jpg");
        await axios.post(`http://localhost:8000/api/users/${accountId}/face`, faceFormData);

        // 2. 건강 정보 전송 (분기 처리 ★)
        if (healthFile) {
          // 사진이 있으면 -> /scan API 호출
          const healthFormData = new FormData();
          healthFormData.append("file", healthFile);
          await axios.post(`http://localhost:8000/api/users/${accountId}/health/scan`, healthFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          // 사진이 없으면(수동) -> /health API 호출
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
          await axios.post(`http://localhost:8000/api/users/${accountId}/health`, healthPayload);
        }

        // 3. 알레르기 정보 전송 (분기 처리 ★)
        if (allergyFile) {
          // 사진이 있으면 -> /scan API 호출
          const allergyFormData = new FormData();
          allergyFormData.append("file", allergyFile);
          await axios.post(`http://localhost:8000/api/users/${accountId}/allergies/scan`, allergyFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          // 사진이 없으면(수동) -> /allergies API 호출 (리스트 반복 전송)
          for (const item of allergyList) {
            await axios.post(`http://localhost:8000/api/users/${accountId}/allergies`, { 
              allergen_name: item, severity: '중간' 
            });
          }
        }

        alert('등록 완료! 이제 키오스크를 이용해보세요.');
        navigate('/main', { state: { name: userName } });

      } catch (err) {
        console.error(err);
        alert('전송 실패. 백엔드 연결을 확인해주세요.');
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

      {/* === [공통] 사진 업로드 UI === */}
      {step < 3 && mode === 'upload' && (
        <div style={{ textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '15px', border: '1px solid #eee' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>
             {step === 1 ? '건강검진 결과지를 찍어주세요.' : '알레르기 검사 결과지를 찍어주세요.'}
          </p>
          <label style={{ cursor: 'pointer' }}>
            <div style={{ 
              width: '100%', height: '250px', border: '3px dashed #ddd', borderRadius: '15px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#fafafa', overflow: 'hidden'
            }}>
              {docPreview ? (
                <img src={docPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <>
                  <span style={{ fontSize: '3rem' }}>📸</span>
                  <span style={{ marginTop: '10px', color: '#aaa', fontWeight: 'bold' }}>촬영하기 / 파일 선택</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" capture="environment" onChange={handleDocChange} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {/* === [Step 1] 건강검진 간편 입력 === */}
      {step === 1 && mode === 'manual' && (
        <div>
          <div style={{ marginBottom: '25px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>👀 시력 / 👂 청력 상태</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <OptionButton label="시력 정상" selected={healthSimple.vision === '정상'} onClick={() => setHealthSimple({...healthSimple, vision: '정상'})} />
              <OptionButton label="시력 나쁨" selected={healthSimple.vision === '비정상'} onClick={() => setHealthSimple({...healthSimple, vision: '비정상'})} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <OptionButton label="청력 정상" selected={healthSimple.hearing === '정상'} onClick={() => setHealthSimple({...healthSimple, hearing: '정상'})} />
              <OptionButton label="청력 나쁨" selected={healthSimple.hearing === '비정상'} onClick={() => setHealthSimple({...healthSimple, hearing: '비정상'})} />
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>💊 보유 질환 (중복 선택 가능)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              {['고혈압', '당뇨', '고지혈증', '천식'].map(d => (
                <OptionButton key={d} label={d} selected={healthSimple.diseases.includes(d)} onClick={() => toggleDisease(d)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === [Step 2] 알레르기 간편 선택 === */}
      {step === 2 && mode === 'manual' && (
        <div>
          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>🚫 해당하는 알레르기 선택</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {["땅콩", "우유", "계란", "새우/게", "복숭아", "밀가루", "항생제", "진통제", "고양이털"].map(item => (
              <button
                key={item}
                onClick={() => toggleAllergy(item)}
                style={{
                  padding: '12px 18px', borderRadius: '25px',
                  border: allergyList.includes(item) ? '2px solid #FF6B6B' : '1px solid #eee',
                  background: allergyList.includes(item) ? '#FFF0F0' : '#fff',
                  color: allergyList.includes(item) ? '#FF6B6B' : '#555',
                  fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {item} {allergyList.includes(item) && '✔'}
              </button>
            ))}
          </div>
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
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                <div style={{
                  position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
                  background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.7) 70%)',
                  pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ width: '60%', height: '50%', border: '3px dashed rgba(255, 255, 255, 0.8)', borderRadius: '50%' }}></div>
                </div>
                {countdown && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    fontSize: '10rem', fontWeight: 'bold', color: 'white', textShadow: '0 0 20px rgba(0,0,0,0.5)', zIndex: 10
                  }}>{countdown}</div>
                )}
              </>
            ) : (
              <img src={URL.createObjectURL(capturedFace)} alt="Face" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            {!capturedFace ? (
              <button onClick={startCountdownAndSnap} disabled={countdown !== null} style={{ width: '70px', height: '70px', borderRadius: '50%', background: countdown ? '#ccc' : '#ff4d4d', border: '5px solid #fff', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem' }}>📷</span>
              </button>
            ) : (
              <button onClick={retakePhoto} style={{ padding: '12px 25px', borderRadius: '25px', background: '#666', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                🔄 다시 찍기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 하단 완료 버튼 */}
      <button onClick={handleNext} style={{ width: '100%', padding: '18px', marginTop: '30px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
        {step < 3 ? '다음 단계 👉' : '등록 완료 및 시작 🎉'}
      </button>

    </div>
  );
}

export default Survey;