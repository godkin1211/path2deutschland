# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for 遊此德證遊留學專業諮詢顧問有限公司 (Path2Deutschland), a German study abroad consulting company. The site features:

- Traditional Chinese (zh-TW) language interface
- Static HTML/CSS/JavaScript frontend with TailwindCSS  
- JSON file-based content management system
- Local Node.js admin backend that directly modifies JSON files

## Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript (no build process required)
- **Styling**: TailwindCSS (loaded via CDN)
- **Data Storage**: JSON files in `data/` directory
- **Admin Backend**: Node.js + Express (local only)
- **Content Management**: Local admin system with file operations
- **Authentication**: Simple password-based authentication
- **Deployment**: Static files (GitHub Pages), admin runs locally

## Development Commands

### Frontend Development
Static website with no build process:

```bash
python -m http.server 8000
# or
npx serve .
```

### Admin Backend Development

```bash
cd admin
npm install          # Install dependencies
npm start            # Start admin server (localhost:3001)
```

### Content Management

```bash
# After making content changes in admin panel
git add data/
git commit -m "更新網站內容"  
git push            # Deploy to GitHub Pages
```

## Architecture and File Structure

```
/
├── index.html              # Main website homepage
├── data/
│   ├── news.json          # News/announcements data (managed by admin)
│   └── activities.json    # Activities/events data (managed by admin)
├── admin/                 # Local admin system (NOT deployed)
│   ├── server.js          # Node.js backend server
│   ├── admin.js           # Frontend admin logic  
│   ├── index.html         # Admin dashboard
│   ├── login.html         # Admin login page
│   ├── package.json       # Node.js dependencies
│   └── README.md          # Admin setup instructions
├── js/
│   └── main.js            # Main website JavaScript (reads JSON files)
├── styles/
│   └── main.css           # Custom CSS styles
└── img/                   # Images and assets
```

## Key Components

### Main Website (`index.html`, `js/main.js`)

- Loads content from JSON files in `data/` directory
- Responsive design with TailwindCSS
- Fade-in animations with Intersection Observer
- No build process required

### Admin System (`admin/`)

- **Backend**: Node.js + Express server (port 3001)
- **Authentication**: Password-based login (default: `admin12345678`)
- **File Operations**: Direct read/write to JSON files in `data/` directory
- **Features**: Add/delete news and activities, backup data
- **Local Only**: Admin system never deployed to GitHub Pages

### Data Flow

1. **Content Creation**: Admin panel → Local Node.js server
2. **File Updates**: Server directly modifies `data/*.json` files  
3. **Version Control**: `git add data/ && git commit && git push`
4. **Deployment**: GitHub Pages automatically serves updated JSON files
5. **Frontend**: Main website fetches JSON files via HTTP

## Admin Access

### Setup and Login

```bash
cd admin
npm install
npm start
# Open: http://localhost:3001/index.html
```

**Login Credentials:**
- Password: `admin12345678` (configurable in `admin/login.html`)
- Name: Any name (for display purposes)

### Security Configuration

- Password: Modify `ADMIN_PASSWORD` in `admin/login.html`
- Session timeout: 24 hours
- Local only: Admin never exposed publicly

## Content Management Workflow

### Daily Operations

1. **Start Admin**: `cd admin && npm start`
2. **Login**: `http://localhost:3001/index.html`
3. **Manage Content**: Add/edit/delete news and activities  
4. **Auto-Save**: Changes immediately written to JSON files
5. **Deploy**: `git add data/ && git commit -m "更新內容" && git push`

### Data Structure

JSON files are automatically managed by the admin system:

```javascript
// data/news.json
[
  {
    "id": 1755067073333,
    "title": "我們公司的網站上線啦！",
    "date": "2025-08-13",
    "content": "接下來我們會持續同步更新...",
    "image": "img/icon.png"
  }
]

// data/activities.json  
[
  {
    "id": 1755069160386,
    "title": "拜訪洪堡學院",
    "date": "2025-08-13", 
    "content": "很榮幸受邀前往 Humboldt Institut...",
    "image": "img/icon.png"
  }
]
```

## API Endpoints (Admin Only)

The admin backend provides these endpoints:

- `GET /api/news` - Fetch news data
- `POST /api/news` - Create news item
- `DELETE /api/news/:id` - Delete news item
- `GET /api/activities` - Fetch activities data  
- `POST /api/activities` - Create activity item
- `DELETE /api/activities/:id` - Delete activity item
- `GET /api/backup` - Download complete backup
- `DELETE /api/clear` - Clear all data

## Deployment Architecture

### GitHub Pages (Production)
- **What's deployed**: Frontend only (`index.html`, `js/`, `styles/`, `data/`, `img/`)
- **What's excluded**: `admin/` directory (never deployed)
- **Content source**: JSON files in `data/` directory
- **Updates**: Via git push after local admin changes

### Local Development  
- **Frontend**: Any static server for testing
- **Admin**: Node.js server on localhost:3001
- **Content editing**: Through admin interface
- **File changes**: Direct JSON file modification

## Development Tips

- **Admin changes**: Automatically saved to JSON files
- **Testing locally**: Frontend reads JSON files via HTTP
- **Production**: GitHub Pages serves JSON files statically  
- **Version control**: Only commit `data/` changes after content updates
- **Backup**: Use admin panel export feature regularly
- **Images**: All content uses `img/icon.png` by default

## Contact Information

The website includes:
- Facebook page links
- LINE chat integration (@013cicgc)  
- Email contact (path2deutschland@gmail.com)

## Troubleshooting

### Admin Server Issues
- **Port conflict**: Check if port 3001 is available
- **Dependencies**: Run `cd admin && npm install`
- **Node version**: Requires Node.js 14+ 

### File Permission Issues
```bash
# Check JSON file permissions
ls -la data/
# Fix if needed
chmod 644 data/*.json
```

### GitHub Pages Not Updating
- Verify JSON files are committed and pushed
- Check GitHub Actions deployment status
- Confirm `data/` directory is not in `.gitignore`