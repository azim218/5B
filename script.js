const apiUrl = 'https://66fc1e6dc3a184a84d16248e.mockapi.io/api/posts';

// Функция для получения всех постов
async function fetchPosts() {
    const response = await fetch(apiUrl);
    const posts = await response.json();
    displayPosts(posts);
}

// Функция для отображения постов
function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <p><strong>${post.nickname}:</strong> ${post.content}</p>
            <textarea class="form-control" placeholder="Ваш комментарий..." data-post-id="${post.id}"></textarea>
            <button class="btn btn-secondary mt-2" onclick="addComment(${post.id})">Комментировать</button>
            <div class="comments"></div>
        `;
        postsContainer.appendChild(postElement);
        loadComments(postElement.querySelector('.comments'), post.comments || []); // Загрузка комментариев
    });
}

// Функция для загрузки комментариев
function loadComments(commentsContainer, comments) {
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.textContent = comment;
        commentsContainer.appendChild(commentElement);
    });
}

// Обработчик события отправки формы
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвратить перезагрузку страницы
    const nickname = document.getElementById('nickname').value;
    const content = document.getElementById('postContent').value;

    // Отправка нового поста на сервер
    await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname, content, comments: [] })
    });

    // Очистка полей формы
    document.getElementById('nickname').value = '';
    document.getElementById('postContent').value = '';

    // Обновление списка постов
    fetchPosts();
});

// Функция для добавления комментария
async function addComment(postId) {
    const postContent = document.querySelector(`textarea[data-post-id="${postId}"]`).value;

    if (postContent) {
        // Отправка комментария на сервер
        const post = await getPost(postId);
        await fetch(`${apiUrl}/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comments: [...post.comments, postContent] })
        });

        // Очистка поля ввода комментария
        document.querySelector(`textarea[data-post-id="${postId}"]`).value = '';

        // Обновление списка постов
        fetchPosts();
    }
}

// Функция для получения поста по ID
async function getPost(postId) {
    const response = await fetch(`${apiUrl}/${postId}`);
    return response.json();
}
// Функция для удаления поста
async function deletePost(postId) {
    await fetch(`${apiUrl}/${postId}`, {
        method: 'DELETE'
    });

    // Обновляем список постов
    fetchPosts();
}

// Добавляем кнопку для удаления постов в displayPosts
function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <p><strong>${post.nickname}:</strong> ${post.content}</p>
            <textarea class="form-control" placeholder="Ваш комментарий..." data-post-id="${post.id}"></textarea>
            <button class="btn btn-secondary mt-2" onclick="addComment(${post.id})">Комментировать</button>
            <button class="btn btn-danger mt-2" onclick="deletePost(${post.id})">Удалить пост</button>
            <div class="comments"></div>
        `;
        postsContainer.appendChild(postElement);
        loadComments(postElement.querySelector('.comments'), post.comments || []); // Загрузка комментариев
    });
}

// Первоначальная загрузка постов
fetchPosts();
