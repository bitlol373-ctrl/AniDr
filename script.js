let isDragging = false;
let isPausedBeforeDrag = false;
let hideTimeout; // Должно быть в первой строке файла
const CLIENT_ID = "1079562695139-gati8g4qv0urb6cncdae5bqeaei8aeh6.apps.googleusercontent.com"; 
let cropper;

// --- МОДАЛКИ ---
function openModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.style.display = 'block';
        updateUI();
    }
}

function openModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.style.display = 'block';
        updateUI();
    }
}

function closeModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
}

function switchTab(evt, tabName) {
    const contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].style.display = "none";
    }

    const btns = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < btns.length; i++) {
        btns[i].classList.remove("active");
    }

    const target = document.getElementById(tabName);
    if (target) {
        target.style.display = "block";
        if (evt) evt.currentTarget.classList.add("active");
    }

    if (tabName === 'edit-profile' && !localStorage.getItem('userName')) {
        initGoogleButton();
    }
}

// --- GOOGLE AUTH ---
function initGoogleButton() {
    const container = document.getElementById("google-btn-container");
    if (container && window.google) {
        container.innerHTML = ""; 
        google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handleCredentialResponse });
        google.accounts.id.renderButton(container, { theme: "filled_black", size: "large", shape: "pill", width: 250 });
    }
}

function handleCredentialResponse(response) {
    try {
        // Декодируем payload JWT токена аккуратно
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const data = JSON.parse(jsonPayload);
        
        // Сохраняем данные
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userAvatar', data.picture);
        
        console.log("Вход выполнен успешно:", data.name);
        
        // Обновляем интерфейс
        updateUI();
        
    } catch (error) {
        console.error("Ошибка при разборе данных Google:", error);
    }
}

// --- РЕДАКТИРОВАНИЕ ПРОФИЛЯ ---
function saveProfileChanges() {
    const newName = document.getElementById('new-name-input').value;
    if (newName.trim() !== "") {
        localStorage.setItem('userName', newName);
        alert("Ник обновлен!");
    }
    updateUI();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => openCropper(e.target.result);
        reader.readAsDataURL(file);
    }
}

// --- ОБРЕЗКА (CROPPER) ---
function openCropper(url) {
    const modal = document.getElementById('cropperModal');
    const image = document.getElementById('image-to-crop');
    modal.style.display = 'block';
    image.src = url;

    if (cropper) cropper.destroy();
    
    image.onload = () => {
        cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1
        });
    };
}

function applyCrop() {
    if (!cropper) {
        console.error("Кроппер не инициализирован!");
        return;
    }

    // Получаем Canvas с обрезанным фото
    const canvas = cropper.getCroppedCanvas({
        width: 250,
        height: 250
    });

    if (canvas) {
        const croppedImage = canvas.toDataURL('image/jpeg'); // Кодируем в строку
        
        // СОХРАНЯЕМ
        localStorage.setItem('userAvatar', croppedImage);
        console.log("Фото сохранено в localStorage");

        // ОБНОВЛЯЕМ ИНТЕРФЕЙС
        updateUI();
        
        // ЗАКРЫВАЕМ
        closeCropper();
        alert("Аватарка успешно обновлена!");
    }
}
function closeCropper() {
    document.getElementById('cropperModal').style.display = 'none';
    if (cropper) cropper.destroy();
}

