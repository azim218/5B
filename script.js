// Проверка на наличие постов в localStorage
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Добавляем обработчик события для формы постов
document.getElementById('postForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const nickname = document.getElementById('nickname').value;
    const postContent = document.getElementById('postContent').value;

    // Создаём новый пост и добавляем его в массив
    const postId = posts.length + 1;
    const post = { id: postId, nickname: nickname, content: postContent, comments: [] };
    posts.push(post);

    // Сохраняем обновлённый массив постов в localStorage
    localStorage.setItem('posts', JSON.stringify(posts));
    document.getElementById('nickname').value = '';
    document.getElementById('postContent').value = '';
    loadPosts();
});

// Функция для загрузки постов из localStorage
function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';
    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <p><strong>${post.nickname}:</strong> ${post.content}</p>
            <textarea class="form-control" placeholder="Ваш комментарий..." data-post-id="${post.id}"></textarea>
            <button class="btn btn-secondary mt-2" onclick="addComment(${post.id})">Комментировать</button>
            <div class="comments"></div>
        `;
        postsContainer.appendChild(postElement);
        loadComments(postElement.querySelector('.comments'), post.comments); // Загрузка комментариев для каждого поста
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

// Функция для добавления комментария
function addComment(postId) {
    const post = posts.find(p => p.id === postId);
    const commentInput = document.querySelector(`textarea[data-post-id="${postId}"]`);
    const commentContent = commentInput.value;

    if (post && commentContent) {
        post.comments.push(commentContent);
        localStorage.setItem('posts', JSON.stringify(posts));
        commentInput.value = '';
        loadPosts(); // Обновляем посты, чтобы показать новый комментарий
    }
}

// Загружаем посты при загрузке страницы
loadPosts();
