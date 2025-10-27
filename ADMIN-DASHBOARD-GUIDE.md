# 🎉 Admin Dashboard - Complete Implementation Guide

## ✅ Backend Admin API Ready!

**Status**: Backend API fully implemented and configured  
**Access**: https://wisanggeni.cloud/api/admin  
**Authentication**: JWT-based with username/password

---

## 🔐 Admin Credentials

```env
Username: admin
Password: Admin@News123
```

**Location**: `/root/News1/.env`

---

## 📡 API Endpoints Available

### Authentication
```bash
POST /api/admin/login
Body: { "username": "admin", "password": "Admin@News123" }
Response: { "token": "jwt-token", "username": "admin" }
```

### Article Management

**List Articles**
```bash
GET /api/admin/articles?channel=ambal
Header: Authorization: Bearer {token}
Response: Array of articles
```

**Get Single Article**
```bash
GET /api/admin/articles/{slug}?channel=ambal
Header: Authorization: Bearer {token}
Response: Article with full content
```

**Create Article**
```bash
POST /api/admin/articles
Header: Authorization: Bearer {token}
Body: {
  "channel": "ambal",
  "slug": "article-slug",
  "title": "Article Title",
  "excerpt": "Short description",
  "content": "Full markdown content here...",
  "category": "Politik",
  "author": "Admin",
  "image": "/images/photo.jpg",
  "tags": ["tag1", "tag2"]
}
Response: { "message": "Article created successfully", "slug": "article-slug" }
```

**Update Article**
```bash
PUT /api/admin/articles/{slug}
Header: Authorization: Bearer {token}
Body: {
  "channel": "ambal",
  "title": "Updated Title",
  "excerpt": "Updated excerpt",
  "content": "Updated content...",
  "category": "Ekonomi",
  "author": "Admin",
  "image": "/images/photo.jpg",
  "tags": ["tag1", "tag2"],
  "featured": true
}
Response: { "message": "Article updated successfully" }
```

**Delete Article**
```bash
DELETE /api/admin/articles/{slug}?channel=ambal
Header: Authorization: Bearer {token}
Response: { "message": "Article deleted successfully" }
```

**Upload Image**
```bash
POST /api/admin/upload
Header: Authorization: Bearer {token}
Body: FormData with image file
Response: { "url": "/uploads/image-123.jpg", "filename": "image-123.jpg" }
```

---

## 🚀 Testing Admin API

### 1. Test Login
```bash
curl -X POST https://wisanggeni.cloud/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@News123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}
```

### 2. List Articles
```bash
curl https://wisanggeni.cloud/api/admin/articles?channel=ambal \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Create New Article
```bash
curl -X POST https://wisanggeni.cloud/api/admin/articles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "ambal",
    "slug": "test-article",
    "title": "Test Article from Admin API",
    "excerpt": "This is a test article",
    "content": "Full content goes here...",
    "category": "Teknologi",
    "author": "Admin"
  }'
