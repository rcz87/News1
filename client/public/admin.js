// News1 Admin Panel JavaScript
let token = localStorage.getItem('admin_token');
let currentSlug = null;

// Check if already logged in
document.addEventListener('DOMContentLoaded', function() {
    if (token) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        document.getElementById('user-info').innerHTML = '<span class="user-info">👤 Login sebagai: admin</span>';
    }

    // Setup event listeners
    document.getElementById('loginBtn').addEventListener('click', login);
    
    // Setup admin panel listeners (these elements exist but are hidden initially)
    const logoutBtn = document.getElementById('logoutBtn');
    const loadArticlesBtn = document.getElementById('loadArticlesBtn');
    const createNewBtn = document.getElementById('createNewBtn');
    const guideBtn = document.getElementById('guideBtn');
    const closeGuideBtn = document.getElementById('closeGuideBtn');
    const saveArticleBtn = document.getElementById('saveArticleBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
        console.log('✅ Logout button listener attached');
    }
    if (loadArticlesBtn) {
        loadArticlesBtn.addEventListener('click', loadArticles);
        console.log('✅ Load articles button listener attached');
    }
    if (createNewBtn) {
        createNewBtn.addEventListener('click', showCreateForm);
        console.log('✅ Create new button listener attached');
    }
    if (guideBtn) {
        guideBtn.addEventListener('click', showGuide);
        console.log('✅ Guide button listener attached');
        console.log('Guide button element:', guideBtn);
    } else {
        console.error('❌ Guide button NOT found!');
    }
    if (closeGuideBtn) {
        closeGuideBtn.addEventListener('click', closeGuide);
        console.log('✅ Close guide button listener attached');
    }
    if (saveArticleBtn) {
        saveArticleBtn.addEventListener('click', saveArticle);
        console.log('✅ Save article button listener attached');
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelEdit);
        console.log('✅ Cancel edit button listener attached');
    }
    if (uploadPhotoBtn) {
        uploadPhotoBtn.addEventListener('click', uploadPhoto);
        console.log('✅ Upload photo button listener attached');
    }
    
    // Allow Enter key to login
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });
});

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('login-message');

    try {
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
            document.getElementById('user-info').innerHTML = '<span class="user-info">👤 Login sebagai: ' + data.username + '</span>';
        } else {
            messageEl.innerHTML = '<div class="error-msg">❌ Username atau password salah!</div>';
        }
    } catch (error) {
        messageEl.innerHTML = '<div class="error-msg">❌ Login gagal: ' + error.message + '</div>';
    }
}

function logout() {
    if (confirm('Yakin ingin logout?')) {
        localStorage.removeItem('admin_token');
        location.reload();
    }
}

