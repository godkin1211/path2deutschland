// ==================== 登入驗證和安全功能 ====================

// 從配置文件獲取允許的用戶列表
const ALLOWED_USERS = ADMIN_CONFIG.github.allowedUsers;

// 檢查登入狀態
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginTime = localStorage.getItem('adminLoginTime');
    const githubUser = localStorage.getItem('githubUser');
    
    if (!isLoggedIn || !githubUser) {
        // 未登入，重定向到登入頁面
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const user = JSON.parse(githubUser);
        
        // 檢查用戶是否有權限
        if (!ALLOWED_USERS.includes(user.login)) {
            console.error('用戶沒有管理權限:', user.login);
            logout();
            return false;
        }
        
        // 檢查登入時效（24小時）
        if (loginTime) {
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                // 登入已過期
                logout();
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('解析用戶數據失敗:', error);
        logout();
        return false;
    }
}

// 登出功能
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('githubUser');
    localStorage.removeItem('adminRememberMe');
    window.location.href = 'login.html';
}

// 獲取當前登入的GitHub用戶
function getCurrentUser() {
    try {
        const githubUser = localStorage.getItem('githubUser');
        return githubUser ? JSON.parse(githubUser) : null;
    } catch (error) {
        console.error('獲取用戶信息失敗:', error);
        return null;
    }
}

