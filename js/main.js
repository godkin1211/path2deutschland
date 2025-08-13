// ==================== 前台數據管理 ====================
// 支援從JSON檔案或localStorage讀取數據

// 資料儲存變數
let newsData = [];
let activitiesData = [];

// 從JSON檔案載入資料的函數
async function loadDataFromJSON() {
    try {
        console.log('🔍 開始載入JSON資料...');
        
        // 嘗試載入新聞資料
        const newsUrl = 'data/news.json?' + Date.now(); // 添加時間戳避免快取
        console.log('📰 載入新聞資料:', newsUrl);
        const newsResponse = await fetch(newsUrl);
        if (newsResponse.ok) {
            newsData = await newsResponse.json();
            console.log('✅ 新聞資料載入成功:', newsData.length, '筆資料');
            console.log('📋 新聞內容:', newsData);
        } else {
            console.warn('❌ 無法載入新聞資料，狀態碼:', newsResponse.status);
            newsData = [];
        }
        
        // 嘗試載入活動資料
        const activitiesUrl = 'data/activities.json?' + Date.now(); // 添加時間戳避免快取
        console.log('🎯 載入活動資料:', activitiesUrl);
        const activitiesResponse = await fetch(activitiesUrl);
        if (activitiesResponse.ok) {
            activitiesData = await activitiesResponse.json();
            console.log('✅ 活動資料載入成功:', activitiesData.length, '筆資料');
            console.log('📋 活動內容:', activitiesData);
        } else {
            console.warn('❌ 無法載入活動資料，狀態碼:', activitiesResponse.status);
            activitiesData = [];
        }
        
        return true;
    } catch (error) {
        console.error('💥 載入JSON資料時發生錯誤:', error);
        return false;
    }
}

// 從 localStorage 載入資料的函數（作為後備方案）
function loadDataFromLocalStorage() {
    newsData = JSON.parse(localStorage.getItem('newsItems') || '[]');
    activitiesData = JSON.parse(localStorage.getItem('activityItems') || '[]');
}

// 建立新聞卡片的函數
function createNewsCards() {
    console.log('🏗️ 開始建立新聞卡片, 資料數量:', newsData.length);
    const container = document.getElementById('news-container');
    
    if (!container) {
        console.error('❌ 找不到 news-container 元素');
        return;
    }
    
    // 清空容器內容
    container.innerHTML = '';
    
    // 如果沒有新聞資料，顯示提示訊息
    if (newsData.length === 0) {
        console.log('ℹ️ 沒有新聞資料，顯示提示訊息');
        container.innerHTML = '<p class="text-gray-500 text-center py-8">目前尚無最新動態</p>';
        return;
    }
    
    // 遍歷新聞資料並建立卡片
    newsData.forEach((news, index) => {
        console.log(`📰 建立新聞卡片 ${index + 1}:`, news.title);
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
    
    console.log('✅ 新聞卡片建立完成');
}

// 建立活動卡片的函數
function createActivityCards() {
    const container = document.getElementById('activities-container');
    // 清空容器內容
    container.innerHTML = '';
    
    // 如果沒有活動資料，顯示提示訊息
    if (activitiesData.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">目前尚無活動紀錄</p>';
        return;
    }
    
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

// 刷新頁面內容的函數
async function refreshPageContent() {
    // 先嘗試從JSON檔案載入，失敗則使用localStorage
    const jsonSuccess = await loadDataFromJSON();
    if (!jsonSuccess) {
        loadDataFromLocalStorage();
    }
    
    // 更新卡片顯示
    createNewsCards();
    createActivityCards();
}

// 頁面初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 頁面開始載入...');
    
    // 載入資料（優先JSON檔案，後備localStorage）
    console.log('⏳ 載入資料中...');
    const jsonSuccess = await loadDataFromJSON();
    if (!jsonSuccess) {
        console.log('⚠️ JSON檔案載入失敗，使用localStorage資料');
        loadDataFromLocalStorage();
        console.log('📦 localStorage資料:', { news: newsData.length, activities: activitiesData.length });
    }
    
    // 載入新聞和活動卡片
    console.log('🔨 開始建立頁面內容...');
    createNewsCards();
    createActivityCards();
    
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
    
    // 監聽 localStorage 變更，以便即時更新內容（本地開發用）
    window.addEventListener('storage', function(e) {
        if (e.key === 'newsItems' || e.key === 'activityItems') {
            refreshPageContent();
        }
    });
});

// 提供全域函數供其他頁面呼叫
window.refreshPageContent = refreshPageContent;