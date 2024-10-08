const apiUrl = 'https://66fc1e6dc3a184a84d16248e.mockapi.io/api/posts';

// Получение IP-адреса пользователя
async function getUserIp() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}

// Функция для получения всех постов
async function fetchPosts() {
    const response = await fetch(apiUrl);
    const posts = await response.json();
    displayPosts(posts);
}

// Функция для отображения постов
async function displayPosts(posts) {
    const userIp = await getUserIp(); // Получаем текущий IP пользователя
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <img src="https://www.gravatar.com/avatar/${md5(post.nickname)}?s=40" alt="avatar" class="avatar">
                <strong>${post.nickname}</strong>
                <span class="post-time">${new Date().toLocaleString()}</span>
            </div>
            <p>${post.content}</p>
            <textarea class="form-control mt-2" placeholder="Ваш комментарий..." data-post-id="${post.id}"></textarea>
            <button class="btn btn-secondary mt-2" onclick="addComment(${post.id})">Комментировать</button>
            <div class="comments"></div>
        `;

        // Проверяем, совпадает ли IP текущего пользователя с IP автора поста
        if (userIp === post.userIp) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger mt-2';
            deleteButton.textContent = 'Удалить пост';
            deleteButton.onclick = () => deletePost(post.id);
            postElement.appendChild(deleteButton);
        }

        postsContainer.appendChild(postElement);
        loadComments(postElement.querySelector('.comments'), post.comments || []); // Загрузка комментариев
    });
}

// Функция для удаления поста
async function deletePost(postId) {
    await fetch(`${apiUrl}/${postId}`, {
        method: 'DELETE'
    });
    fetchPosts(); // Обновляем список постов
}

// Функция для загрузки комментариев
function loadComments(commentsContainer, comments) {
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-header">
                <img src="https://www.gravatar.com/avatar/${md5(comment.nickname)}?s=30" alt="avatar" class="comment-avatar">
                <strong>${comment.nickname}</strong>
                <span class="comment-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <p>${comment.text}</p>
        `;
        commentsContainer.appendChild(commentElement);
    });
}

// Обработчик события отправки формы
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвратить перезагрузку страницы
    const nickname = document.getElementById('nickname').value;
    const content = document.getElementById('postContent').value;
    const userIp = await getUserIp(); // Получаем IP при создании поста

    // Отправка нового поста на сервер с сохранением IP-адреса
    await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname, content, comments: [], userIp })
    });

    // Очистка полей формы
    document.getElementById('nickname').value = '';
    document.getElementById('postContent').value = '';
    fetchPosts(); // Обновляем список постов
});

// Функция для добавления комментария
async function addComment(postId) {
    const commentText = document.querySelector(`textarea[data-post-id="${postId}"]`).value;
    const nickname = document.getElementById('nickname').value;

    if (commentText) {
        const post = await getPost(postId);
        await fetch(`${apiUrl}/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comments: [...post.comments, { nickname, text: commentText }] })
        });
        fetchPosts(); // Обновляем список постов
    }
}

// Функция для получения поста по ID
async function getPost(postId) {
    const response = await fetch(`${apiUrl}/${postId}`);
    return response.json();
}

// Первоначальная загрузка постов
fetchPosts();

