import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Menu() {
  const location = useLocation();
  const navigate = useNavigate();

  // 사용자 정보 (없으면 기본값)
  const user = location.state?.user || { id: 1, name: "손님" };

  // user.id가 없으면 user_id 필드 사용 (호환성 처리)
  const userId = user.id || user.user_id;

  const [menuData, setMenuData] = useState({
    recommended_menus: [],
    normal_menus: [],
    allergy_menus: [],
    health_menus: []
  });

  const [activeTab, setActiveTab] = useState("recommend");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // ID가 아예 없는 경우
      if (!userId) {
        alert("사용자 정보를 불러오는데 실패했습니다. 다시 로그인해주세요.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 타임아웃 설정 제거 (AI 분석이 오래 걸려도 기다림)
        const res = await axios.get(`http://localhost:8000/api/recommend/${userId}`);

        const rec = res.data.recommended_menus || [];
        const norm = res.data.normal_menus || [];
        const all = res.data.allergy_menus || [];
        const heal = res.data.health_menus || [];

        setMenuData({
          recommended_menus: rec,
          normal_menus: norm,
          allergy_menus: all,
          health_menus: heal
        });

        // 추천 메뉴가 있으면 추천 탭, 없으면 일반 탭
        if (rec.length === 0) {
          setActiveTab("normal");
        } else {
          setActiveTab("recommend");
        }

      } catch (err) {
        console.error("추천 데이터 로딩 실패:", err);
        // 에러 발생 시 조용히 일반 메뉴 탭으로 이동 (사용자 경험 유지)
        setActiveTab("normal");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  const addToCart = (item, isRecommended = false) => {
    const cartItem = { ...item };
    if (isRecommended && item.selected_options?.length > 0) {
      cartItem.name = `${item.name} (${item.selected_options.join(', ')})`;
    }
    setCart([...cart, cartItem]);
  };

  const clearCart = () => setCart([]);

  const handleOrder = () => {
    if (cart.length === 0) return;
    alert(`${cart.length}개 메뉴가 주문되었습니다.\n건강한 하루 되세요!`);
    navigate('/kiosk');
  };

  const tabs = [
    { id: 'recommend', label: '⭐ AI 추천', color: '#6c5ce7' },
    { id: 'normal', label: '🥤 일반 메뉴', color: '#0984e3' },
    { id: 'allergy', label: '⛔ 알레르기', color: '#d63031' },
    { id: 'health', label: '🏥 건강 주의', color: '#e17055' },
  ];

  const getEmoji = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('coffee')) return '☕️';
    if (cat.includes('tea')) return '🍵';
    if (cat.includes('juice') || cat.includes('ade')) return '🧃';
    if (cat.includes('smoothie')) return '🍧';
    if (cat.includes('dessert') || cat.includes('cake')) return '🍰';
    return '🥤';
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f6fa', fontFamily: 'sans-serif' }}>

      {/* 헤더 */}
      <div style={{ padding: '25px', background: '#2d3436', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: '800' }}>Health Kiosk 🌿</h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '1.1rem', opacity: 0.9 }}>
            안녕하세요, <span style={{ color: '#00cec9', fontWeight: 'bold' }}>{user.name}</span>님
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '1rem', background: 'rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '10px' }}>
          AI가 건강검진 결과를 분석하여<br />
          <span style={{ color: '#fab1a0', fontWeight: 'bold' }}>최적의 메뉴를 추천</span>중입니다.
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', background: 'white', padding: '15px 10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '15px 0',
              margin: '0 5px',
              borderRadius: '15px',
              border: 'none',
              background: activeTab === tab.id ? tab.color : '#dfe6e9',
              color: activeTab === tab.id ? 'white' : '#636e72',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? '0 4px 10px rgba(0,0,0,0.2)' : 'none',
              transform: activeTab === tab.id ? 'translateY(-2px)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: activeTab === 'recommend' ? '#f0f3ff' : '#f5f6fa' }}>

        {loading && <div style={{ textAlign: 'center', fontSize: '1.5rem', marginTop: '50px' }}>AI가 메뉴를 분석하고 있습니다... 🤖🔍</div>}

        {!loading && activeTab === 'recommend' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#6c5ce7', fontWeight: 'bold', marginBottom: '10px' }}>
              ✨ 고객님의 건강 상태에 딱 맞는 BEST 메뉴 ✨
            </div>
            {menuData.recommended_menus.map((item, idx) => (
              <div key={item.id} onClick={() => addToCart(item, true)} style={{
                background: 'white', borderRadius: '20px', padding: '25px',
                display: 'flex', alignItems: 'center', gap: '20px',
                boxShadow: '0 10px 20px rgba(108, 92, 231, 0.15)', border: '2px solid #a29bfe',
                cursor: 'pointer', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, background: '#6c5ce7', color: 'white', padding: '5px 15px', borderBottomRightRadius: '15px', fontWeight: 'bold' }}>
                  BEST {idx + 1}
                </div>
                <div style={{ fontSize: '5rem', flexShrink: 0 }}>{getEmoji(item.category)}</div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', color: '#2d3436' }}>{item.name}</h2>
                  <div style={{ background: '#f1f2f6', padding: '15px', borderRadius: '15px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '1.1rem', color: '#2d3436', marginBottom: '8px', lineHeight: '1.4' }}>
                      💡 <b>AI 분석:</b> {item.reason || "건강 맞춤 추천"}
                    </div>
                    {item.selected_options?.length > 0 && (
                      <div style={{ fontSize: '1.1rem', color: '#0984e3', fontWeight: 'bold' }}>
                        ✅ 자동 선택 옵션: {item.selected_options.join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '1.5rem', color: '#0984e3', fontWeight: '800', textAlign: 'right' }}>
                    {(item.price || 0).toLocaleString()}원
                  </div>
                </div>
              </div>
            ))}
            {menuData.recommended_menus.length === 0 && (
              <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#b2bec3', padding: '50px' }}>
                추천할 만한 메뉴가 없습니다.
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'normal' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {menuData.normal_menus.map(item => (
              <div key={item.id} onClick={() => addToCart(item)} style={{
                background: 'white', borderRadius: '20px', padding: '20px', textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{getEmoji(item.category)}</div>
                <h3 style={{ fontSize: '1.3rem', margin: '10px 0' }}>{item.name}</h3>
                <p style={{ fontSize: '1.2rem', color: '#0984e3', fontWeight: 'bold' }}>{(item.price || 0).toLocaleString()}원</p>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === 'allergy' && (
          <div style={{ padding: '10px' }}>
            <div style={{ background: '#ffeaa7', padding: '15px', borderRadius: '10px', marginBottom: '20px', color: '#d63031', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center' }}>
              ⚠️ 알레르기 유발 성분 포함 (주문 차단)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {menuData.allergy_menus.map(item => (
                <div key={item.id} style={{
                  background: '#f1f2f6', borderRadius: '20px', padding: '20px', textAlign: 'center',
                  opacity: 0.6, filter: 'grayscale(80%)', position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', border: '3px solid #d63031', color: '#d63031', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', fontSize: '1.5rem', transform: 'translate(-50%, -50%) rotate(-10deg)', whiteSpace: 'nowrap' }}>
                    주문 불가
                  </div>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{getEmoji(item.category)}</div>
                  <h3 style={{ fontSize: '1.3rem', margin: '10px 0', textDecoration: 'line-through' }}>{item.name}</h3>
                  <p style={{ color: '#d63031', fontWeight: 'bold' }}>⛔ {item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && activeTab === 'health' && (
          <div style={{ padding: '10px' }}>
            <div style={{ background: '#ff7675', padding: '15px', borderRadius: '10px', marginBottom: '20px', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center' }}>
              🏥 건강상 피해야 할 메뉴
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {menuData.health_menus.map(item => (
                <div key={item.id} style={{
                  background: '#fff', borderRadius: '20px', padding: '20px', textAlign: 'center',
                  border: '2px solid #ff7675'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{getEmoji(item.category)}</div>
                  <h3 style={{ fontSize: '1.3rem', margin: '10px 0' }}>{item.name}</h3>
                  <p style={{ color: '#e17055', fontWeight: 'bold', fontSize: '1.1rem' }}>⚠️ {item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 장바구니 */}
      <div style={{ padding: '25px', background: 'white', borderTop: '1px solid #dfe6e9', boxShadow: '0 -5px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: '800', fontSize: '1.4rem' }}>
          <span>총 결제금액</span>
          <span style={{ color: '#0984e3' }}>
            {cart.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString()}원
          </span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={clearCart} style={{ flex: 1, padding: '20px', borderRadius: '15px', border: '2px solid #b2bec3', background: 'white', fontSize: '1.2rem', fontWeight: 'bold', color: '#636e72' }}>취소</button>
          <button onClick={handleOrder} style={{ flex: 2, padding: '20px', borderRadius: '15px', border: 'none', background: '#0984e3', color: 'white', fontWeight: '800', fontSize: '1.4rem', boxShadow: '0 5px 15px rgba(9, 132, 227, 0.4)' }}>
            {cart.length}개 주문하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;
