const spicyText = ["안 매운", "보통", "매운"];

const menuPool = [
  { name: "김치찌개", mood: "든든한", budget: "저렴한", spicy: 2, desc: "뜨끈한 국물로 오후까지 든든해요." },
  { name: "샐러드볼", mood: "가벼운", budget: "보통", spicy: 0, desc: "부담 없이 먹기 좋은 가벼운 한 끼예요." },
  { name: "마라탕", mood: "새로운", budget: "보통", spicy: 2, desc: "향신료 향 가득한 중독성 있는 메뉴예요." },
  { name: "제육덮밥", mood: "빠른", budget: "저렴한", spicy: 1, desc: "빨리 나오고 만족도 높은 밥 메뉴예요." },
  { name: "초밥", mood: "여유로운", budget: "여유로운", spicy: 0, desc: "기분 전환하기 좋은 깔끔한 선택이에요." },
  { name: "칼국수", mood: "든든한", budget: "저렴한", spicy: 0, desc: "속 편하고 따뜻한 국수 메뉴예요." },
  { name: "돈까스", mood: "가벼운", budget: "보통", spicy: 0, desc: "무난하지만 실패 없는 클래식 메뉴예요." }
];

const moodEl = document.getElementById("mood");
const budgetEl = document.getElementById("budget");
const spicyEl = document.getElementById("spicy");
const spicyLabelEl = document.getElementById("spicyLabel");
const menuNameEl = document.getElementById("menuName");
const menuDescEl = document.getElementById("menuDesc");
const recommendBtn = document.getElementById("recommendBtn");

spicyEl.addEventListener("input", () => {
  spicyLabelEl.textContent = spicyText[Number(spicyEl.value)];
});

recommendBtn.addEventListener("click", () => {
  const mood = moodEl.value;
  const budget = budgetEl.value;
  const spicy = Number(spicyEl.value);

  const filtered = menuPool.filter((menu) => {
    const moodMatch = menu.mood === mood;
    const budgetMatch = menu.budget === budget;
    const spicyMatch = Math.abs(menu.spicy - spicy) <= 1;
    return moodMatch && budgetMatch && spicyMatch;
  });

  const candidates = filtered.length > 0 ? filtered : menuPool.filter((menu) => Math.abs(menu.spicy - spicy) <= 1);
  const pick = candidates[Math.floor(Math.random() * candidates.length)];

  menuNameEl.textContent = `오늘은 ${pick.name} 어때요?`;
  menuDescEl.textContent = pick.desc;
});
