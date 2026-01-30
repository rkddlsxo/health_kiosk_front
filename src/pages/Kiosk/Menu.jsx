import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- [가짜 메뉴 데이터] (나중에 백엔드 API /api/menus 에서 가져올 부분) ---
const MOCK_MENU = [
  { id: 1, name: "닭가슴살 샐러드", price: 8500, category: "salad", tags: ["diet", "muscle"], img: "🥗" },
  { id: 2, name: "현미밥 정식", price: 9000, category: "rice", tags: ["diabetes"], img: "🍚" },
  { id: 3, name: "제로 콜라", price: 2000, category: "drink", tags: ["sugar_free"], img: "🥤" },
  { id: 4, name: "매운 제육볶음", price: 9500, category: "rice", tags: ["spicy"], img: "🍖" },
  { id: 5, name: "오렌지 주스", price: 3500, category: "drink", tags: ["sugar"], img: "🍊" },
  { id: 6, name: "연어 아보카도", price: 11000, category: "salad", tags: ["diet", "omega3"], img: "🐟" },
];

function Menu() {
  const location = useLocation();
  const navigate = useNavigate();

  // 로그인한 유저 정보 (없으면 Guest)
  const user = location.state?.user || { name: "손님", health: {} };

  const [activeTab, setActiveTab] = useState("all");
  const [cart, setCart] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // --- [AI 추천 로직 시뮬레이션] ---
  // 실제로는 백엔드 LLM이 분석해서 보내준 데이터를 씁니다.
  // 여기서는 간단하게 "이름에 '손님'이 아니면 건강식을 추천"하게 만듭니다.
  useEffect(() => {
    if (user.name !== "손님") {
      // 예: 유저 건강 정보에 따라 추천 태그 설정 (임의 로직)
      const recItems = MOCK_MENU.filter(item => 
        item.tags.includes("diabetes") || item.tags.includes("diet") || item.tags.includes("sugar_free")
      );
      setRecommendations(recItems.map(i => i.id));
    }
  }, [user]);

  // 장바구니 담기
  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  // 장바구니 비우기
  const clearCart = () => setCart([]);

  // 주문 완료 (다시 대기 화면으로)
  const handleOrder = () => {
    alert(`${cart.length}개 메뉴 주문이 완료되었습니다!\n맛있게 드세요 😋`);
    navigate('/kiosk'); // 첫 화면(얼굴인식)으로 복귀
  };

  // 총 금액 계산
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  // 카테고리 필터링
  const filteredMenu = activeTab === "all" 
    ? MOCK_MENU 
    : MOCK_MENU.filter(item => item.category === activeTab);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
      
      {/* 1. 상단 헤더 & AI 추천 메시지 */}
      <div style={{ padding: '20px', background: '#007BFF', color: 'white' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>안녕하세요, {user.name}님! 👋</h1>
        <p style={{ marginTop: '10px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '10px' }}>
          🤖 <b>AI 분석 결과:</b> 고객님의 건강 데이터(당뇨/혈압)를 기반으로<br/>
          <span style={{ color: '#FFD700', fontWeight: 'bold' }}>저염식, 저당 메뉴</span>를 추천해 드려요!
        </p>
      </div>

      {/* 2. 카테고리 탭 */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', background: 'white' }}>
        {['all', 'salad', 'rice', 'drink'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '15px', border: 'none', background: activeTab === tab ? '#007BFF' : 'transparent',
              color: activeTab === tab ? 'white' : '#555', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 3. 메뉴 리스트 (스크롤 영역) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', alignContent: 'start' }}>
        {filteredMenu.map(item => {
          const isRecommended = recommendations.includes(item.id);
          return (
            <div key={item.id} onClick={() => addToCart(item)} style={{
              background: 'white', borderRadius: '15px', padding: '15px', textAlign: 'center',
              border: isRecommended ? '3px solid #FFD700' : '1px solid #eee', // 추천 메뉴는 금색 테두리
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer', position: 'relative'
            }}>
              {isRecommended && (
                <div style={{
                  position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                  background: '#FFD700', color: '#000', padding: '5px 10px', borderRadius: '20px',
                  fontWeight: 'bold', fontSize: '0.8rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  ✨ AI 강력 추천
                </div>
              )}
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{item.img}</div>
              <h3 style={{ fontSize: '1.2rem', margin: '5px 0' }}>{item.name}</h3>
              <p style={{ color: '#007BFF', fontWeight: 'bold' }}>{item.price.toLocaleString()}원</p>
            </div>
          );
        })}
      </div>

      {/* 4. 하단 장바구니 바 */}
      <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #ddd', boxShadow: '0 -5px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>총 주문금액</span>
          <span style={{ fontSize: '1.5rem', color: '#007BFF', fontWeight: 'bold' }}>{totalPrice.toLocaleString()}원</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={clearCart} style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #ccc', background: 'white', fontSize: '1.1rem' }}>취소</button>
          <button onClick={handleOrder} style={{ flex: 3, padding: '15px', borderRadius: '10px', border: 'none', background: '#007BFF', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {cart.length}개 결제하기
          </button>
        </div>
      </div>

    </div>
  );
}

export default Menu;