// GitHub API 請求輔助函數
async function githubApiRequest(endpoint, options = {}) {
    const user = getCurrentUser();
    if (!user || !user.access_token) {
        throw new Error('沒有有效的GitHub訪問令牌');
    }
    
    const defaultOptions = {
        headers: {
            'Authorization': `token ${user.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    };
    
    const response = await fetch(`https://api.github.com${endpoint}`, finalOptions);
    
    if (!response.ok) {
        throw new Error(`GitHub API請求失敗: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

// 頁面載入時檢查登入狀態
if (!checkLoginStatus()) {
    // 如果未登入，停止載入其餘程式碼
    throw new Error('用戶未登入');
}

// ==================== 內容管理功能 ====================

// 資料管理設定
let newsItems = JSON.parse(localStorage.getItem('newsItems') || '[]');
let activityItems = JSON.parse(localStorage.getItem('activityItems') || '[]');

// GitHub 資料同步功能
async function syncDataToGitHub() {
    try {
        const user = getCurrentUser();
        if (!user || !user.access_token) {
            throw new Error('沒有有效的 GitHub 訪問令牌');
        }

        // 獲取當前檔案的 SHA (用於更新)
        const newsFileSha = await getFileSha(ADMIN_CONFIG.storage.newsDataPath);
        const activitiesFileSha = await getFileSha(ADMIN_CONFIG.storage.activitiesDataPath);

        // 更新新聞檔案
        await updateGitHubFile(
            ADMIN_CONFIG.storage.newsDataPath,
            JSON.stringify(newsItems, null, 2),
            '更新新聞資料',
            newsFileSha
        );

        // 更新活動檔案
        await updateGitHubFile(
            ADMIN_CONFIG.storage.activitiesDataPath,
            JSON.stringify(activityItems, null, 2),
            '更新活動資料',
            activitiesFileSha
        );

        return true;
    } catch (error) {
        console.error('同步資料到 GitHub 失敗:', error);
        return false;
    }
}

// 獲取檔案的 SHA
async function getFileSha(path) {
    try {
        const response = await githubApiRequest(`/repos/${ADMIN_CONFIG.github.owner}/${ADMIN_CONFIG.github.repo}/contents/${path}`);
        return response.sha;
    } catch (error) {
        // 檔案不存在，返回 null
        return null;
    }
}

// 更新 GitHub 檔案
async function updateGitHubFile(path, content, message, sha = null) {
    const data = {
        message: message,
        content: btoa(unescape(encodeURIComponent(content))), // Base64 編碼
        branch: 'main'
    };

    if (sha) {
        data.sha = sha; // 更新現有檔案需要 SHA
    }

    return await githubApiRequest(`/repos/${ADMIN_CONFIG.github.owner}/${ADMIN_CONFIG.github.repo}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// 處理最新動態表單提交
document.getElementById('news-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // 防止表單預設提交行為
    
    // 收集表單資料
    const title = document.getElementById('news-title').value.trim();
    const date = document.getElementById('news-date').value;
    const content = document.getElementById('news-content').value.trim();
    const imageFile = document.getElementById('news-image').files[0];
    
    // 表單驗證
    if (!title || !date || !content) {
        alert('請填寫所有必填欄位！');
        return;
    }
    
    // 建立新聞項目物件
    const newsItem = {
        id: Date.now(), // 使用時間戳作為唯一 ID
        title: title,
        date: date,
        content: content,
        image: 'img/icon.png' // 統一使用 icon.png 作為預覽圖片
    };

    // 將新項目加入陣列開頭（最新的在前面）
    newsItems.unshift(newsItem);
    // 儲存到 localStorage
    localStorage.setItem('newsItems', JSON.stringify(newsItems));
    
    // 同步到 GitHub
    const syncButton = document.querySelector('#news-form button[type="submit"]');
    const originalText = syncButton.textContent;
    syncButton.textContent = '同步中...';
    syncButton.disabled = true;
    
    try {
        const success = await syncDataToGitHub();
        if (success) {
            alert('最新動態已發布並同步到 GitHub！');
        } else {
            alert('最新動態已本地發布，但同步到 GitHub 失敗。請檢查網路連線或重試。');
        }
    } catch (error) {
        alert('發布失敗：' + error.message);
    } finally {
        syncButton.textContent = originalText;
        syncButton.disabled = false;
    }
    
    // 重置表單並更新預覽
    this.reset();
    updatePreviews();
    
    // 通知主頁面更新內容
    if (window.opener && window.opener.refreshPageContent) {
        window.opener.refreshPageContent();
    }
});

// 處理活動紀錄表單提交
document.getElementById('activity-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // 防止表單預設提交行為
    
    // 收集表單資料
    const title = document.getElementById('activity-title').value.trim();
    const date = document.getElementById('activity-date').value;
    const content = document.getElementById('activity-content').value.trim();
    const imageFile = document.getElementById('activity-image').files[0];
    
    // 表單驗證
    if (!title || !date || !content) {
        alert('請填寫所有必填欄位！');
        return;
    }
    
    // 建立活動項目物件
    const activityItem = {
        id: Date.now(), // 使用時間戳作為唯一 ID
        title: title,
        date: date,
        content: content,
        image: 'img/icon.png' // 統一使用 icon.png 作為預覽圖片
    };

    // 將新項目加入陣列開頭（最新的在前面）
    activityItems.unshift(activityItem);
    // 儲存到 localStorage
    localStorage.setItem('activityItems', JSON.stringify(activityItems));
    
    // 同步到 GitHub
    const syncButton = document.querySelector('#activity-form button[type="submit"]');
    const originalText = syncButton.textContent;
    syncButton.textContent = '同步中...';
    syncButton.disabled = true;
    
    try {
        const success = await syncDataToGitHub();
        if (success) {
            alert('活動紀錄已發布並同步到 GitHub！');
        } else {
            alert('活動紀錄已本地發布，但同步到 GitHub 失敗。請檢查網路連線或重試。');
        }
    } catch (error) {
        alert('發布失敗：' + error.message);
    } finally {
        syncButton.textContent = originalText;
        syncButton.disabled = false;
    }
    
    // 重置表單並更新預覽
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
async function deleteNews(id) {
    if (confirm('確定要刪除這則最新動態嗎？此操作無法復原。')) {
        // 從陣列中移除指定 ID 的項目
        newsItems = newsItems.filter(item => item.id !== id);
        // 更新 localStorage
        localStorage.setItem('newsItems', JSON.stringify(newsItems));
        
        // 同步到 GitHub
        try {
            const success = await syncDataToGitHub();
            if (success) {
                alert('最新動態已刪除並同步到 GitHub！');
            } else {
                alert('最新動態已本地刪除，但同步到 GitHub 失敗。');
            }
        } catch (error) {
            alert('刪除失敗：' + error.message);
        }
        
        // 更新預覽顯示
        updatePreviews();
        
        // 通知主頁面更新內容
        if (window.opener && window.opener.refreshPageContent) {
            window.opener.refreshPageContent();
        }
    }
}

async function deleteActivity(id) {
    if (confirm('確定要刪除這則活動紀錄嗎？此操作無法復原。')) {
        // 從陣列中移除指定 ID 的項目
        activityItems = activityItems.filter(item => item.id !== id);
        // 更新 localStorage
        localStorage.setItem('activityItems', JSON.stringify(activityItems));
        
        // 同步到 GitHub
        try {
            const success = await syncDataToGitHub();
            if (success) {
                alert('活動紀錄已刪除並同步到 GitHub！');
            } else {
                alert('活動紀錄已本地刪除，但同步到 GitHub 失敗。');
            }
        } catch (error) {
            alert('刪除失敗：' + error.message);
        }
        
        // 更新預覽顯示
        updatePreviews();
        
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

// 處理手動同步按鈕
document.getElementById('sync-btn').addEventListener('click', async function() {
    const syncButton = this;
    const originalText = syncButton.textContent;
    
    syncButton.textContent = '同步中...';
    syncButton.disabled = true;
    
    try {
        const success = await syncDataToGitHub();
        if (success) {
            alert('資料已成功同步到 GitHub！');
            // 通知主頁面更新內容
            if (window.opener && window.opener.refreshPageContent) {
                window.opener.refreshPageContent();
            }
        } else {
            alert('同步到 GitHub 失敗，請檢查網路連線或重試。');
        }
    } catch (error) {
        alert('同步失敗：' + error.message);
    } finally {
        syncButton.textContent = originalText;
        syncButton.disabled = false;
    }
});

// 顯示當前登入用戶信息
function displayUserInfo() {
    const user = getCurrentUser();
    if (user) {
        const userInfoElement = document.getElementById('user-info');
        if (userInfoElement) {
            userInfoElement.innerHTML = `
                <div class="flex items-center space-x-3">
                    <img src="${user.avatar_url}" alt="${user.name || user.login}" class="w-8 h-8 rounded-full">
                    <span class="text-sm text-gray-600">歡迎，${user.name || user.login}</span>
                </div>
            `;
        }
    }
}

// ==================== 數據管理功能 ====================

// 導出所有數據
function exportAllData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        exportedBy: getCurrentUser()?.login || 'unknown',
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
    
    alert('數據導出成功！');
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
            if (!data.version || !data.newsItems || !data.activityItems) {
                throw new Error('無效的數據格式');
            }
            
            // 確認導入
            const confirmed = confirm(
                `確定要導入數據嗎？\n\n` +
                `導出時間: ${new Date(data.exportDate).toLocaleString()}\n` +
                `導出者: ${data.exportedBy}\n` +
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

// 頁面載入時初始化預覽
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
