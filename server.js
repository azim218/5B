const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const users = []; // Хранение пользователей (на время примера в памяти)
const posts = []; // Хранение постов (в памяти)

// Секретный ключ для JWT
const SECRET_KEY = 'supersecretkey';

// Функция для генерации JWT токена
function generateToken(user) {
    return jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
}

// Регистрация пользователя
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Проверка на существующего пользователя
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: 'Пользователь зарегистрирован' });
});

// Логин пользователя
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Неверный пароль' });
    }

    // Генерация JWT токена
    const token = generateToken(user);
    res.json({ token });
});

// Middleware для проверки токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).json({ message: 'Токен не предоставлен' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Неверный токен' });

        req.user = user;
        next();
    });
}

// Получение постов
app.get('/posts', (req, res) => {
    res.json(posts);
});

// Добавление поста
app.post('/posts', authenticateToken, (req, res) => {
    const { content } = req.body;
    const post = { id: posts.length + 1, username: req.user.username, content, comments: [] };
    posts.push(post);
    res.status(201).json(post);
});

// Удаление поста (только автор может удалить)
app.delete('/posts/:id', authenticateToken, (req, res) => {
    const postId = parseInt(req.params.id);
    const postIndex = posts.findIndex(post => post.id === postId && post.username === req.user.username);

    if (postIndex === -1) {
        return res.status(403).json({ message: 'У вас нет прав на удаление этого поста' });
    }

    posts.splice(postIndex, 1);
    res.json({ message: 'Пост удалён' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
