// ==================== 前台數據管理 ====================
// 支援從JSON檔案或localStorage讀取數據

// 資料儲存變數
let newsData = [];
let activitiesData = [];

// 從JSON檔案載入資料的函數
async function loadDataFromJSON() {
    try {
        // 嘗試載入新聞資料
        const newsResponse = await fetch('data/news.json');
        if (newsResponse.ok) {
            newsData = await newsResponse.json();
        } else {
            console.warn('無法載入新聞資料，使用空陣列');
            newsData = [];
        }
        
        // 嘗試載入活動資料
        const activitiesResponse = await fetch('data/activities.json');
        if (activitiesResponse.ok) {
            activitiesData = await activitiesResponse.json();
        } else {
            console.warn('無法載入活動資料，使用空陣列');
            activitiesData = [];
        }
        
        return true;
    } catch (error) {
        console.error('載入JSON資料時發生錯誤:', error);
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
    const container = document.getElementById('news-container');
    // 清空容器內容
    container.innerHTML = '';
    
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
    // 載入資料（優先JSON檔案，後備localStorage）
    const jsonSuccess = await loadDataFromJSON();
    if (!jsonSuccess) {
        console.log('JSON檔案載入失敗，使用localStorage資料');
        loadDataFromLocalStorage();
    }
    
    // 載入新聞和活動卡片
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