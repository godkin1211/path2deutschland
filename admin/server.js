const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const multer = require('multer');

// 載入環境變數
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 檢查必要的環境變數
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
    console.error('❌ 錯誤：未設定 ADMIN_PASSWORD 環境變數');
    console.error('請建立 admin/.env 檔案並設定 ADMIN_PASSWORD=您的密碼');
    process.exit(1);
}

// 中介軟體
app.use(cors());
app.use(express.json());

// 提供靜態檔案服務
app.use(express.static(path.join(__dirname)));

// 提供根目錄訪問admin介面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 檔案路徑
const DATA_DIR = path.join(__dirname, '..', 'data');
const IMG_DIR = path.join(__dirname, '..', 'img');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');

// Multer 文件上傳配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 確保img目錄存在
        fs.mkdir(IMG_DIR, { recursive: true }).then(() => {
            cb(null, IMG_DIR);
        }).catch(err => {
            console.error('創建img目錄失敗:', err);
            cb(err);
        });
    },
    filename: function (req, file, cb) {
        // 生成唯一檔名：時間戳_原始檔名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, uniqueSuffix + '_' + baseName + ext);
    }
});

// 文件過濾器：只允許圖片
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('只允許上傳圖片文件！'), false);
    }
};

// Multer 實例
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制5MB
    }
});

// 讀取JSON檔案
async function readJSONFile(filePath, defaultValue = []) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.warn(`無法讀取檔案 ${filePath}，使用預設值:`, error.message);
        return defaultValue;
    }
}

// 寫入JSON檔案
async function writeJSONFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`寫入檔案失敗 ${filePath}:`, error);
        throw error;
    }
}

// API路由

// 獲取新聞資料
app.get('/api/news', async (req, res) => {
    try {
        const news = await readJSONFile(NEWS_FILE);
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: '讀取新聞資料失敗' });
    }
});

// 獲取活動資料
app.get('/api/activities', async (req, res) => {
    try {
        const activities = await readJSONFile(ACTIVITIES_FILE);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: '讀取活動資料失敗' });
    }
});

// 新增新聞（支援圖片上傳）
app.post('/api/news', upload.single('image'), async (req, res) => {
    try {
        const { title, date, content } = req.body;
        
        // 驗證必填欄位
        if (!title || !date || !content) {
            return res.status(400).json({ error: '請填寫所有必填欄位' });
        }

        const news = await readJSONFile(NEWS_FILE);
        
        // 決定圖片路徑
        let imagePath = 'img/icon.png'; // 預設圖片
        if (req.file) {
            imagePath = `img/${req.file.filename}`;
        }
        
        // 建立新的新聞項目
        const newNews = {
            id: Date.now(),
            title: title.trim(),
            date: date,
            content: content.trim(),
            image: imagePath
        };

        // 加入到陣列開頭
        news.unshift(newNews);
        
        // 寫入檔案
        await writeJSONFile(NEWS_FILE, news);
        
        res.json({ success: true, data: newNews });
        console.log(`新增新聞: ${title}${req.file ? ` (圖片: ${imagePath})` : ''}`);
    } catch (error) {
        console.error('新增新聞失敗:', error);
        res.status(500).json({ error: '新增新聞失敗' });
    }
});

// 新增活動（支援圖片上傳）
app.post('/api/activities', upload.single('image'), async (req, res) => {
    try {
        const { title, date, content } = req.body;
        
        // 驗證必填欄位
        if (!title || !date || !content) {
            return res.status(400).json({ error: '請填寫所有必填欄位' });
        }

        const activities = await readJSONFile(ACTIVITIES_FILE);
        
        // 決定圖片路徑
        let imagePath = 'img/icon.png'; // 預設圖片
        if (req.file) {
            imagePath = `img/${req.file.filename}`;
        }
        
        // 建立新的活動項目
        const newActivity = {
            id: Date.now(),
            title: title.trim(),
            date: date,
            content: content.trim(),
            image: imagePath
        };

        // 加入到陣列開頭
        activities.unshift(newActivity);
        
        // 寫入檔案
        await writeJSONFile(ACTIVITIES_FILE, activities);
        
        res.json({ success: true, data: newActivity });
        console.log(`新增活動: ${title}${req.file ? ` (圖片: ${imagePath})` : ''}`);
    } catch (error) {
        console.error('新增活動失敗:', error);
        res.status(500).json({ error: '新增活動失敗' });
    }
});

// 刪除新聞
app.delete('/api/news/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const news = await readJSONFile(NEWS_FILE);
        
        const filteredNews = news.filter(item => item.id !== id);
        
        if (filteredNews.length === news.length) {
            return res.status(404).json({ error: '找不到指定的新聞' });
        }
        
        await writeJSONFile(NEWS_FILE, filteredNews);
        
        res.json({ success: true });
        console.log(`刪除新聞 ID: ${id}`);
    } catch (error) {
        res.status(500).json({ error: '刪除新聞失敗' });
    }
});

// 刪除活動
app.delete('/api/activities/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const activities = await readJSONFile(ACTIVITIES_FILE);
        
        const filteredActivities = activities.filter(item => item.id !== id);
        
        if (filteredActivities.length === activities.length) {
            return res.status(404).json({ error: '找不到指定的活動' });
        }
        
        await writeJSONFile(ACTIVITIES_FILE, filteredActivities);
        
        res.json({ success: true });
        console.log(`刪除活動 ID: ${id}`);
    } catch (error) {
        res.status(500).json({ error: '刪除活動失敗' });
    }
});

// 獲取所有資料（用於備份）
app.get('/api/backup', async (req, res) => {
    try {
        const news = await readJSONFile(NEWS_FILE);
        const activities = await readJSONFile(ACTIVITIES_FILE);
        
        const backup = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            newsItems: news,
            activityItems: activities
        };
        
        res.json(backup);
    } catch (error) {
        res.status(500).json({ error: '備份資料失敗' });
    }
});

// 清空所有資料
app.delete('/api/clear', async (req, res) => {
    try {
        await writeJSONFile(NEWS_FILE, []);
        await writeJSONFile(ACTIVITIES_FILE, []);
        
        res.json({ success: true });
        console.log('已清空所有資料');
    } catch (error) {
        res.status(500).json({ error: '清空資料失敗' });
    }
});

// 密碼驗證API
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ error: '請提供密碼' });
    }
    
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: '登入成功' });
    } else {
        res.status(401).json({ error: '密碼錯誤' });
    }
});

// 健康檢查
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 後台伺服器已啟動在 http://localhost:${PORT}`);
    console.log(`📁 資料目錄: ${DATA_DIR}`);
    console.log(`📊 管理介面: http://localhost:${PORT}/index.html`);
});