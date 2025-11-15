// News1 Admin Panel JavaScript
let token = localStorage.getItem('admin_token');
let currentSlug = null;
let deferredPrompt = null;

// Mobile detection and optimizations
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// PWA Installation
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 Install prompt detected');
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 New service worker found');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateButton();
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
}

// Show install button
function showInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.innerHTML = '📱 Install App';
    installBtn.className = 'install-btn';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: transform 0.2s;
    `;

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('📱 Install outcome:', outcome);
            deferredPrompt = null;
            installBtn.remove();
        }
    });

    installBtn.addEventListener('mouseenter', () => {
        installBtn.style.transform = 'translateY(-2px)';
    });

    installBtn.addEventListener('mouseleave', () => {
        installBtn.style.transform = 'translateY(0)';
    });

    document.body.appendChild(installBtn);
}

// Show update button
function showUpdateButton() {
    const updateBtn = document.createElement('button');
    updateBtn.innerHTML = '🔄 Update Available';
    updateBtn.className = 'update-btn';
    updateBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
        animation: pulse 2s infinite;
    `;

    updateBtn.addEventListener('click', () => {
        window.location.reload();
    });

    document.body.appendChild(updateBtn);
}

// Check if already logged in
document.addEventListener('DOMContentLoaded', function () {
    // Add mobile-specific optimizations
    if (isMobile) {
        document.body.classList.add('mobile-device');
        console.log('📱 Mobile device detected, applying optimizations');

        // Prevent zoom on input focus (common mobile issue)
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', function () {
                document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            });

            input.addEventListener('blur', function () {
                document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0');
            });
        });

        // Improve touch feedback
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function () {
                this.style.transform = 'scale(0.98)';
            });

            button.addEventListener('touchend', function () {
                this.style.transform = 'scale(1)';
            });
        });
    }
    if (token) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        document.getElementById('user-info').innerHTML = '<span class="user-info">👤 Login sebagai: admin</span>';
        // Auto-load articles when already logged in
        loadArticles();
    }

    // Setup event listeners
    document.getElementById('loginBtn').addEventListener('click', login);

    // Setup admin panel listeners (these elements exist but are hidden initially)
    const logoutBtn = document.getElementById('logoutBtn');
    const loadArticlesBtn = document.getElementById('loadArticlesBtn');
    const refreshBtn = document.getElementById('refreshBtn');
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
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshArticles);
        console.log('✅ Refresh button listener attached');
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
    document.getElementById('password').addEventListener('keypress', function (e) {
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
            // Load articles after successful login
            loadArticles();
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

    console.log('🔍 Loading articles for channel:', channel);
    console.log('🔍 Token available:', !!token);
    console.log('🔍 Category filter:', categoryFilter);

    list.innerHTML = '<div class="loading">⏳ Memuat artikel...</div>';

    try {
        const url = `/api/admin/articles?channel=${encodeURIComponent(channel)}`;
        console.log('📡 Fetching from:', url);

        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
        });

        console.log('📡 Response status:', res.status);
        console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()));

        let articles = await res.json();

        console.log('📄 Raw response:', articles);
        console.log('📄 Response type:', typeof articles);
        console.log('📄 Is array?', Array.isArray(articles));

        // Handle different response formats
        if (typeof articles === 'string') {
            try {
                articles = JSON.parse(articles);
                console.log('📄 Parsed response:', articles);
            } catch (e) {
                console.error('❌ Failed to parse response as JSON:', e);
                list.innerHTML = '<div class="error-msg">❌ Format data artikel tidak valid!</div>';
                return;
            }
        }

        // Ensure articles is an array
        if (!Array.isArray(articles)) {
            console.error('❌ Expected array but got:', typeof articles, articles);
            console.error('❌ Response details:', {
                status: res.status,
                statusText: res.statusText,
                headers: Object.fromEntries(res.headers.entries())
            });
            list.innerHTML = '<div class="error-msg">❌ Gagal memuat artikel: articles.forEach is not a function</div>';
            return;
        }

        // Filter by category if selected
        if (categoryFilter) {
            articles = articles.filter(article => {
                const articleCategory = article.category ? article.category.replace(/"/g, '') : '';
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

            const title = article.title ? article.title.replace(/"/g, '') : 'Tanpa Judul';
            const excerpt = article.excerpt ? article.excerpt.replace(/"/g, '') : 'Tidak ada ringkasan';
            const category = article.category ? article.category.replace(/"/g, '') : 'Uncategorized';
            const author = article.author ? article.author.replace(/"/g, '') : 'Anonymous';
            const image = article.image ? article.image.replace(/"/g, '') : '';

            // Create image preview if available
            const imagePreview = image ? `
                <div style="margin: 10px 0;">
                    <img src="${image}" alt="${title}" style="max-width: 100px; max-height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                    <span style="display: none; color: #999; font-size: 12px;">�️ Gambar tidak tersedia</span>
                </div>
            ` : '';

            div.innerHTML = `
                ${imagePreview}
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
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Edit button clicked for slug:', this.dataset.slug);
                editArticle(this.dataset.slug, this.dataset.channel);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🗑️ Delete button clicked for slug:', this.dataset.slug);
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
        console.log('🔍 Loading article:', slug, 'from channel:', channel);

        const res = await fetch(`/api/admin/articles/${slug}?channel=${channel}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('📡 Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ Server response error:', errorText);
            throw new Error(`Server error: ${res.status} - ${errorText}`);
        }

        const article = await res.json();
        console.log('📄 Article data received:', article);

        // Validate article data
        if (!article || typeof article !== 'object') {
            throw new Error('Data artikel tidak valid');
        }

        // Set form values with null checks
        document.getElementById('article-slug').value = article.slug || slug;
        document.getElementById('article-title').value = article.title ? article.title.replace(/"/g, '') : '';
        document.getElementById('article-excerpt').value = article.excerpt ? article.excerpt.replace(/"/g, '') : '';
        document.getElementById('article-content').value = article.content || '';
        document.getElementById('article-category').value = article.category ? article.category.replace(/"/g, '') : 'Berita';
        document.getElementById('article-author').value = article.author ? article.author.replace(/"/g, '') : 'Admin';
        document.getElementById('article-image').value = article.image ? article.image.replace(/"/g, '') : '';

        console.log('✅ Form populated successfully');

        // Scroll to form
        document.getElementById('editor-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('❌ Edit article error:', error);
        alert('❌ Gagal memuat artikel: ' + error.message);

        // Hide form on error
        document.getElementById('editor-form').style.display = 'none';
        currentSlug = null;
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

    // Show loading state on the delete button
    const deleteBtn = document.querySelector(`.delete-btn[data-slug="${slug}"]`);
    const originalText = deleteBtn.innerHTML;
    deleteBtn.innerHTML = '⏳ Menghapus...';
    deleteBtn.disabled = true;

    try {
        const res = await fetch(`/api/admin/articles/${slug}?channel=${channel}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok) {
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-msg';
            successMsg.innerHTML = '✅ ' + data.message;
            successMsg.style.position = 'fixed';
            successMsg.style.top = '20px';
            successMsg.style.right = '20px';
            successMsg.style.zIndex = '9999';
            successMsg.style.padding = '15px 20px';
            successMsg.style.borderRadius = '8px';
            successMsg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            document.body.appendChild(successMsg);

            // Remove message after 3 seconds
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                }
            }, 3000);

            // Refresh the article list
            await loadArticles();
        } else {
            throw new Error(data.error || 'Delete failed');
        }
    } catch (error) {
        // Restore button state
        deleteBtn.innerHTML = originalText;
        deleteBtn.disabled = false;

        // Show error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-msg';
        errorMsg.innerHTML = '❌ Gagal menghapus artikel: ' + error.message;
        errorMsg.style.position = 'fixed';
        errorMsg.style.top = '20px';
        errorMsg.style.right = '20px';
        errorMsg.style.zIndex = '9999';
        errorMsg.style.padding = '15px 20px';
        errorMsg.style.borderRadius = '8px';
        errorMsg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        document.body.appendChild(errorMsg);

        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorMsg.parentNode) {
                errorMsg.parentNode.removeChild(errorMsg);
            }
        }, 5000);
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

async function refreshArticles() {
    const refreshBtn = document.getElementById('refreshBtn');
    const originalText = refreshBtn.innerHTML;
    const originalBg = refreshBtn.style.background;

    // Show loading state
    refreshBtn.innerHTML = '🔄 Refreshing...';
    refreshBtn.disabled = true;
    refreshBtn.style.background = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';

    try {
        // Clear cache and reload articles
        const list = document.getElementById('article-list');
        list.innerHTML = '<div class="loading">🔄 Refreshing artikel...</div>';

        // Force reload by adding timestamp
        const channel = document.getElementById('channel').value;
        const categoryFilter = document.getElementById('category-filter').value;

        const res = await fetch(`/api/admin/articles?channel=${channel}&_t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
        });

        let articles = await res.json();

        // Ensure articles is an array
        if (!Array.isArray(articles)) {
            console.error('❌ Expected array but got:', typeof articles, articles);
            list.innerHTML = '<div class="error-msg">❌ Format data artikel tidak valid!</div>';
            return;
        }

        // Filter by category if selected
        if (categoryFilter) {
            articles = articles.filter(article => {
                const articleCategory = article.category ? article.category.replace(/"/g, '') : '';
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

            const title = article.title ? article.title.replace(/"/g, '') : 'Tanpa Judul';
            const excerpt = article.excerpt ? article.excerpt.replace(/"/g, '') : 'Tidak ada ringkasan';
            const category = article.category ? article.category.replace(/"/g, '') : 'Uncategorized';
            const author = article.author ? article.author.replace(/"/g, '') : 'Anonymous';
            const image = article.image ? article.image.replace(/"/g, '') : '';

            // Create image preview if available
            const imagePreview = image ? `
                <div style="margin: 10px 0;">
                    <img src="${image}?_t=${Date.now()}" alt="${title}" style="max-width: 100px; max-height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                    <span style="display: none; color: #999; font-size: 12px;">🖼️ Gambar tidak tersedia</span>
                </div>
            ` : '';

            div.innerHTML = `
                ${imagePreview}
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
            btn.addEventListener('click', function () {
                editArticle(this.dataset.slug, this.dataset.channel);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                deleteArticle(this.dataset.slug, this.dataset.channel);
            });
        });

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-msg';
        successMsg.innerHTML = '✅ Artikel berhasil di-refresh!';
        successMsg.style.position = 'fixed';
        successMsg.style.top = '20px';
        successMsg.style.right = '20px';
        successMsg.style.zIndex = '9999';
        successMsg.style.padding = '15px 20px';
        successMsg.style.borderRadius = '8px';
        successMsg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        document.body.appendChild(successMsg);

        // Remove message after 2 seconds
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 2000);

    } catch (error) {
        const list = document.getElementById('article-list');
        list.innerHTML = '<div class="error-msg">❌ Gagal refresh artikel: ' + error.message + '</div>';
    } finally {
        // Restore button state
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
        refreshBtn.style.background = originalBg;
    }
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

    // Validate file size (20MB - updated untuk support mobile photos)
    if (file.size > 20 * 1024 * 1024) {
        statusDiv.innerHTML = '<div class="error-msg">❌ Ukuran file terlalu besar! Maksimal 20MB</div>';
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        statusDiv.innerHTML = '<div class="error-msg">❌ File harus berupa gambar!</div>';
        return;
    }

    // Show uploading status dengan compression info
    const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
    statusDiv.innerHTML = `<div class="loading">⏳ Mengupload foto (${originalSizeMB} MB) dan mengompres...</div>`;

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
            // Show success message dengan compression info
            let successMessage = `✅ Foto berhasil diupload!`;

            if (data.compressionRatio) {
                const originalMB = (data.originalSize / 1024 / 1024).toFixed(2);
                const compressedMB = (data.compressedSize / 1024 / 1024).toFixed(2);
                successMessage += `<br>📊 Kompresi: ${originalMB}MB → ${compressedMB}MB (${data.compressionRatio}% lebih kecil)`;

                if (data.dimensions) {
                    successMessage += `<br>📐 Ukuran: ${data.dimensions.width}×${data.dimensions.height}px`;
                }
            } else if (data.size) {
                successMessage += ` (${(data.size / 1024).toFixed(2)} KB)`;
            }

            statusDiv.innerHTML = `<div class="success-msg">${successMessage}</div>`;

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