// --- ИНТЕРФЕЙС ---
function updateUI() {
    // 1. Получаем данные из памяти
    const name = localStorage.getItem('userName');
    const avatar = localStorage.getItem('userAvatar');

    // 2. Ищем элементы на странице
    const nameEl = document.getElementById('display-name');
    const avatarEl = document.getElementById('user-avatar');
    const loginSection = document.getElementById('login-section');
    const logoutSection = document.getElementById('logout-section');

    // 3. Если пользователь авторизован (есть имя в базе)
    if (name) {
        // Обновляем имя
        if (nameEl) nameEl.innerText = name;

        // Обновляем аватарку
        if (avatarEl) {
            if (avatar) {
                // Если есть загруженное фото или фото из Google
                avatarEl.style.backgroundImage = `url('${avatar}')`;
                avatarEl.style.backgroundSize = 'cover';
                avatarEl.style.backgroundPosition = 'center';
                avatarEl.innerText = ""; // Убираем текст (например, "Login"), если он был внутри
            } else {
                // Если фото нет, можно поставить цветной круг с первой буквой имени
                avatarEl.style.backgroundColor = '#6200ff';
                avatarEl.innerText = name.charAt(0).toUpperCase();
            }
        }

        // Переключаем блоки: скрываем "Войти", показываем "Настройки/Выход"
        if (loginSection) loginSection.style.display = 'none';
        if (logoutSection) logoutSection.style.display = 'block';

    } else {
        // 4. Если пользователь НЕ авторизован
        if (nameEl) nameEl.innerText = "Гость";
        if (avatarEl) {
            avatarEl.style.backgroundImage = "none";
            avatarEl.style.backgroundColor = "#333";
            avatarEl.innerText = "?";
        }

        // Показываем блок входа, скрываем блок настроек
        if (loginSection) loginSection.style.display = 'block';
        if (logoutSection) logoutSection.style.display = 'none';
    }
}


function logout() {
    localStorage.clear();
    location.reload();
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal();
        closeCropper();
    }
}
const animeData = [
    {
        id: 1,
        title: "Человек-бензопила",
        image: "https://shikimori.one/system/animes/original/44511.jpg",
        rating: "8.5",
        genre: "Экшен, Демоны",
        description: "Дэндзи — подросток, живущий в нищете и охотящийся на демонов...",
        episodes: [
            { id: 1, title: "Серия 1", url: "BAACAgIAAxkBAAMCaYyHnKQnEItQoc1F7OmcxFs2BiIAAnmSAALVn_lLoXcYLPtCxVU6BA" } // Вместо пути пишем ID из бота
        ]
    },
    {
        id: 2,
        title: "Магическая битва 3",
        image: "https://shiki.one/uploads/poster/animes/57658/7fd0d0760734513d62189ff53015546d.jpeg",
        rating: "8.7",
        genre: "Сёнэн, Ужасы",
        description: "Всё начинается в канун Дня всех святых...",
        episodes: [
            { id: 1, title: "Серия 4", url: "https://storage.googleapis.com/draftstudiolib/%D0%A1%D0%B5%D1%80%D0%B8%D1%8F_4_dub.mp4" } // Старые файлы тоже будут работать
        ]
    }
];


function renderAnime() {
    const container = document.getElementById('anime-container');
    if (!container) return;

    // Очищаем контейнер перед отрисовкой
    container.innerHTML = animeData.map(anime => `
        <div class="anime-card" onclick="openAnimePage(${anime.id})">
            <img src="${anime.image}" alt="${anime.title}">
            <div class="anime-info">
                <h3>${anime.title}</h3>
                <div class="rating">⭐ ${anime.rating}</div>
            </div>
        </div>
    `).join('');
}
function openAnimePage(animeId) {
    const anime = animeData.find(a => a.id === animeId);
    const container = document.querySelector('.main-content'); 

    if (!anime || !container) return;

    container.innerHTML = `
        <div class="anime-page">
            <button onclick="location.reload()" class="back-btn">← Назад в каталог</button>
            <div class="anime-header">
                <img src="${anime.image}" class="anime-poster">
                <div class="anime-details">
                    <h1>${anime.title}</h1>
                    <p class="genre"><b>Жанры:</b> ${anime.genre}</p>
                    <p class="desc">${anime.description}</p>
                </div>
            </div>

            <div class="player-section">
                <div class="video-wrapper paused" id="wrapper">
                    <div class="play-overlay"></div>
                    <video id="main-player" poster="${anime.image}">
                        <source id="video-src" src="${anime.episodes[0].url}" type="video/mp4">
                    </video>
                    <div class="video-controls">
                        <button class="control-btn" onclick="togglePlay()">
                            <div class="play-icon"></div>
                        </button>
                        <div class="progress-area" id="progress-area">
                            <div class="progress-bar" id="main-progress-bar"></div>
                        </div>
                        <div class="time-display">
                            <span id="current-time">00:00</span> / <span id="duration">00:00</span>
                        </div>
                        <button class="control-btn" onclick="toggleFullscreen()">
                            <div class="fullscreen-icon"></div>
                        </button>
                    </div>
                </div>
            </div>

            <div class="episode-list">
                <h3>Выберите серию:</h3>
                <div class="episodes-grid">
                    ${anime.episodes.map(ep => `
                        <button class="ep-btn ${ep.id === 1 ? 'active-ep' : ''}" 
                                onclick="changeEpisode('${ep.url}', this)">
                            ${ep.id}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    window.scrollTo(0, 0);
    initPlayerEvents(); // Запускаем события ОДИН раз
}


    const player = document.getElementById('main-player');
    const progressArea = document.getElementById('progress-area');
    const wrapper = document.getElementById('wrapper');

    if (player) {
        player.ontimeupdate = updateProgressBar;
        player.onloadedmetadata = updateProgressBar;
        player.ondblclick = toggleFullscreen;
        player.onpause = () => {
            if (typeof hideTimeout !== 'undefined') clearTimeout(hideTimeout);
            wrapper.classList.remove('hide-controls');
        };
    }

    if (progressArea) {
        
    }

    if (wrapper) {
        wrapper.onmousemove = resetTimer;
        wrapper.onclick = function(e) {
            if (e.target.id === 'main-player' || e.target.classList.contains('play-overlay')) {
                togglePlay();
            }
            resetTimer();
        };
    }



