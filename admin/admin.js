// ==================== 簡化版管理後台 ====================
// 純靜態網站版本，移除GitHub API集成

// 資料管理設定
let newsItems = JSON.parse(localStorage.getItem('newsItems') || '[]');
let activityItems = JSON.parse(localStorage.getItem('activityItems') || '[]');

// 基本認證功能（簡化版）
function checkSimpleAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (!isLoggedIn) {
        return false;
    }
    
    // 檢查登入時效（24小時）
    if (loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            logout();
            return false;
        }
    }
    
    return true;
}

// 簡化登出功能
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('adminUser');
    window.location.href = 'login.html';
}

// 檢查是否已登入，若未登入則重定向
if (!checkSimpleAuth()) {
    window.location.href = 'login.html';
}

// ==================== 內容管理功能 ====================

// 處理最新動態表單提交
document.getElementById('news-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 收集表單資料
    const title = document.getElementById('news-title').value.trim();
    const date = document.getElementById('news-date').value;
    const content = document.getElementById('news-content').value.trim();
    
    // 表單驗證
    if (!title || !date || !content) {
        alert('請填寫所有必填欄位！');
        return;
    }
    
    // 建立新聞項目物件
    const newsItem = {
        id: Date.now(),
        title: title,
        date: date,
        content: content,
        image: 'img/icon.png'
    };

    // 將新項目加入陣列開頭（最新的在前面）
    newsItems.unshift(newsItem);
    
    // 儲存到 localStorage
    localStorage.setItem('newsItems', JSON.stringify(newsItems));
    
    // 提示成功並重置表單
    alert('最新動態已發布！');
    this.reset();
    updatePreviews();
    
    // 通知主頁面更新內容
    if (window.opener && window.opener.refreshPageContent) {
        window.opener.refreshPageContent();
    }
});

// 處理活動紀錄表單提交
document.getElementById('activity-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 收集表單資料
    const title = document.getElementById('activity-title').value.trim();
    const date = document.getElementById('activity-date').value;
    const content = document.getElementById('activity-content').value.trim();
    
    // 表單驗證
    if (!title || !date || !content) {
        alert('請填寫所有必填欄位！');
        return;
    }
    
    // 建立活動項目物件
    const activityItem = {
        id: Date.now(),
        title: title,
        date: date,
        content: content,
        image: 'img/icon.png'
    };

    // 將新項目加入陣列開頭（最新的在前面）
    activityItems.unshift(activityItem);
    
    // 儲存到 localStorage
    localStorage.setItem('activityItems', JSON.stringify(activityItems));
    
    // 提示成功並重置表單
    alert('活動紀錄已發布！');
    this.reset();
    updatePreviews();
    
    // 通知主頁面更新內容
    if (window.opener && window.opener.refreshPageContent) {
        window.opener.refreshPageContent();
    }
});

// 更新預覽區塊的函數
function updatePreviews() {
    // 更新最新動態預覽
    const newsPreview = document.getElementById('news-preview');
    if (newsItems.length === 0) {
        newsPreview.innerHTML = '<h3 class="text-xl font-bold mb-4">最新動態</h3><p class="text-gray-500">尚無發布的最新動態</p>';
    } else {
        newsPreview.innerHTML = '<h3 class="text-xl font-bold mb-4">最新動態</h3>' +
            newsItems.map(news => `
                <div class="bg-white p-4 rounded-lg shadow mb-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-semibold text-lg">${news.title}</h4>
                            <p class="text-sm text-gray-600 mb-2">${news.date}</p>
                            <p class="text-gray-700">${news.content}</p>
                        </div>
                        <img src="${news.image}" alt="${news.title}" class="ml-4 w-16 h-16 object-cover rounded"
                             onerror="this.src='../img/icon.png'">
                    </div>
                    <button onclick="deleteNews(${news.id})" class="mt-3 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                        刪除
                    </button>
                </div>
            `).join('');
    }

    // 更新活動紀錄預覽
    const activitiesPreview = document.getElementById('activities-preview');
    if (activityItems.length === 0) {
        activitiesPreview.innerHTML = '<h3 class="text-xl font-bold mb-4">活動紀錄</h3><p class="text-gray-500">尚無發布的活動紀錄</p>';
    } else {
        activitiesPreview.innerHTML = '<h3 class="text-xl font-bold mb-4">活動紀錄</h3>' +
            activityItems.map(activity => `
                <div class="bg-white p-4 rounded-lg shadow mb-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-semibold text-lg">${activity.title}</h4>
                            <p class="text-sm text-gray-600 mb-2">${activity.date}</p>
                            <p class="text-gray-700">${activity.content}</p>
                        </div>
                        <img src="${activity.image}" alt="${activity.title}" class="ml-4 w-16 h-16 object-cover rounded"
                             onerror="this.src='../img/icon.png'">
                    </div>
                    <button onclick="deleteActivity(${activity.id})" class="mt-3 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                        刪除
                    </button>
                </div>
            `).join('');
    }
}

