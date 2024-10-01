const apiUrl = 'http://localhost:3000';
let token = null;

// Регистрация
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message);
});

// Логин
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.token) {
        token = data.token;
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('postSection').style.display = 'block';
        fetchPosts();
    } else {
        alert('Ошибка входа');
    }
});

// Получение постов
async function fetchPosts() {
    const response = await fetch(`${apiUrl}/posts`);
    const posts = await response.json();
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.innerHTML = `
            <p><strong>${post.username}</strong>: ${post.content}</p>
            ${post.username === getCurrentUser() ? `<button onclick="deletePost(${post.id})">Удалить</button>` : ''}
        `;
        postsContainer.appendChild(postElement);
    });
}

// Добавление поста
document.getElementById('postBtn').addEventListener('click', async () => {
    const content = document.getElementById('postContent').value;

    const response = await fetch(`${apiUrl}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
    });

    if (response.ok) {
        document.getElementById('postContent').value = '';
        fetchPosts();
    }
});

// Удаление поста
async function deletePost(postId) {
    await fetch(`${apiUrl}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchPosts();
}

// Получение текущего пользователя (декодирование токена)
function getCurrentUser() {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username;
}