function changeEpisode(url, btn) {
    const player = document.getElementById('main-player');
    const source = document.getElementById('video-src');
    
    if (player && source) {
        document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active-ep'));
        btn.classList.add('active-ep');

        // Если это file_id (нет точки или слэша), идем через наш PHP
        if (!url.includes('.') && !url.includes('/')) {
            source.src = `stream.php?file_id=${url}`;
        } else {
            source.src = url; // Обычный путь к файлу
        }

        player.load();
        player.play();
        
        const wrapper = document.getElementById('wrapper');
        if (wrapper) wrapper.classList.remove('paused');
    }
}

function openVideo(title, url) {
    document.getElementById('video-title').innerText = title;
    document.getElementById('anime-player').src = url;
    document.getElementById('videoModal').style.display = 'block';
}

function closeVideo() {
    document.getElementById('videoModal').style.display = 'none';
    document.getElementById('anime-player').src = ""; // Останавливаем видео при закрытии
}
// Функция переключения Play/Pause при клике на видео или обертку
function togglePlay() {
    const player = document.getElementById('main-player');
    const wrapper = document.getElementById('wrapper');
    if (!player || !wrapper) return;

    if (player.paused) {
        player.play();
        wrapper.classList.remove('paused');
    } else {
        player.pause();
        wrapper.classList.add('paused');
    }
}

// Слушатель событий для видео (чтобы кнопка появлялась, если видео само закончилось)
document.addEventListener('ended', function(e) {
    if (e.target.id === 'main-player') {
        const wrapper = document.getElementById('wrapper');
        if (wrapper) wrapper.classList.add('paused');
    }
}, true);
// Вызываем отрисовку при загрузке
document.addEventListener('DOMContentLoaded', () => {
    renderAnime();
    updateUI();
});
// Функция обновления прогресса
function updateProgressBar() {
    const player = document.getElementById('main-player');
    const progressBar = document.getElementById('main-progress-bar');
    const currentT = document.getElementById('current-time');
    const durationT = document.getElementById('duration');

    if (!player || isNaN(player.duration)) return;

    if (progressBar && !isDragging) {
        const percent = (player.currentTime / player.duration) * 100;
        progressBar.style.width = (percent || 0) + "%";
    }
    
    if (currentT) currentT.innerText = formatTime(player.currentTime);
    if (durationT) durationT.innerText = formatTime(player.duration);
}
// Перемотка кликом