// 刪除功能函數
function deleteNews(id) {
    if (confirm('確定要刪除這則最新動態嗎？此操作無法復原。')) {
        // 從陣列中移除指定 ID 的項目
        newsItems = newsItems.filter(item => item.id !== id);
        
        // 更新 localStorage
        localStorage.setItem('newsItems', JSON.stringify(newsItems));
        
        // 更新預覽顯示
        updatePreviews();
        
        alert('最新動態已刪除！');
        
        // 通知主頁面更新內容
        if (window.opener && window.opener.refreshPageContent) {
            window.opener.refreshPageContent();
        }
    }
}

function deleteActivity(id) {
    if (confirm('確定要刪除這則活動紀錄嗎？此操作無法復原。')) {
        // 從陣列中移除指定 ID 的項目
        activityItems = activityItems.filter(item => item.id !== id);
        
        // 更新 localStorage
        localStorage.setItem('activityItems', JSON.stringify(activityItems));
        
        // 更新預覽顯示
        updatePreviews();
        
        alert('活動紀錄已刪除！');
        
        // 通知主頁面更新內容
        if (window.opener && window.opener.refreshPageContent) {
            window.opener.refreshPageContent();
        }
    }
}

// ==================== UI 事件處理 ====================

// 處理登出按鈕
document.getElementById('logout-btn').addEventListener('click', function() {
    if (confirm('確定要登出管理後台嗎？')) {
        logout();
    }
});

// ==================== 數據管理功能 ====================

// 導出所有數據為JSON文件
function exportAllData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        newsItems: newsItems,
        activityItems: activityItems
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('數據導出成功！檔案已下載到您的電腦。');
}

// 導入數據
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // 驗證數據格式
            if (!data.version || !Array.isArray(data.newsItems) || !Array.isArray(data.activityItems)) {
                throw new Error('無效的數據格式');
            }
            
            // 確認導入
            const confirmed = confirm(
                `確定要導入數據嗎？\n\n` +
                `導出時間: ${new Date(data.exportDate).toLocaleString()}\n` +
                `新聞項目: ${data.newsItems.length} 個\n` +
                `活動項目: ${data.activityItems.length} 個\n\n` +
                `注意：這將覆蓋現有的所有數據！`
            );
            
            if (confirmed) {
                // 導入數據
                newsItems = data.newsItems;
                activityItems = data.activityItems;
                
                // 保存到 localStorage
                localStorage.setItem('newsItems', JSON.stringify(newsItems));
                localStorage.setItem('activityItems', JSON.stringify(activityItems));
                
                // 更新預覽
                updatePreviews();
                
                alert('數據導入成功！');
                
                // 通知主頁面更新內容
                if (window.opener && window.opener.refreshPageContent) {
                    window.opener.refreshPageContent();
                }
            }
        } catch (error) {
            alert(`導入失敗：${error.message}`);
        }
    };
    
    reader.readAsText(file);
    
    // 清空文件輸入
    event.target.value = '';
}

// 清空所有數據
function clearAllData() {
    const confirmed = confirm(
        '確定要清空所有數據嗎？\n\n' +
        '這將刪除所有新聞和活動記錄，此操作無法復原！\n\n' +
        '建議在清空前先導出數據進行備份。'
    );
    
    if (confirmed) {
        const doubleConfirmed = confirm('再次確認：真的要刪除所有數據嗎？');
        
        if (doubleConfirmed) {
            newsItems = [];
            activityItems = [];
            
            localStorage.setItem('newsItems', JSON.stringify(newsItems));
            localStorage.setItem('activityItems', JSON.stringify(activityItems));
            
            updatePreviews();
            
            alert('所有數據已清空！');
            
            // 通知主頁面更新內容
            if (window.opener && window.opener.refreshPageContent) {
                window.opener.refreshPageContent();
            }
        }
    }
}

// 顯示當前登入用戶信息
function displayUserInfo() {
    const user = localStorage.getItem('adminUser') || '管理員';
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement) {
        userInfoElement.innerHTML = `
            <span class="text-sm text-gray-300">歡迎，${user}</span>
        `;
    }
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
    // 設定今天的日期為預設值
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('news-date').value = today;
    document.getElementById('activity-date').value = today;
    
    // 顯示用戶信息
    displayUserInfo();
    
    // 初始化預覽內容
    updatePreviews();
});