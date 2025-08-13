// 資料載入配置
const DATA_CONFIG = {
    useGitHub: true, // 設為 true 使用 GitHub 資料，false 使用 localStorage
    githubRepo: 'godkin1211/path2deutschland',
    newsUrl: 'https://raw.githubusercontent.com/godkin1211/path2deutschland/main/data/news.json',
    activitiesUrl: 'https://raw.githubusercontent.com/godkin1211/path2deutschland/main/data/activities.json'
};

// 資料儲存變數
let newsData = [];
let activitiesData = [];

// 從 GitHub 載入資料的函數
async function loadDataFromGitHub() {
    try {
        // 載入新聞資料
        const newsResponse = await fetch(DATA_CONFIG.newsUrl);
        if (newsResponse.ok) {
            newsData = await newsResponse.json();
        } else {
            console.warn('無法載入新聞資料，使用空陣列');
            newsData = [];
        }
        
        // 載入活動資料
        const activitiesResponse = await fetch(DATA_CONFIG.activitiesUrl);
        if (activitiesResponse.ok) {
            activitiesData = await activitiesResponse.json();
        } else {
            console.warn('無法載入活動資料，使用空陣列');
            activitiesData = [];
        }
        
        return true;
    } catch (error) {
        console.error('載入 GitHub 資料時發生錯誤:', error);
        // 回退到 localStorage
        newsData = JSON.parse(localStorage.getItem('newsItems') || '[]');
        activitiesData = JSON.parse(localStorage.getItem('activityItems') || '[]');
        return false;
    }
}

// 從 localStorage 載入資料的函數
function loadDataFromLocalStorage() {
    newsData = JSON.parse(localStorage.getItem('newsItems') || '[]');
    activitiesData = JSON.parse(localStorage.getItem('activityItems') || '[]');
}

// 建立新聞卡片的函數
function createNewsCards() {
    const container = document.getElementById('news-container');
    // 清空容器內容
    container.innerHTML = '';
    
    // 資料已經載入，不需要重新載入
    
    // 如果沒有新聞資料，顯示提示訊息
    if (newsData.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">目前尚無最新動態</p>';
        return;
    }
    
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
    
    // 資料已經載入，不需要重新載入
    
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

// 聯絡我們區塊已改為社群媒體連結，無需表單處理程式碼

// 刷新頁面內容的函數
function refreshPageContent() {
    createNewsCards();
    createActivityCards();
}

// 頁面初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 根據配置載入資料
    if (DATA_CONFIG.useGitHub) {
        const success = await loadDataFromGitHub();
        if (!success) {
            console.warn('GitHub 資料載入失敗，使用 localStorage 資料');
        }
    } else {
        loadDataFromLocalStorage();
    }
    
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
