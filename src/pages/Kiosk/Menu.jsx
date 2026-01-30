import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Menu() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 로그인한 유저 정보 (없으면 Guest)
  const user = location.state?.user || { name: "손님", health: {} };

  const [menus, setMenus] = useState([]);       // 전체 메뉴 리스트
  const [activeTab, setActiveTab] = useState("all");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 백엔드에서 메뉴 데이터 가져오기
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/menus");
        setMenus(res.data);
        setLoading(false);
      } catch (err) {
        console.error("메뉴 로딩 실패:", err);
        alert("메뉴 정보를 불러오지 못했습니다.");
      }
    };
    fetchMenus();
  }, []);

  // 장바구니 담기
  const addToCart = (item) => setCart([...cart, item]);
  const clearCart = () => setCart([]);
  
  // 주문 완료
  const handleOrder = () => {
    alert(`${cart.length}개 메뉴 주문이 완료되었습니다!`);
    navigate('/kiosk'); 
  };

  // 카테고리별 필터링
  const filteredMenus = activeTab === "all" 
    ? menus 
    : menus.filter(m => m.category === activeTab);

  // 카테고리 탭 목록 (DB에 있는 것만 추출하거나 고정)
  const categories = ["all", "coffee", "beverage", "tea", "ade", "smoothie", "juice"];

  // 이미지 없을 때 보여줄 이모지 (임시)
  const getEmoji = (cat) => {
    if (cat === 'coffee') return '☕️';
    if (cat === 'tea') return '🍵';
    if (cat === 'juice') return '🧃';
    if (cat === 'smoothie') return '🍧';
    return '🥤';
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>메뉴판 세팅 중... ⏳</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
      
      {/* 1. 상단 헤더 */}
      <div style={{ padding: '20px', background: '#2c3e50', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', margin: 0 }}>Health Kiosk 🥤</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>안녕하세요, {user.name}님!</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
           건강 데이터 기반<br/>
           <span style={{ color: '#00d2d3', fontWeight: 'bold' }}>맞춤 추천 중</span>
        </div>
      </div>

      {/* 2. 카테고리 탭 (가로 스크롤) */}
      <div style={{ display: 'flex', overflowX: 'auto', background: 'white', borderBottom: '1px solid #ddd', padding: '10px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              flex: '0 0 auto', padding: '10px 20px', margin: '0 5px', borderRadius: '20px', border: 'none',
              background: activeTab === cat ? '#2c3e50' : '#ecf0f1',
              color: activeTab === cat ? 'white' : '#555', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 3. 메뉴 그리드 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', alignContent: 'start' }}>
        {filteredMenus.map(item => (
          <div key={item.menu_id} onClick={() => addToCart(item)} style={{
            background: 'white', borderRadius: '15px', padding: '15px', position: 'relative',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #eee', cursor: 'pointer'
          }}>
            {/* 알레르기 뱃지 */}
            {item.allergens && (
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff7675', color: 'white', fontSize: '0.7rem', padding: '3px 6px', borderRadius: '5px' }}>
                ⚠️ {item.allergens}
              </span>
            )}
            
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '10px' }}>
              {getEmoji(item.category)}
            </div>
            
            <h3 style={{ fontSize: '1.1rem', margin: '5px 0', color: '#333' }}>{item.name}</h3>
            <p style={{ fontWeight: 'bold', color: '#0984e3', margin: '5px 0' }}>{item.price.toLocaleString()}원</p>
            
            {/* ★ 헬스케어 정보 표시 (여기가 핵심) */}
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#636e72', background: '#f1f2f6', padding: '8px', borderRadius: '8px' }}>
              <div>🔥 {item.calories} kcal</div>
              <div style={{ color: item.sugar > 30 ? '#d63031' : '#636e72' }}>
                🍬 당류 {item.sugar}g {item.sugar > 30 && '⚠️'}
              </div>
              <div>🧂 나트륨 {item.sodium}mg</div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. 하단 장바구니 */}
      <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #ddd', boxShadow: '0 -5px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold', fontSize: '1.2rem' }}>
          <span>총 주문금액</span>
          <span style={{ color: '#0984e3' }}>
            {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}원
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={clearCart} style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #ccc', background: 'white' }}>취소</button>
          <button onClick={handleOrder} style={{ flex: 2, padding: '15px', borderRadius: '10px', border: 'none', background: '#0984e3', color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
            {cart.length}개 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;