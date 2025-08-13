// 管理後台配置文件
// 此文件包含管理後台的基本配置設定

const ADMIN_CONFIG = {
    // GitHub用戶配置
    github: {
        // 允許管理網站的GitHub用戶名 (必須設定)
        allowedUsers: ['your_github_username'], // 請將 'your_github_username' 替換為您的GitHub用戶名
        
        // GitHub Repository配置 (用於數據存儲)
        owner: 'your_github_username', // 您的GitHub用戶名
        repo: 'Website', // 存儲網站數據的repository名稱
        
        // GitHub Personal Access Token (需要從環境變數或用戶輸入獲取)
        // 注意：請勿在此處硬編碼您的token
        tokenStorageKey: 'github_access_token'
    },
    
    // 數據存儲配置
    storage: {
        // 數據文件在GitHub repository中的路徑
        newsDataPath: 'data/news.json',
        activitiesDataPath: 'data/activities.json',
        
        // 本地存儲鍵名
        localNewsKey: 'newsItems',
        localActivitiesKey: 'activityItems'
    },
    
    // 安全配置
    security: {
        // Token有效期 (24小時)
        tokenExpiryHours: 24,
        
        // 自動登出時間 (小時)
        autoLogoutHours: 24
    }
};

// 導出配置以供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ADMIN_CONFIG;
} else {
    window.ADMIN_CONFIG = ADMIN_CONFIG;
}