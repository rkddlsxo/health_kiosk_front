import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Menu() {
  const location = useLocation();
  const navigate = useNavigate();

  // 사용자 정보 (Guest fallback)
  const user = location.state?.user || { id: 1, name: "지웅" };

  // --- [하드코딩된 메뉴 데이터] ---
  const [menuData] = useState({
    recommended_menus: [
      {
        id: 1,
        name: "캐모마일 티",
        price: 3000,
        category: "tea",
        reason: "칼로리와 당분이 0g으로, 체중과 혈당 관리에 가장 좋은 선택입니다. 고혈압 예방을 위해 나트륨도 전혀 들어있지 않습니다.",
        recommendOption: "따뜻하게"
      },
      {
        id: 2,
        name: "아이스 아메리카노",
        price: 2000,
        category: "coffee",
        reason: "당분이 0g이고 칼로리가 매우 낮아 체중 관리에 적합합니다. 일상적인 에너지 보충에 좋습니다.",
        recommendOption: "연하게, 얼음 많이"
      }
    ],
    normal_menus: [
      { id: 101, name: "카페 라떼", price: 3500, category: "coffee" },
      { id: 102, name: "바닐라 라떼", price: 4000, category: "coffee" },
      { id: 103, name: "카푸치노", price: 3500, category: "coffee" },
      { id: 104, name: "콜드브루", price: 3000, category: "coffee" },
      { id: 105, name: "망고 스무디", price: 4500, category: "smoothie" },
      { id: 106, name: "블루베리 요거트", price: 4800, category: "smoothie" },
      { id: 107, name: "딸기 주스", price: 4000, category: "juice" },
      { id: 108, name: "키위 생과일", price: 4200, category: "juice" },
      { id: 109, name: "유자차", price: 3000, category: "tea" },
      { id: 110, name: "레몬 에이드", price: 3800, category: "ade" },
      { id: 111, name: "자몽 에이드", price: 3800, category: "ade" },
      { id: 112, name: "아이스티 (복숭아)", price: 2500, category: "tea" },
    ],
    allergy_menus: [
      {
        id: 201,
        name: "땅콩 쿠키",
        price: 2500,
        category: "dessert",
        reason: "땅콩 성분 포함"
      },
      {
        id: 202,
        name: "호두 파이",
        price: 3500,
        category: "dessert",
        reason: "호두 성분 포함"
      },
      {
        id: 203,
        name: "새우 샌드위치",
        price: 5500,
        category: "meal",
        reason: "새우 성분 포함"
      },
      {
        id: 204,
        name: "복숭아 아이스티",
        price: 3000,
        category: "tea",
        reason: "복숭아 성분 포함"
      },
      {
        id: 205,
        name: "우유 식빵",
        price: 2000,
        category: "dessert",
        reason: "우유 성분 포함"
      },
      {
        id: 206,
        name: "계란 샌드위치",
        price: 4500,
        category: "meal",
        reason: "계란 성분 포함"
      },
      {
        id: 207,
        name: "치즈 케이크",
        price: 5000,
        category: "cake",
        reason: "우유(치즈) 성분 포함"
      },
      {
        id: 208,
        name: "게살 샐러드",
        price: 5800,
        category: "meal",
        reason: "갑각류(게) 성분 포함"
      }
    ],
    health_menus: [
      {
        id: 301,
        name: "더블 초코 케이크",
        price: 5500,
        category: "cake",
        reason: "당류 45g (주의)"
      },
      {
        id: 302,
        name: "카라멜 마키아또",
        price: 4500,
        category: "coffee",
        reason: "당류 35g (주의)"
      },
      {
        id: 303,
        name: "쿠키앤크림 프라페",
        price: 5800,
        category: "smoothie",
        reason: "포화지방/당류 높음"
      },
      {
        id: 304,
        name: "흑당 버블티",
        price: 4800,
        category: "tea",
        reason: "당류 매우 높음"
      },
      {
        id: 305,
        name: "소금 빵",
        price: 2500,
        category: "dessert",
        reason: "나트륨 함량 높음"
      },
      {
        id: 306,
        name: "햄 치즈 토스트",
        price: 3800,
        category: "meal",
        reason: "나트륨/포화지방 주의"
      },
      {
        id: 307,
        name: "바닐라 쉐이크",
        price: 4500,
        category: "smoothie",
        reason: "당류 높음"
      },
      {
        id: 308,
        name: "연유 라떼",
        price: 4300,
        category: "coffee",
        reason: "당류 함량 주의"
      }
    ]
  });

  const [activeTab, setActiveTab] = useState("recommend");
  const [cart, setCart] = useState([]);

  // 모달 상태
  const [selectedItem, setSelectedItem] = useState(null); // 옵션 선택용
  const [warningItem, setWarningItem] = useState(null);   // 경고 확인용

  // 장바구니 추가
  const addToCart = (item, optionLabel = null) => {
    const cartItem = { ...item };
    if (optionLabel) {
      cartItem.name = `${item.name} (${optionLabel})`;
      cartItem.selectedOption = optionLabel;
    }
    setCart([...cart, cartItem]);
    setSelectedItem(null);
    setWarningItem(null);
  };

  const handleMenuClick = (item, type) => {
    // 1. 경고가 필요한 메뉴
    if (type === 'allergy' || type === 'health') {
      setWarningItem(item);
      return;
    }
    // 2. 추천 메뉴 -> 옵션 선택 모달
    if (type === 'recommend' && item.recommendOption) {
      setSelectedItem(item);
      return;
    }
    // 3. 일반 메뉴
    addToCart(item);
  };

  const handleOrder = () => {
    if (cart.length === 0) return;
    alert(`${cart.length}개 메뉴가 주문되었습니다.\n건강하세요!`);
    navigate('/kiosk'); // 처음으로 돌아가기
  };

  const clearCart = () => setCart([]);

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
    if (cat.includes('cake') || cat.includes('dessert') || cat.includes('cookie') || cat.includes('meal')) return '🍪';
    return '🥤';
  };

  // --- [스타일 통합 렌더링 함수] ---
  const renderMenuCard = (item, type) => {
    // 1. 카드 배경 및 테두리 결정
    let bg = 'white';
    let border = 'none';
    let badge = null;
    let emoji = getEmoji(item.category);

    if (type === 'recommend') {
      border = '2px solid #a29bfe';
      badge = <div style={{ position: 'absolute', top: 0, left: 0, background: '#6c5ce7', color: 'white', padding: '4px 10px', borderBottomRightRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }}>BEST</div>;
    } else if (type === 'allergy') {
      bg = '#fff0f0';
      border = '1px solid #ff7675';
      badge = <div style={{ position: 'absolute', top: 8, right: 8, background: '#d63031', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>주의</div>;
    } else if (type === 'health') {
      border = '2px solid #ff7675';
      badge = null; // 건강은 설명 텍스트로
    }

    return (
      <div key={item.id} onClick={() => handleMenuClick(item, type)}
        style={{
          background: bg, borderRadius: '15px', padding: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: border,
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          height: '350px', // ★ 높이 강제 고정
          justifyContent: 'space-between',
          transition: 'transform 0.2s',
          boxSizing: 'border-box' // 테두리 포함 크기 계산
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {badge}

        {/* 상단 이미지 영역 (높이 고정) */}
        <div style={{ textAlign: 'center', marginTop: '15px', height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '3.5rem' }}>{emoji}</div>
        </div>

        {/* 이름 영역 (높이 고정) */}
        <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#2d3436', fontWeight: '800', textAlign: 'center', lineHeight: '1.2' }}>{item.name}</h3>
        </div>

        {/* 중간 설명 영역 (높이 고정 및 스크롤 방지) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '5px 0', overflow: 'hidden' }}>
          {type === 'recommend' && (
            <div style={{ background: '#f0f3ff', padding: '10px', borderRadius: '10px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '0.8rem', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                💡 {item.reason}
              </div>
              <div style={{ marginTop: '5px', color: '#6c5ce7', fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'right' }}>
                👍 {item.recommendOption}
              </div>
            </div>
          )}
          {type === 'normal' && (
            <div style={{ textAlign: 'center', color: '#b2bec3', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              맛있는 {item.name},<br />지금 즐겨보세요!
            </div>
          )}
          {(type === 'allergy' || type === 'health') && (
            <div style={{
              background: type === 'allergy' ? 'rgba(214, 48, 49, 0.1)' : 'rgba(225, 112, 85, 0.1)',
              padding: '10px', borderRadius: '10px', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              color: type === 'allergy' ? '#d63031' : '#e17055', fontSize: '0.85rem', fontWeight: 'bold',
              boxSizing: 'border-box'
            }}>
              ⚠️ {item.reason}
            </div>
          )}
        </div>

        {/* 하단 가격 영역 (높이 고정) */}
        <div style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#0984e3', fontWeight: '800' }}>
            {item.price?.toLocaleString()}원
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '100vh',
      background: '#2d3436', display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* 카드 프레임 - FaceLogin과 동일한 스타일 적용 */}
      <div style={{
        width: '100%',
        maxWidth: '600px', // FaceLogin과 동일
        height: '100%',
        maxHeight: '100vh', // FaceLogin과 동일하게 화면 꽉 채움
        background: '#f5f6fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // 중앙 정렬 추가
        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
        position: 'relative', // relative 유지
        overflow: 'hidden'    // 넘치는 내용 숨김
      }}>

        {/* 헤더 */}
        <div style={{ width: '100%', padding: '20px 25px', background: '#2d3436', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, boxSizing: 'border-box' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', margin: 0, fontWeight: '800' }}>Medi-Pass 🌿</h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
              환영합니다, <span style={{ color: '#00cec9', fontWeight: 'bold' }}>{user.name}</span>님
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '10px' }}>
            AI 건강 분석 완료<br />
            <span style={{ color: '#fab1a0', fontWeight: 'bold' }}>맞춤 메뉴 추천</span>
          </div>
        </div>

        {/* 탭 */}
        <div style={{ width: '100%', display: 'flex', background: 'white', padding: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', zIndex: 9, boxSizing: 'border-box' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '12px 0', margin: '0 3px', borderRadius: '12px', border: 'none',
                background: activeTab === tab.id ? tab.color : '#dfe6e9',
                color: activeTab === tab.id ? 'white' : '#636e72',
                fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                transform: activeTab === tab.id ? 'translateY(-2px)' : 'none',
                boxShadow: activeTab === tab.id ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 메뉴 리스트 */}
        <div style={{ width: '100%', flex: 1, overflowY: 'auto', padding: '15px', background: '#f5f6fa', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', paddingBottom: '20px' }}>

            {activeTab === 'recommend' && menuData.recommended_menus.map(item => renderMenuCard(item, 'recommend'))}
            {activeTab === 'normal' && menuData.normal_menus.map(item => renderMenuCard(item, 'normal'))}
            {activeTab === 'allergy' && menuData.allergy_menus.map(item => renderMenuCard(item, 'allergy'))}
            {activeTab === 'health' && menuData.health_menus.map(item => renderMenuCard(item, 'health'))}

          </div>
        </div>

        {/* 장바구니 */}
        <div style={{ width: '100%', padding: '20px', background: 'white', borderTop: '1px solid #dfe6e9', boxShadow: '0 -5px 20px rgba(0,0,0,0.05)', zIndex: 10, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: '800', fontSize: '1.2rem' }}>
            <span style={{ color: '#2d3436' }}>총 결제금액</span>
            <span style={{ color: '#0984e3' }}>
              {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}원
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={clearCart} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '2px solid #b2bec3', background: 'white', fontSize: '1rem', fontWeight: 'bold', color: '#636e72', cursor: 'pointer' }}>취소</button>
            <button onClick={handleOrder} style={{ flex: 2, padding: '15px', borderRadius: '12px', border: 'none', background: cart.length > 0 ? '#0984e3' : '#b2bec3', color: 'white', fontWeight: '800', fontSize: '1.1rem', boxShadow: cart.length > 0 ? '0 5px 15px rgba(9, 132, 227, 0.4)' : 'none', cursor: cart.length > 0 ? 'pointer' : 'default' }}>
              {cart.length}개 주문하기
            </button>
          </div>
        </div>

        {/* --- [모달 영역] --- */}

        {/* 1. 옵션 선택 모달 */}
        {selectedItem && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div style={{ background: 'white', width: '85%', maxWidth: '380px', borderRadius: '25px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: '#2d3436' }}>{selectedItem.name}</h3>
              <p style={{ color: '#636e72', marginBottom: '25px' }}>옵션을 선택해주세요 ☕️</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                <button onClick={() => addToCart(selectedItem, '기본')}
                  style={{
                    padding: '16px', borderRadius: '15px', border: '1px solid #dfe6e9', background: 'white',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#636e72' }}>옵션 : 기본</span>
                  <span style={{ fontSize: '0.8rem', color: '#b2bec3' }}>Default</span>
                </button>

                <button onClick={() => addToCart(selectedItem, selectedItem.recommendOption)}
                  style={{
                    padding: '16px', borderRadius: '15px', border: '2px solid #6c5ce7', background: '#f5f3ff',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(108, 92, 231, 0.15)'
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#6c5ce7' }}>옵션 : {selectedItem.recommendOption}</span>
                  <span style={{ fontSize: '0.8rem', background: '#6c5ce7', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>AI 추천</span>
                </button>
              </div>

              <button onClick={() => setSelectedItem(null)} style={{ width: '100%', padding: '15px', background: '#dfe6e9', color: '#636e72', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                닫기
              </button>
            </div>
          </div>
        )}

        {/* 2. 경고 확인 모달 */}
        {warningItem && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div style={{ background: 'white', width: '85%', maxWidth: '350px', borderRadius: '20px', padding: '25px', textAlign: 'center', border: '2px solid #ff7675' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚠️</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#d63031' }}>주의가 필요합니다!</h3>
              <p style={{ color: '#2d3436', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 10px 0' }}>'{warningItem.name}'</p>
              <p style={{ color: '#636e72', fontSize: '0.9rem', marginBottom: '25px', background: '#fff0f0', padding: '10px', borderRadius: '10px' }}>{warningItem.reason}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setWarningItem(null)} style={{ flex: 1, padding: '12px', background: '#dfe6e9', color: '#636e72', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
                <button onClick={() => addToCart(warningItem)} style={{ flex: 1, padding: '12px', background: '#d63031', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>주문하기</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Menu;