```

---

## 💻 Frontend Admin Panel Implementation

### Option 1: Using Postman/API Client

**Recommended for quick testing:**
1. Download Postman
2. Create collection with endpoints above
3. Set Authorization header with token
4. Manage articles via API calls

### Option 2: Custom Admin UI (Next Phase)

**Components needed:**
```
client/src/pages/admin/
├── Login.tsx          # Login form
├── Dashboard.tsx      # Channel & article list
├── ArticleEditor.tsx  # Rich text editor
└── ImageUpload.tsx    # Image upload component
```

**Routes to add:**
```typescript
<Route path="/admin/login" component={AdminLogin} />
<Route path="/admin" component={AdminDashboard} />
<Route path="/admin/editor" component={ArticleEditor} />
<Route path="/admin/editor/:slug" component={ArticleEditor} />
```

---

## 🎨 Quick Admin UI with HTML (Temporary Solution)

Create simple HTML admin panel:

```html
<!DOCTYPE html>
<html>
<head>
    <title>News1 Admin Panel</title>
    <style>
        body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .login-form, .article-form { max-width: 600px; }
        input, textarea, select { width: 100%; padding: 10px; margin: 10px 0; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
        .article-list { margin-top: 20px; }
        .article-item { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>News1 Admin Panel</h1>
    
    <!-- Login Form -->
    <div id="login-section">
        <h2>Login</h2>
        <input type="text" id="username" placeholder="Username">
        <input type="password" id="password" placeholder="Password">
        <button onclick="login()">Login</button>
    </div>
    
    <!-- Admin Dashboard -->
    <div id="admin-section" style="display:none;">
        <h2>Dashboard</h2>
        <select id="channel">
            <option value="ambal">Ambal</option>
            <option value="beritaangin">Berita Angin</option>
            <option value="dendelesinfo">Dendeles Info</option>
            <!-- Add all channels -->
        </select>
        <button onclick="loadArticles()">Load Articles</button>
        <button onclick="showCreateForm()">Create New Article</button>
        
        <div id="article-list"></div>
        
        <!-- Create/Edit Form -->
        <div id="editor-form" style="display:none;">
            <h3>Article Editor</h3>
            <input type="text" id="article-slug" placeholder="slug">
            <input type="text" id="article-title" placeholder="Title">
            <textarea id="article-excerpt" placeholder="Excerpt" rows="3"></textarea>
            <textarea id="article-content" placeholder="Content (Markdown)" rows="10"></textarea>
            <input type="text" id="article-category" placeholder="Category">
            <input type="text" id="article-author" placeholder="Author">
            <input type="text" id="article-image" placeholder="Image URL">
            <button onclick="saveArticle()">Save Article</button>
            <button onclick="cancelEdit()">Cancel</button>
        </div>
    </div>
    
    <script>
        let token = localStorage.getItem('admin_token');
        
        if (token) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-section').style.display = 'block';
        }
        
        async function login() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await res.json();
            if (data.token) {
                token = data.token;
                localStorage.setItem('admin_token', token);
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('admin-section').style.display = 'block';
                alert('Login successful!');
            } else {
                alert('Login failed!');
            }
        }
        
        async function loadArticles() {
            const channel = document.getElementById('channel').value;
            const res = await fetch(`/api/admin/articles?channel=${channel}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const articles = await res.json();
            const list = document.getElementById('article-list');
            list.innerHTML = '<h3>Articles</h3>';
            
            articles.forEach(article => {
                list.innerHTML += `
                    <div class="article-item">
                        <h4>${article.title}</h4>
                        <p>${article.excerpt}</p>
                        <button onclick="editArticle('${article.slug}')">Edit</button>
                        <button onclick="deleteArticle('${article.slug}')">Delete</button>
                    </div>
                `;
            });
        }
        
        function showCreateForm() {
            document.getElementById('editor-form').style.display = 'block';
            // Clear form fields
        }
        
        async function saveArticle() {
            const channel = document.getElementById('channel').value;
            const article = {
                channel,
                slug: document.getElementById('article-slug').value,
                title: document.getElementById('article-title').value,
                excerpt: document.getElementById('article-excerpt').value,
                content: document.getElementById('article-content').value,
                category: document.getElementById('article-category').value,
                author: document.getElementById('article-author').value,
                image: document.getElementById('article-image').value
            };
            
            const res = await fetch('/api/admin/articles', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(article)
            });
            
            const data = await res.json();
            alert(data.message);
            loadArticles();
            document.getElementById('editor-form').style.display = 'none';
        }
        
        async function deleteArticle(slug) {
            if (!confirm('Delete this article?')) return;
            
            const channel = document.getElementById('channel').value;
            const res = await fetch(`/api/admin/articles/${slug}?channel=${channel}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await res.json();
            alert(data.message);
            loadArticles();
        }
        
        function cancelEdit() {
            document.getElementById('editor-form').style.display = 'none';
        }
    </script>
</body>
</html>
```

Save as `/root/News1/client/public/admin.html`

Access at: `https://wisanggeni.cloud/admin.html`

---

## 🔒 Security Considerations

### Current Implementation
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Token expiration (24 hours)
- ✅ Protected API routes

### Production Recommendations
1. **Change default password** in `.env`
2. **Use strong JWT_SECRET** (already set)
3. **HTTPS only** (already enabled)
4. **Rate limiting** for login attempts
5. **IP whitelisting** for admin access

---

## 📝 Article Format (Markdown)

When creating articles, use this format:

```markdown
Your article content here...

## Heading 2
Paragraph text

### Heading 3
- List item 1
- List item 2

**Bold text** and *italic text*

![Image](https://example.com/image.jpg)
```

---

## 🚀 Deployment Status

**Backend API**: ✅ Deployed and ready  
**Authentication**: ✅ Working  
**CRUD Operations**: ✅ Implemented  
**Frontend UI**: ⏳ Temporary HTML provided (can build React UI next)

---

## 📞 API Testing with cURL

### Complete workflow example:

```bash
# 1. Login
TOKEN=$(curl -s -X POST https://wisanggeni.cloud/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@News123"}' | jq -r '.token')

# 2. List articles
curl -s https://wisanggeni.cloud/api/admin/articles?channel=ambal \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Create article
curl -X POST https://wisanggeni.cloud/api/admin/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "ambal",
    "slug": "breaking-news-new",
    "title": "Breaking News: New Development",
    "excerpt": "Exciting news from Ambal region",
    "content": "Full article content here with **markdown** support",
    "category": "Politik",
    "author": "Admin Team"
  }'

# 4. Update article
curl -X PUT https://wisanggeni.cloud/api/admin/articles/breaking-news-new \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "ambal",
    "title": "Updated Title",
    "content": "Updated content...",
    "featured": true
  }'

# 5. Delete article
curl -X DELETE "https://wisanggeni.cloud/api/admin/articles/breaking-news-new?channel=ambal" \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Next Steps

### Immediate Actions
1. Test API with Postman or cURL
2. Create temporary HTML admin page (provided above)
3. Start managing articles via API

### Future Enhancements
1. Build React admin UI with rich text editor
2. Image upload with file storage
3. User management (multiple admins)
4. Article scheduling
5. Draft/publish workflow
6. Media library management

---

## 📚 Documentation Summary

**Admin API Endpoint**: `/api/admin`  
**Authentication**: JWT Bearer token  
**Default Credentials**: admin / Admin@News123  
**Token Expiry**: 24 hours  
**Article Storage**: Markdown files in `/content/{channel}/`

---

**Status**: ✅ Admin Dashboard Backend COMPLETE!  
**Ready for**: Article management via API  
**Next**: Build React admin UI (optional) or use provided HTML

Last Updated: October 27, 2025
