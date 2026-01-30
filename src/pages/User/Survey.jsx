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
  // ★ 초기값을 'upload'로 설정하여 진입 시 바로 카메라 탭이 보이게 함
  const [mode, setMode] = useState('upload'); 

  // 데이터 상태
  const [healthSimple, setHealthSimple] = useState({ 
    vision: '정상', hearing: '정상', diseases: [] 
  });
  const [allergyList, setAllergyList] = useState([]);
  
  const [healthFile, setHealthFile] = useState(null);
  const [allergyFile, setAllergyFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);

  // 얼굴 촬영 관련
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedFace, setCapturedFace] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // --- 카메라 스트림 제어 함수 ---
  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    // 이미 스트림이 있으면 중복 실행 방지
    if (videoRef.current && videoRef.current.srcObject && videoRef.current.srcObject.active) return;

    try {
      stopStream(); // 기존 스트림 정리

      // Step 3(얼굴)는 전면, Step 1,2(문서)는 후면 카메라(environment) 권장
      const constraints = step === 3 
        ? { video: true } 
        : { video: { facingMode: "environment" } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("카메라 에러:", err);
      // 권한 에러 시 alert은 한 번만 띄우거나 UI로 처리
    }
  };

  // ★ useEffect: 조건에 따라 카메라 자동 실행/중지
  useEffect(() => {
    // 카메라를 켜야 하는 상황:
    // 1. Step 3 (얼굴 등록) - 항상
    // 2. Step 1, 2 (문서) - 모드가 upload이고, 아직 사진(docPreview)이 없을 때
    const shouldRunCamera = step === 3 || (step < 3 && mode === 'upload' && !docPreview);

    if (shouldRunCamera) {
      startCamera();
    } else {
      stopStream();
    }

    // Cleanup: 컴포넌트 언마운트 시 스트림 정지
    return stopStream;
  }, [step, mode, docPreview]);


  // 사진 찍기 (찰칵)
  const snap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Step 3(얼굴)일 때만 거울 모드(좌우반전)
      if (step === 3) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const previewUrl = URL.createObjectURL(blob);

        if (step === 1) {
          setHealthFile(blob);
          setDocPreview(previewUrl);
          // docPreview가 생기면 useEffect에 의해 카메라는 자동으로 꺼짐
        } else if (step === 2) {
          setAllergyFile(blob);
          setDocPreview(previewUrl);
        } else {
          setCapturedFace(blob);
        }
      }, 'image/jpeg');
    }
  };

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

  // 재촬영 버튼
  const retakePhoto = () => {
    if (step === 3) {
      setCapturedFace(null);
    } else {
      setDocPreview(null);
      setHealthFile(null);
      setAllergyFile(null);
      // docPreview를 null로 만들면 useEffect가 다시 카메라를 켭니다.
    }
  };

  // --- 파일 선택 핸들러 ---
  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocPreview(URL.createObjectURL(file));
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

  // --- 다음 단계 진행 ---
  const handleNext = async () => {
    if (step === 1) {
      if (mode === 'upload' && !healthFile) return alert("결과지를 촬영해주세요!");
      setStep(2);
      setMode('upload'); 
      setDocPreview(null);
      window.scrollTo(0, 0);
    } 
    else if (step === 2) {
      if (mode === 'upload' && !allergyFile) return alert("검사표를 촬영해주세요!");
      setStep(3);
      window.scrollTo(0, 0);
    } 
    else {
      if (!capturedFace) return alert("얼굴을 등록해주세요!");
      try {
        const faceFormData = new FormData();
        faceFormData.append("file", capturedFace, "face.jpg");
        await axios.post(`http://localhost:8000/api/users/${accountId}/face`, faceFormData);

        if (healthFile) {
          const healthFormData = new FormData();
          healthFormData.append("file", healthFile, "health.jpg");
          await axios.post(`http://localhost:8000/api/users/${accountId}/health/scan`, healthFormData);
        } else {
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

        if (allergyFile) {
          const allergyFormData = new FormData();
          allergyFormData.append("file", allergyFile, "allergy.jpg");
          await axios.post(`http://localhost:8000/api/users/${accountId}/allergies/scan`, allergyFormData);
        } else {
          for (const item of allergyList) {
            await axios.post(`http://localhost:8000/api/users/${accountId}/allergies`, { 
              allergen_name: item, severity: '중간' 
            });
          }
        }
        alert('등록 완료! 이제 키오스크를 이용해보세요.');
             // account_id를 함께 묶어서 보냅니다.
        navigate('/main', { 
          state: { 
            name: userName, 
            account_id: accountId // ★ 이 부분이 빠져있었습니다!
         } 
        });
      } catch (err) {
        console.error(err);
        alert('전송 실패.');
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

      {/* === [Step 1 & 2 공통] 촬영/업로드 UI === */}
      {step < 3 && mode === 'upload' && (
        <div style={{ textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '15px', border: '1px solid #eee' }}>
          
          {/* 이미지가 없을 땐 무조건 카메라, 있으면 프리뷰 */}
          {!docPreview ? (
            /* 1. 카메라 화면 (기본) */
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <div style={{ 
                width: '100%', height: '400px', background: '#000', borderRadius: '15px', 
                overflow: 'hidden', position: 'relative', marginBottom: '15px'
              }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              
              {/* 촬영 버튼 */}
              <button 
                onClick={snap}
                style={{ padding: '15px 40px', borderRadius: '30px', background: '#FF4D4D', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(255, 77, 77, 0.3)', marginBottom: '20px' }}
              >
                촬영 📸
              </button>

              {/* 구분선 */}
              <div style={{ borderTop: '1px solid #eee', margin: '10px 0 20px 0' }}></div>

              {/* 파일 업로드 버튼 (보조) */}
              <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                <div style={{ 
                  padding: '10px 20px', borderRadius: '20px', background: '#f8f9fa', color: '#555', 
                  border: '1px solid #ddd', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px'
                }}>
                  📂 갤러리에서 찾기
                </div>
                <input type="file" accept="image/*" onChange={handleDocChange} style={{ display: 'none' }} />
              </label>
            </div>
          ) : (
            /* 2. 찍은 사진 확인 (프리뷰) */
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <p style={{ color: '#007BFF', fontWeight: 'bold', marginBottom: '15px' }}>
                📸 사진이 등록되었습니다!
              </p>
              
              <div style={{ 
                width: '100%', height: '350px', borderRadius: '15px',
                background: '#000', overflow: 'hidden', marginBottom: '20px', position: 'relative'
              }}>
                <img src={docPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

              {/* 재촬영 / 삭제 버튼 */}
              <button 
                onClick={retakePhoto}
                style={{ 
                  padding: '12px 25px', borderRadius: '25px', background: '#444', color: '#fff', 
                  border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' 
                }}
              >
                🔄 다시 찍기 / 삭제
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 1 Manual (간편입력) - 기존 코드 유지 */}
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
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>💊 보유 질환</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              {['고혈압', '당뇨', '고지혈증', '천식'].map(d => (
                <OptionButton key={d} label={d} selected={healthSimple.diseases.includes(d)} onClick={() => toggleDisease(d)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Manual - 기존 코드 유지 */}
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

      {/* Step 3 (얼굴 등록) - 기존 코드 유지 */}
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

      {/* 하단 버튼 */}
      <button onClick={handleNext} style={{ width: '100%', padding: '18px', marginTop: '30px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
        {step < 3 ? '다음 단계 👉' : '등록 완료 및 시작 🎉'}
      </button>

    </div>
  );
}

export default Survey;