function resetTimer() {
    const wrapper = document.getElementById('wrapper');
    const player = document.getElementById('main-player');
    if (!wrapper) return;

    wrapper.classList.remove('hide-controls');
    clearTimeout(hideTimeout);

    if (player && !player.paused && !isDragging) {
        hideTimeout = setTimeout(() => {
            wrapper.classList.add('hide-controls');
        }, 3000);
    }
}
// Привязываем события (добавь это внутрь openAnimePage после container.innerHTML = ...)
// Переменная для отслеживания зажата ли мышь (вынеси в начало файла к остальным let)

function initPlayerEvents() {
    const player = document.getElementById('main-player');
    const progressArea = document.getElementById('progress-area');
    const progressBar = document.getElementById('main-progress-bar');
    const wrapper = document.getElementById('wrapper');

    if (!player || !progressArea || !progressBar || !wrapper) return;

    // Перемотка
    const moveProgress = (e) => {
        const rect = progressArea.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        progressBar.style.width = (pos * 100) + "%";
        player.currentTime = pos * player.duration;
    };

    progressArea.onmousedown = (e) => {
        isDragging = true;
        isPausedBeforeDrag = player.paused;
        player.pause();
        moveProgress(e);
        document.body.style.userSelect = 'none';
    };

    window.onmousemove = (e) => {
        if (isDragging) moveProgress(e);
        // Проверка для GUI: если мышь над плеером
        if (e.target.closest('#wrapper')) resetTimer();
    };

    window.onmouseup = () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = 'auto';
            if (!isPausedBeforeDrag) player.play();
            resetTimer();
        }
    };

    // События самого плеера
    player.ontimeupdate = updateProgressBar;
    player.onloadedmetadata = updateProgressBar;
    player.ondblclick = toggleFullscreen;

    wrapper.onclick = (e) => {
        if (e.target.id === 'main-player' || e.target.classList.contains('play-overlay')) {
            togglePlay();
        }
        resetTimer();
    };

    resetTimer(); // Показать GUI при загрузке
    const handleKeyPress = (e) => {
        // Если фокус в поле ввода (например, меняем ник), не мешаем печатать
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault(); // Чтобы страница не прыгала вниз
                togglePlay();
                break;
            case 'ArrowRight':
                player.currentTime = Math.min(player.duration, player.currentTime + 5);
                resetTimer(); // Показываем GUI при перемотке
                break;
            case 'ArrowLeft':
                player.currentTime = Math.max(0, player.currentTime - 5);
                resetTimer();
                break;
            case 'KeyF':
                toggleFullscreen();
                break;
            case 'KeyM':
                player.muted = !player.muted;
                break;
        }
    };

    // Вешаем один слушатель на документ
    document.addEventListener('keydown', handleKeyPress);
}

// Функция полного экрана
function toggleFullscreen() {
    const wrapper = document.getElementById('wrapper');
    if (!document.fullscreenElement) {
        wrapper.requestFullscreen?.() || wrapper.webkitRequestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', () => {
    renderAnime();
    updateUI();
});
function togglePlay() {
    const player = document.getElementById('main-player');
    const wrapper = document.getElementById('wrapper');
    if (!player || !wrapper) return;

    if (player.paused) {
        player.play();
        wrapper.classList.remove('paused');
    } else {
        player.pause();
        wrapper.classList.add('paused');
        resetTimer(); // Показать GUI при паузе
    }
}
function formatTime(time) {
    if (isNaN(time) || time === Infinity) return "00:00";
    let min = Math.floor(time / 60);
    let sec = Math.floor(time % 60);
    return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
}
// Обновим togglePlay, чтобы менять иконку кнопки (опционально)
// Но пока оставим старую, она отлично работает с центральным кругом
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('anime-search');
    const notFoundMessage = document.getElementById('not-found');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const filter = searchInput.value.toLowerCase();
            const cards = document.querySelectorAll('.anime-card');
            let hasVisibleCards = false; // Флаг: нашли ли мы хоть одну карточку

            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                
                if (title.includes(filter)) {
                    card.style.display = "";
                    hasVisibleCards = true; // Нашли совпадение!
                } else {
                    card.style.display = "none";
                }
            });

            // Если совпадений нет — показываем надпись, если есть — скрываем
            if (hasVisibleCards) {
                notFoundMessage.style.display = "none";
            } else {
                notFoundMessage.style.display = "block";
            }
        });
    }
});