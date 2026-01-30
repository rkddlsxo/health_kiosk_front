import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoImg from '../../assets/logo.png';
import mascotImg from '../../assets/medi.png';

// --- [UI 공통 컴포넌트] ---
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '15px', border: 'none', borderRadius: '14px', cursor: 'pointer',
      background: active ? '#fff' : 'transparent',
      color: active ? '#2563EB' : '#94A3B8',
      fontWeight: 'bold',
      boxShadow: active ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
      transition: 'all 0.2s',
      fontSize: '1rem'
    }}
  >
    {children}
  </button>
);

const OptionButton = ({ selected, onClick, label }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '18px', borderRadius: '16px',
      border: selected ? '2px solid #2563EB' : '1.5px solid #F1F5F9',
      background: selected ? '#EFF6FF' : '#F8FAFC',
      color: selected ? '#2563EB' : '#64748B',
      fontWeight: selected ? 'bold' : 'normal',
      fontSize: '1rem', cursor: 'pointer', margin: '5px',
      transition: 'all 0.2s'
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
  const [mode, setMode] = useState('upload');

  // 데이터 상태
  const [healthSimple, setHealthSimple] = useState({ vision: '정상', hearing: '정상', diseases: [] });
  const [allergyList, setAllergyList] = useState([]);
  const [healthFile, setHealthFile] = useState(null);
  const [allergyFile, setAllergyFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);

  // 카메라 관련
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedFace, setCapturedFace] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    // 이미 스트림이 활성화되어 있으면 무시
    if (videoRef.current && videoRef.current.srcObject && videoRef.current.srcObject.active) return;

    try {
      stopStream();
      const constraints = step === 3
        ? { video: { facingMode: "user" } } // 얼굴은 전면
        : { video: { facingMode: "environment" } }; // 문서는 후면

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("카메라 에러:", err);
    }
  };

  useEffect(() => {
    const shouldRunCamera = step === 3 || (step < 3 && mode === 'upload' && !docPreview);
    if (shouldRunCamera) {
      startCamera();
    } else {
      stopStream();
    }
    return stopStream;
  }, [step, mode, docPreview]);

  // 촬영 기능 (기능 복구 핵심)
  const snap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      // 비디오 해상도에 맞춰 캔버스 크기 설정
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Step 3 얼굴 등록일 때만 좌우 반전 처리
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
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);
        snap();
      }
    }, 1000);
  };

  const retakePhoto = () => {
    if (step === 3) {
      setCapturedFace(null);
    } else {
      setDocPreview(null);
      setHealthFile(null);
      setAllergyFile(null);
    }
  };

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

  const handleNext = async () => {
    if (step === 1) {
      if (mode === 'upload' && !healthFile) return alert("결과지를 촬영해주세요!");
      setStep(2); setMode('upload'); setDocPreview(null); window.scrollTo(0, 0);
    }
    else if (step === 2) {
      if (mode === 'upload' && !allergyFile) return alert("검사표를 촬영해주세요!");
      setStep(3); window.scrollTo(0, 0);
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
        navigate('/main', { state: { name: userName, account_id: accountId } });
      } catch (err) { console.error(err); alert('전송 실패.'); }
    }
  };

  return (
    <div style={styles.pageBackground}>
      <style>{`body, html, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }`}</style>

      {/* 캡처를 위한 숨겨진 캔버스 (필수) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={styles.container}>
        {/* 마스코트 가이드 */}
        <div style={styles.mascotSection}>
          <div style={styles.mascotCircle}>
            <img src={mascotImg} alt="Mascot" style={styles.mascotImg} />
          </div>
          <div style={styles.bubble}>
            <span style={styles.userName}>{userName}</span>님, 안녕하세요!<br />
            <span style={styles.bubbleMessage}>
              {step === 1 && "먼저 건강검진 정보를 등록할게요."}
              {step === 2 && "식품 알레르기 정보를 알려주세요."}
              {step === 3 && "마지막으로 얼굴 촬영을 시작합니다!"}
            </span>
          </div>
        </div>

        {/* 진행 상태 바 */}
        <div style={styles.progressContainer}>
          <div style={styles.stepInfo}>Step {step} / 3</div>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        {/* 메인 설문 카드 */}
        <div style={styles.card}>
          {step < 3 && (
            <div style={styles.tabContainer}>
              <TabButton active={mode === 'upload'} onClick={() => setMode('upload')}>카메라 촬영</TabButton>
              <TabButton active={mode === 'manual'} onClick={() => setMode('manual')}>직접 입력</TabButton>
            </div>
          )}

          {/* 1. 촬영/업로드 UI */}
          {step < 3 && mode === 'upload' && (
            <div style={styles.uploadContainer}>
              {!docPreview ? (
                <div style={styles.cameraWrapper}>
                  <div style={styles.videoContainer}>
                    <video ref={videoRef} autoPlay playsInline style={styles.video} />
                    <div style={styles.cameraOverlay}>결과지를 가이드 안에 맞춰주세요</div>
                    <div style={styles.shutterContainer}>
                      <button onClick={snap} style={styles.shutterBtn}>
                        <div style={styles.shutterInner} />
                      </button>
                    </div>
                  </div>
                  <div style={styles.gallerySection}>
                    <label style={styles.galleryBtn}>
                      <span style={{ marginRight: '8px' }}>📂</span> 갤러리에서 불러오기
                      <input type="file" accept="image/*" onChange={handleDocChange} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              ) : (
                <div style={styles.previewWrapper}>
                  <div style={styles.successBadge}>📸 촬영이 완료되었습니다</div>
                  <div style={styles.previewImgContainer}>
                    <img src={docPreview} alt="Preview" style={styles.previewImg} />
                  </div>
                  <button onClick={retakePhoto} style={styles.retakeBtn}>🔄 다시 촬영하기</button>
                </div>
              )}
            </div>
          )}

          {/* 2. 직접 입력 UI (Step 1) */}
          {step === 1 && mode === 'manual' && (
            <div style={styles.manualForm}>
              <p style={styles.groupTitle}>👀 시력 및 👂 청력</p>
              <div style={styles.btnRow}>
                <OptionButton label="시력 정상" selected={healthSimple.vision === '정상'} onClick={() => setHealthSimple({ ...healthSimple, vision: '정상' })} />
                <OptionButton label="시력 나쁨" selected={healthSimple.vision === '비정상'} onClick={() => setHealthSimple({ ...healthSimple, vision: '비정상' })} />
              </div>
              <div style={styles.btnRow}>
                <OptionButton label="청력 정상" selected={healthSimple.hearing === '정상'} onClick={() => setHealthSimple({ ...healthSimple, hearing: '정상' })} />
                <OptionButton label="청력 나쁨" selected={healthSimple.hearing === '비정상'} onClick={() => setHealthSimple({ ...healthSimple, hearing: '비정상' })} />
              </div>
              <p style={{ ...styles.groupTitle, marginTop: '24px' }}>💊 현재 보유 질환</p>
              <div style={styles.grid}>
                {['고혈압', '당뇨', '고지혈증', '천식'].map(d => (
                  <OptionButton key={d} label={d} selected={healthSimple.diseases.includes(d)} onClick={() => toggleDisease(d)} />
                ))}
              </div>
            </div>
          )}

          {/* 3. 직접 입력 UI (Step 2) */}
          {step === 2 && mode === 'manual' && (
            <div style={styles.manualForm}>
              <p style={styles.groupTitle}>🚫 주의해야 할 알레르기</p>
              <div style={styles.allergyGrid}>
                {["땅콩", "우유", "계란", "새우", "복숭아", "밀가루", "항생제", "진통제", "고양이털"].map(item => (
                  <button
                    key={item}
                    onClick={() => toggleAllergy(item)}
                    style={{
                      ...styles.allergyTag,
                      border: allergyList.includes(item) ? '2px solid #2563EB' : '1.5px solid #F1F5F9',
                      background: allergyList.includes(item) ? '#EFF6FF' : '#fff',
                      color: allergyList.includes(item) ? '#2563EB' : '#64748B',
                    }}
                  >
                    {item} {allergyList.includes(item) && '✔'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. 얼굴 촬영 UI (Step 3) */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={styles.faceCameraBox}>
                {!capturedFace ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted style={styles.faceVideo} />
                    <div style={styles.faceGuide}><div style={styles.faceOval}></div></div>
                    {countdown && <div style={styles.countdownText}>{countdown}</div>}
                    <div style={styles.shutterContainer}>
                      <button onClick={startCountdownAndSnap} disabled={countdown !== null} style={styles.shutterBtn}>
                        <div style={{ ...styles.shutterInner, backgroundColor: '#2563EB' }} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ height: '100%' }}>
                    <img src={URL.createObjectURL(capturedFace)} alt="Face" style={styles.faceVideo} />
                    <button onClick={retakePhoto} style={styles.faceRetakeBtn}>🔄 다시 찍기</button>
                  </div>
                )}
              </div>
              <p style={styles.faceNotice}>3초 후 촬영됩니다. 가이드라인을 확인하세요.</p>
            </div>
          )}
        </div>

        {/* 공통 하단 버튼 */}
        <button onClick={handleNext} style={styles.nextButton}>
          {step < 3 ? '다음 단계로 👉' : '건강 정보 등록 완료 🎉'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F4F9',
    margin: 0, padding: 0,
  },
  container: {
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    boxSizing: 'border-box'
  },
  mascotSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px'
  },
  mascotCircle: {
    width: '75px', height: '75px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
    overflow: 'hidden'
  },
  mascotImg: { width: '85%', height: '85%', objectFit: 'contain' },
  bubble: {
    flex: 1, backgroundColor: '#fff',
    padding: '20px', borderRadius: '24px 24px 24px 4px',
    fontSize: '16px', color: '#334155',
    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
    lineHeight: '1.5'
  },
  userName: { fontWeight: '900', color: '#2563EB' },
  bubbleMessage: { display: 'block', marginTop: '4px', color: '#64748B' },
  progressContainer: { marginBottom: '25px', padding: '0 5px' },
  stepInfo: { fontSize: '13px', color: '#2563EB', fontWeight: '800', marginBottom: '8px', textAlign: 'right' },
  progressBarBg: { height: '10px', background: '#E2E8F0', borderRadius: '5px' },
  progressBarFill: { height: '100%', background: '#2563EB', borderRadius: '5px', transition: 'width 0.4s ease-in-out' },
  card: {
    backgroundColor: '#fff',
    borderRadius: '35px',
    padding: '35px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.04)',
    marginBottom: '25px',
    boxSizing: 'border-box',
    width: '100%',
    minHeight: '520px', // 모드 전환 시 높이 유지
    display: 'flex',
    flexDirection: 'column'
  },
  tabContainer: { display: 'flex', background: '#F1F5F9', padding: '6px', borderRadius: '18px', marginBottom: '30px' },
  uploadContainer: { width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  cameraWrapper: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  videoContainer: { position: 'relative', width: '100%', height: '360px', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#000' },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  cameraOverlay: { position: 'absolute', top: '20px', left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: '13px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' },
  shutterContainer: { position: 'absolute', bottom: '25px', left: 0, right: 0, display: 'flex', justifyContent: 'center' },
  shutterBtn: { width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'transparent', border: '4px solid #fff', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', padding: 0 },
  shutterInner: { width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#fff' },
  gallerySection: { width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' },
  galleryBtn: { padding: '14px 24px', borderRadius: '16px', border: '1.5px solid #E2E8F0', backgroundColor: '#fff', color: '#64748B', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  previewWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1 },
  successBadge: { backgroundColor: '#ECFDF5', color: '#059669', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '15px' },
  previewImgContainer: { width: '100%', height: '320px', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#000', marginBottom: '20px' },
  previewImg: { width: '100%', height: '100%', objectFit: 'contain' },
  retakeBtn: { backgroundColor: '#64748B', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '16px', cursor: 'pointer', fontWeight: '700' },
  manualForm: { textAlign: 'left', flex: 1 },
  groupTitle: { fontSize: '16px', fontWeight: '800', color: '#1E293B', marginBottom: '15px' },
  btnRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  allergyGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  allergyTag: { padding: '14px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  faceCameraBox: { width: '100%', height: '380px', backgroundColor: '#000', borderRadius: '30px', position: 'relative', overflow: 'hidden' },
  faceVideo: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
  faceGuide: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 80%)' },
  faceOval: { width: '60%', height: '70%', border: '3px dashed rgba(255,255,255,0.7)', borderRadius: '50%' },
  faceRetakeBtn: { position: 'absolute', bottom: '25px', left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', borderRadius: '25px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700' },
  countdownText: { position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '100px', fontWeight: '900', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 10 },
  faceNotice: { marginTop: '15px', fontSize: '14px', color: '#94A3B8', fontWeight: '600' },
  nextButton: { width: '100%', padding: '22px', borderRadius: '24px', backgroundColor: '#2563EB', color: '#fff', border: 'none', fontSize: '18px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 12px 24px rgba(37, 99, 235, 0.25)' }
};

export default Survey;