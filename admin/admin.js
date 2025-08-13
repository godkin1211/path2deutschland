// ==================== 本地後台管理系統 ====================
// 直接操作本地JSON檔案，支援git push工作流程

const API_BASE_URL = 'http://localhost:3001/api';

// 資料管理變數
let newsItems = [];
let activityItems = [];

// API請求輔助函數
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API 請求失敗:', error);
        if (error.message.includes('fetch')) {
            throw new Error('無法連接到後端伺服器，請確認伺服器已啟動');
        }
        throw error;
    }
}

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

// 登出功能
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

// ==================== 資料載入功能 ====================

// 載入所有資料
async function loadAllData() {
    try {
        console.log('開始載入資料...');
        
        const [news, activities] = await Promise.all([
            apiRequest('/news'),
            apiRequest('/activities')
        ]);
        
        console.log('新聞資料:', news);
        console.log('活動資料:', activities);
        
        newsItems = news || [];
        activityItems = activities || [];
        
        console.log('資料載入完成，新聞數量:', newsItems.length, '活動數量:', activityItems.length);
        
        return true;
    } catch (error) {
        console.error('載入資料失敗:', error);
        
        // 如果是連接失敗，顯示更友善的錯誤訊息
        if (error.message.includes('無法連接到後端伺服器')) {
            alert('無法連接到後端伺服器！\n\n請確認:\n1. 已執行 cd admin && npm start\n2. 伺服器運行在 http://localhost:3001');
        } else {
            alert(`載入資料失敗: ${error.message}`);
        }
        
        return false;
    }
}

// ==================== 表單處理功能 ====================

// 處理最新動態表單提交
document.getElementById('news-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('news-title').value.trim();
    const date = document.getElementById('news-date').value;
    const content = document.getElementById('news-content').value.trim();
    
    if (!title || !date || !content) {
        alert('請填寫所有必填欄位！');
        return;
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '發布中...';
    submitButton.disabled = true;
    
    try {
        await apiRequest('/news', {
            method: 'POST',
            body: JSON.stringify({ title, date, content })
        });
        
        alert('最新動態已發布並寫入JSON檔案！');
        this.reset();
        
        // 重新載入資料並更新預覽
        await loadAllData();
        updatePreviews();
        
    } catch (error) {
        alert(`發布失敗: ${error.message}`);
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
});

// 處理活動紀錄表單提交
document.getElementById('activity-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('activity-title').value.trim();
    const date = document.getElementById('activity-date').value;
    const content = document.getElementById('activity-content').value.trim();
    
    if (!title || !date || !content) {
        alert('請填寫所有必填欄位！');
        return;
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '發布中...';
    submitButton.disabled = true;
    
    try {
        await apiRequest('/activities', {
            method: 'POST',
            body: JSON.stringify({ title, date, content })
        });
        
        alert('活動紀錄已發布並寫入JSON檔案！');
        this.reset();
        
        // 重新載入資料並更新預覽
        await loadAllData();
        updatePreviews();
        
    } catch (error) {
        alert(`發布失敗: ${error.message}`);
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
});

// ==================== 預覽更新功能 ====================

// 更新預覽區塊
function updatePreviews() {
    console.log('更新預覽，新聞數量:', newsItems.length, '活動數量:', activityItems.length);
    
    // 更新最新動態預覽
    const newsPreview = document.getElementById('news-preview');
    if (!newsPreview) {
        console.error('找不到news-preview元素');
        return;
    }
    
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
                        <img src="../${news.image}" alt="${news.title}" class="ml-4 w-16 h-16 object-cover rounded"
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
    if (!activitiesPreview) {
        console.error('找不到activities-preview元素');
        return;
    }
    
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
                        <img src="../${activity.image}" alt="${activity.title}" class="ml-4 w-16 h-16 object-cover rounded"
                             onerror="this.src='../img/icon.png'">
                    </div>
                    <button onclick="deleteActivity(${activity.id})" class="mt-3 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                        刪除
                    </button>
                </div>
            `).join('');
    }
    
    console.log('預覽更新完成');
}

// ==================== 刪除功能 ====================

// 刪除新聞
async function deleteNews(id) {
    if (!confirm('確定要刪除這則最新動態嗎？此操作無法復原，且會直接更新JSON檔案。')) {
        return;
    }
    
    try {
        await apiRequest(`/news/${id}`, { method: 'DELETE' });
        alert('最新動態已刪除並更新JSON檔案！');
        
        // 重新載入資料並更新預覽
        await loadAllData();
        updatePreviews();
        
    } catch (error) {
        alert(`刪除失敗: ${error.message}`);
    }
}

// 刪除活動
async function deleteActivity(id) {
    if (!confirm('確定要刪除這則活動紀錄嗎？此操作無法復原，且會直接更新JSON檔案。')) {
        return;
    }
    
    try {
        await apiRequest(`/activities/${id}`, { method: 'DELETE' });
        alert('活動紀錄已刪除並更新JSON檔案！');
        
        // 重新載入資料並更新預覽
        await loadAllData();
        updatePreviews();
        
    } catch (error) {
        alert(`刪除失敗: ${error.message}`);
    }
}

// ==================== 資料管理功能 ====================

// 備份所有資料
async function backupAllData() {
    try {
        const backup = await apiRequest('/backup');
        
        const jsonString = JSON.stringify(backup, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `website-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('資料備份已下載！');
    } catch (error) {
        alert(`備份失敗: ${error.message}`);
    }
}

// 清空所有資料
async function clearAllData() {
    const confirmed = confirm(
        '確定要清空所有資料嗎？\n\n' +
        '這將刪除所有新聞和活動記錄，並直接更新JSON檔案！\n' +
        '此操作無法復原，建議先進行備份。'
    );
    
    if (!confirmed) return;
    
    const doubleConfirmed = confirm('再次確認：真的要刪除所有資料嗎？');
    if (!doubleConfirmed) return;
    
    try {
        await apiRequest('/clear', { method: 'DELETE' });
        alert('所有資料已清空並更新JSON檔案！');
        
        // 重新載入資料並更新預覽
        await loadAllData();
        updatePreviews();
        
    } catch (error) {
        alert(`清空失敗: ${error.message}`);
    }
}

// ==================== UI 事件處理 ====================

// 處理登出按鈕
document.getElementById('logout-btn').addEventListener('click', function() {
    if (confirm('確定要登出管理後台嗎？')) {
        logout();
    }
});

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

// ==================== 頁面初始化 ====================

document.addEventListener('DOMContentLoaded', async function() {
    // 設定今天的日期為預設值
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('news-date').value = today;
    document.getElementById('activity-date').value = today;
    
    // 顯示用戶信息
    displayUserInfo();
    
    // 載入資料
    const success = await loadAllData();
    if (success) {
        updatePreviews();
    }
    
    // 定期檢查伺服器連線
    setInterval(async () => {
        try {
            await fetch(`${API_BASE_URL}/health`);
            document.body.classList.remove('server-offline');
        } catch (error) {
            document.body.classList.add('server-offline');
            console.warn('後端伺服器離線');
        }
    }, 30000);
});