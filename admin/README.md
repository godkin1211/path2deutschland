# 後台管理系統

這是Path2Deutschland網站的本地後台管理系統，直接操作JSON檔案來管理網站內容。

## 🚀 快速開始

### 1. 安裝依賴
```bash
cd admin
npm install
```

### 2. 啟動後台伺服器
```bash
npm start
```
伺服器將在 `http://localhost:3001` 啟動

### 3. 開啟管理介面
瀏覽器開啟：`http://localhost:3001/index.html`

### 4. 設定密碼
首次使用需要設定管理員密碼：
```bash
# 複製環境變數範例檔案
cp .env.example .env

# 編輯 .env 檔案，設定您的密碼
nano .env
```

在 `.env` 檔案中設定：
```
ADMIN_PASSWORD=您的強密碼
```

### 5. 登入資訊
- **密碼**: 您在 `.env` 檔案中設定的密碼
- **名稱**: 任意名稱（建議使用 `admin`）

## 📁 檔案結構

```
admin/
├── server.js          # Node.js 後端伺服器
├── admin.js           # 前端管理邏輯
├── index.html         # 管理介面
├── login.html         # 登入頁面
├── package.json       # 專案配置
└── README.md          # 說明文件
```

## ⚡ 功能特色

### 內容管理
- ✅ 新增/刪除新聞動態
- ✅ 新增/刪除活動紀錄
- ✅ 即時預覽內容
- ✅ 直接寫入JSON檔案

### 檔案操作
- ✅ 自動讀寫 `../data/news.json`
- ✅ 自動讀寫 `../data/activities.json`
- ✅ 資料備份匯出
- ✅ 清空所有資料

### 工作流程
1. 在管理面板新增/編輯內容
2. 系統自動更新JSON檔案
3. 使用 `git push` 部署到GitHub Pages

## 🔧 API端點

| 方法 | 路徑 | 功能 |
|------|------|------|
| GET | `/api/news` | 獲取新聞資料 |
| POST | `/api/news` | 新增新聞 |
| DELETE | `/api/news/:id` | 刪除新聞 |
| GET | `/api/activities` | 獲取活動資料 |
| POST | `/api/activities` | 新增活動 |
| DELETE | `/api/activities/:id` | 刪除活動 |
| GET | `/api/backup` | 備份所有資料 |
| DELETE | `/api/clear` | 清空所有資料 |

## 🎯 使用流程

### 更新網站內容
1. 啟動後台：`npm start`
2. 開啟管理介面：`http://localhost:3001/index.html`
3. 登入並新增/編輯內容
4. 系統自動更新JSON檔案
5. 提交更改：
   ```bash
   git add data/
   git commit -m "更新網站內容"
   git push
   ```

### 資料備份
- 點擊「備份所有數據」按鈕下載完整備份
- JSON格式包含版本資訊和時間戳記

## ⚠️ 注意事項

- 需要Node.js環境（建議v14+）
- 後台只在本地運行，不會部署到GitHub Pages
- 所有內容更改會直接寫入檔案，請小心操作
- 建議定期備份資料

## 🐛 故障排除

### 後端伺服器無法啟動
```bash
# 檢查Node.js版本
node --version

# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install
```

### 無法連接伺服器
- 確認伺服器正在運行（port 3001）
- 檢查防火牆設定
- 確認沒有其他服務占用port 3001

### JSON檔案權限問題
```bash
# 確認檔案權限
ls -la ../data/

# 修復權限（如果需要）
chmod 644 ../data/*.json
```