async function loadArticles() {
    const channel = document.getElementById('channel').value;
    const categoryFilter = document.getElementById('category-filter').value;
    const list = document.getElementById('article-list');
    list.innerHTML = '<div class="loading">⏳ Memuat artikel...</div>';

    try {
        const res = await fetch(`/api/admin/articles?channel=${channel}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        let articles = await res.json();
        
        // Filter by category if selected
        if (categoryFilter) {
            articles = articles.filter(article => {
                const articleCategory = article.category.replace(/"/g, '');
                return articleCategory === categoryFilter;
            });
        }
        
        if (articles.length === 0) {
            const filterMsg = categoryFilter 
                ? `📭 Belum ada artikel kategori ${categoryFilter} di channel ini` 
                : '📭 Belum ada artikel di channel ini';
            list.innerHTML = `<div class="error-msg">${filterMsg}</div>`;
            return;
        }

        const filterText = categoryFilter ? ` - Kategori: ${categoryFilter}` : '';
        list.innerHTML = `<h3 style="margin-bottom: 20px; color: #667eea;">📚 Daftar Artikel (${articles.length})${filterText}</h3>`;

        articles.forEach(article => {
            const div = document.createElement('div');
            div.className = 'article-item';
            
            const title = article.title.replace(/"/g, '');
            const excerpt = article.excerpt ? article.excerpt.replace(/"/g, '') : 'Tidak ada ringkasan';
            const category = article.category.replace(/"/g, '');
            const author = article.author.replace(/"/g, '');
            
            div.innerHTML = `
                <h3>${title}</h3>
                <p>${excerpt}</p>
                <small>📁 Kategori: ${category} | ✍️ Penulis: ${author}</small><br>
                <div style="margin-top: 12px;">
                    <button class="success edit-btn" data-slug="${article.slug}" data-channel="${channel}">✏️ Edit</button>
                    <button class="danger delete-btn" data-slug="${article.slug}" data-channel="${channel}">🗑️ Hapus</button>
                </div>
            `;
            list.appendChild(div);
        });

        // Add event listeners to edit/delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editArticle(this.dataset.slug, this.dataset.channel);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteArticle(this.dataset.slug, this.dataset.channel);
            });
        });
    } catch (error) {
        list.innerHTML = '<div class="error-msg">❌ Gagal memuat artikel: ' + error.message + '</div>';
    }
}

function showCreateForm() {
    currentSlug = null;
    document.getElementById('editor-title').textContent = '➕ Buat Artikel Baru';
    document.getElementById('editor-form').style.display = 'block';
    // Clear form
    document.getElementById('article-slug').value = '';
    document.getElementById('article-title').value = '';
    document.getElementById('article-excerpt').value = '';
    document.getElementById('article-content').value = '';
    document.getElementById('article-category').value = 'Berita';
    document.getElementById('article-author').value = 'Admin';
    document.getElementById('article-image').value = 'https://images.unsplash.com/photo-1';
    // Scroll to form
    document.getElementById('editor-form').scrollIntoView({ behavior: 'smooth' });
}

async function editArticle(slug, channel) {
    currentSlug = slug;
    document.getElementById('editor-title').textContent = '✏️ Edit Artikel';
    document.getElementById('editor-form').style.display = 'block';

    try {
        const res = await fetch(`/api/admin/articles/${slug}?channel=${channel}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const article = await res.json();
        document.getElementById('article-slug').value = article.slug;
        document.getElementById('article-title').value = article.title.replace(/"/g, '');
        document.getElementById('article-excerpt').value = article.excerpt.replace(/"/g, '');
        document.getElementById('article-content').value = article.content;
        document.getElementById('article-category').value = article.category.replace(/"/g, '');
        document.getElementById('article-author').value = article.author.replace(/"/g, '');
        document.getElementById('article-image').value = article.image.replace(/"/g, '');
        
        // Scroll to form
        document.getElementById('editor-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('❌ Gagal memuat artikel: ' + error.message);
    }
}

async function saveArticle() {
    const channel = document.getElementById('channel').value;
    const slug = document.getElementById('article-slug').value;
    
    if (!slug || !document.getElementById('article-title').value) {
        alert('❌ Slug dan judul harus diisi!');
        return;
    }

    const article = {
        channel,
        slug,
        title: document.getElementById('article-title').value,
        excerpt: document.getElementById('article-excerpt').value,
        content: document.getElementById('article-content').value,
        category: document.getElementById('article-category').value,
        author: document.getElementById('article-author').value,
        image: document.getElementById('article-image').value
    };

    const url = currentSlug
        ? `/api/admin/articles/${currentSlug}`
        : '/api/admin/articles';
    const method = currentSlug ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(article)
        });

        const data = await res.json();
        alert('✅ ' + data.message);
        loadArticles();
        cancelEdit();
    } catch (error) {
        alert('❌ Gagal menyimpan artikel: ' + error.message);
    }
}

async function deleteArticle(slug, channel) {
    if (!confirm('⚠️ Yakin ingin menghapus artikel ini?')) return;

    try {
        const res = await fetch(`/api/admin/articles/${slug}?channel=${channel}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        alert('✅ ' + data.message);
        loadArticles();
    } catch (error) {
        alert('❌ Gagal menghapus artikel: ' + error.message);
    }
}

function showGuide() {
    console.log('🔍 showGuide() called!');
    const guideElement = document.getElementById('writing-guide');
    console.log('Guide element:', guideElement);
    if (guideElement) {
        guideElement.style.display = 'block';
        console.log('✅ Guide display set to block');
        guideElement.scrollIntoView({ behavior: 'smooth' });
        console.log('✅ Scrolled to guide');
    } else {
        console.error('❌ writing-guide element not found!');
    }
}

function closeGuide() {
    document.getElementById('writing-guide').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    document.getElementById('editor-form').style.display = 'none';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('article-photo').value = '';
    document.getElementById('upload-status').innerHTML = '';
    currentSlug = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function uploadPhoto() {
    const fileInput = document.getElementById('article-photo');
    const statusDiv = document.getElementById('upload-status');
    const previewDiv = document.getElementById('photo-preview');
    const previewImg = document.getElementById('preview-img');
    const imageInput = document.getElementById('article-image');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        statusDiv.innerHTML = '<div class="error-msg">❌ Pilih foto terlebih dahulu!</div>';
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        statusDiv.innerHTML = '<div class="error-msg">❌ Ukuran file terlalu besar! Maksimal 5MB</div>';
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        statusDiv.innerHTML = '<div class="error-msg">❌ File harus berupa gambar!</div>';
        return;
    }
    
    // Show uploading status
    statusDiv.innerHTML = '<div class="loading">⏳ Mengupload foto...</div>';
    
    try {
        const formData = new FormData();
        formData.append('photo', file);
        
        const res = await fetch('/api/admin/upload-photo', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await res.json();
        
        if (data.success) {
            // Show success message
            statusDiv.innerHTML = `<div class="success-msg">✅ Foto berhasil diupload! (${(data.size / 1024).toFixed(2)} KB)</div>`;
            
            // Set the image URL in the input
            imageInput.value = data.url;
            
            // Show preview
            previewImg.src = data.url;
            previewDiv.style.display = 'block';
            
            // Clear file input
            fileInput.value = '';
        } else {
            statusDiv.innerHTML = `<div class="error-msg">❌ Upload gagal: ${data.error}</div>`;
        }
    } catch (error) {
        statusDiv.innerHTML = `<div class="error-msg">❌ Upload gagal: ${error.message}</div>`;
    }
}
