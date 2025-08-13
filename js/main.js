// 從 localStorage 載入新聞和活動資料，如果沒有則使用預設資料
let newsData = JSON.parse(localStorage.getItem('newsItems')) || [
    {
        id: 1,
        title: '2025年留學展即將開始',
        date: '2025-03-15',
        content: '我們將參加2025年台北留學展，歡迎蒞臨參觀諮詢！',
        image: 'img/icon.png' // 統一使用 icon.png
    }
];

let activitiesData = JSON.parse(localStorage.getItem('activityItems')) || [
    {
        id: 1,
        title: '2024冬季留學說明會回顧',
        date: '2024-12-20',
        content: '本次說明會吸引超過100位同學參與，感謝大家的熱情參與！',
        image: 'img/icon.png' // 統一使用 icon.png
    }
];

// 建立新聞卡片的函數
function createNewsCards() {
    const container = document.getElementById('news-container');
    // 清空容器內容
    container.innerHTML = '';
    
    // 重新從 localStorage 載入最新資料
    newsData = JSON.parse(localStorage.getItem('newsItems')) || newsData;
    
    // 遍歷新聞資料並建立卡片
    newsData.forEach(news => {
        const card = document.createElement('div');
        card.className = 'news-card bg-white rounded-lg shadow-md overflow-hidden';
        card.innerHTML = `
            <img src="${news.image}" alt="${news.title}" class="w-full h-48 object-cover" 
                 onerror="this.src='img/icon.png'">
            <div class="p-4">
                <h3 class="text-xl font-semibold mb-2">${news.title}</h3>
                <p class="text-gray-600 text-sm mb-2">${news.date}</p>
                <p class="text-gray-700">${news.content}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// 建立活動卡片的函數
function createActivityCards() {
    const container = document.getElementById('activities-container');
    // 清空容器內容
    container.innerHTML = '';
    
    // 重新從 localStorage 載入最新資料
    activitiesData = JSON.parse(localStorage.getItem('activityItems')) || activitiesData;
    
    // 遍歷活動資料並建立卡片
    activitiesData.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'activity-card bg-white rounded-lg shadow-md overflow-hidden';
        card.innerHTML = `
            <img src="${activity.image}" alt="${activity.title}" class="w-full h-48 object-cover"
                 onerror="this.src='img/icon.png'">
            <div class="p-4">
                <h3 class="text-xl font-semibold mb-2">${activity.title}</h3>
                <p class="text-gray-600 text-sm mb-2">${activity.date}</p>
                <p class="text-gray-700">${activity.content}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// 聯絡我們區塊已改為社群媒體連結，無需表單處理程式碼

// 刷新頁面內容的函數
function refreshPageContent() {
    createNewsCards();
    createActivityCards();
}

// 頁面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 載入新聞和活動卡片
    refreshPageContent();
    
    // 設定滾動動畫觀察器
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1 // 當元素 10% 可見時觸發
    });

    // 為所有區塊添加淡入動畫
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
    
    // 監聽 localStorage 變更，以便即時更新內容
    window.addEventListener('storage', function(e) {
        if (e.key === 'newsItems' || e.key === 'activityItems') {
            refreshPageContent();
        }
    });
});

// 提供全域函數供其他頁面呼叫
window.refreshPageContent = refreshPageContent;
