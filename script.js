document.addEventListener('DOMContentLoaded', () => {
    console.log('Foro LaLiga loaded');

    // --- DATA ---
    const primeraTeams = [
        { name: "Athletic Club", id: 621 },
        { name: "Atlético de Madrid", id: 13 },
        { name: "CA Osasuna", id: 331 },
        { name: "Celta de Vigo", id: 940 },
        { name: "Deportivo Alavés", id: 1108 },
        { name: "Elche CF", id: 1531 },
        { name: "FC Barcelona", id: 131 },
        { name: "Getafe CF", id: 3709 },
        { name: "Girona FC", id: 12321 },
        { name: "Levante UD", id: 3368 },
        { name: "Rayo Vallecano", id: 367 },
        { name: "RCD Espanyol", id: 714 },
        { name: "RCD Mallorca", id: 237 },
        { name: "Real Betis Balompié", id: 150 },
        { name: "Real Madrid CF", id: 418 },
        { name: "Real Oviedo", id: 2497 },
        { name: "Real Sociedad", id: 681 },
        { name: "Sevilla FC", id: 368 },
        { name: "Valencia CF", id: 1049 },
        { name: "Villarreal CF", id: 1050 }
    ].map(t => ({ ...t, logo: `https://tmssl.akamaized.net/images/wappen/head/${t.id}.png` }));

    const segundaTeams = [
        { name: "Albacete Balompié", id: 1532 },
        { name: "AD Ceuta FC", id: 8568 },
        { name: "Real Racing Club", id: 630 },
        { name: "UD Almería", id: 3302 },
        { name: "Córdoba CF", id: 993 },
        { name: "Real Sociedad B", id: 9899 },
        { name: "FC Andorra", id: 10718 },
        { name: "Cultural Leonesa", id: 4542 },
        { name: "Real Sporting de Gijón", id: 2448 },
        { name: "Burgos CF", id: 1536 },
        { name: "RC Deportivo", id: 897 },
        { name: "Real Valladolid CF", id: 366 },
        { name: "Cádiz CF", id: 2687 },
        { name: "SD Eibar", id: 1533 },
        { name: "Real Zaragoza", id: 142 },
        { name: "CD Castellón", id: 2502 },
        { name: "Granada CF", id: 16795 },
        { name: "UD Las Palmas", id: 472 },
        { name: "CD Leganés", id: 1244 },
        { name: "SD Huesca", id: 5358 },
        { name: "Málaga CF", id: 1084 },
        { name: "CD Mirandés", id: 13222 }
    ].map(t => ({ ...t, logo: `https://tmssl.akamaized.net/images/wappen/head/${t.id}.png` }));


    // --- POPULATE REGISTRATION DROPDOWN ---
    // All teams combined for registration (sorted alphabetically)
    const allTeams = [...primeraTeams, ...segundaTeams].sort((a, b) => a.name.localeCompare(b.name));

    // --- VIEW SWITCHING ---
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = {
        'forum-view': document.getElementById('forum-view'),
        'chat-view': document.getElementById('chat-view')
    };

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            // Update buttons
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update views
            Object.keys(views).forEach(key => {
                if (key === targetId) {
                    views[key].classList.remove('hidden');
                } else {
                    views[key].classList.add('hidden');
                }
            });
        });
    });


    // --- DROPDOWNS (FORUM) ---
    function setupDropdown(elementId, teams, hiddenInputId = null) {
        const selectElement = document.getElementById(elementId);
        if (!selectElement) return;

        const optionsList = selectElement.querySelector('.options-list');
        const selectedSpan = selectElement.querySelector('.selected-option');
        const searchInput = selectElement.querySelector('.search-input');
        const hiddenInput = hiddenInputId ? document.getElementById(hiddenInputId) : null;

        function renderOptions(filter = "") {
            const existingOptions = optionsList.querySelectorAll('.option-item');
            existingOptions.forEach(opt => opt.remove());

            const filteredTeams = teams.filter(team =>
                team.name.toLowerCase().includes(filter.toLowerCase())
            );

            filteredTeams.forEach(team => {
                const div = document.createElement('div');
                div.className = 'option-item';

                const img = document.createElement('img');
                img.src = team.logo;
                img.alt = team.name;
                img.className = 'team-logo-sm';

                const span = document.createElement('span');
                span.textContent = team.name;

                div.appendChild(img);
                div.appendChild(span);

                div.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedSpan.innerHTML = '';
                    const selectedImg = document.createElement('img');
                    selectedImg.src = team.logo;
                    selectedImg.className = 'team-logo-sm';
                    selectedSpan.appendChild(selectedImg);
                    selectedSpan.appendChild(document.createTextNode(team.name));

                    selectedSpan.style.color = '#fff';
                    optionsList.classList.add('hidden');
                    selectElement.style.borderColor = '#334155';

                    // Update hidden input if provided
                    if (hiddenInput) {
                        hiddenInput.value = team.name;
                    }
                });
                optionsList.appendChild(div);
            });
        }

        renderOptions();

        if (searchInput) {
            searchInput.addEventListener('input', (e) => renderOptions(e.target.value));
            searchInput.addEventListener('click', (e) => e.stopPropagation());
        }

        selectElement.addEventListener('click', () => {
            const isHidden = optionsList.classList.contains('hidden');
            document.querySelectorAll('.options-list').forEach(list => {
                if (list !== optionsList) list.classList.add('hidden');
            });
            document.querySelectorAll('.custom-select').forEach(sel => {
                if (sel !== selectElement) sel.style.borderColor = '#334155';
            });

            if (isHidden) {
                optionsList.classList.remove('hidden');
                selectElement.style.borderColor = '#3b82f6';
                if (searchInput) searchInput.focus();
            } else {
                optionsList.classList.add('hidden');
                selectElement.style.borderColor = '#334155';
            }
        });
    }

    setupDropdown('primera-select', primeraTeams);
    setupDropdown('segunda-select', segundaTeams);

    // Setup registration team dropdown
    setupDropdown('reg-team-select', allTeams, 'reg-team-value');

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.options-list').forEach(list => list.classList.add('hidden'));
            document.querySelectorAll('.custom-select').forEach(sel => sel.style.borderColor = '#334155');
        }
    });


    // --- CHAT LOGIC ---
    const chatRoomsPrimera = document.getElementById('chat-rooms-primera');
    const chatRoomsSegunda = document.getElementById('chat-rooms-segunda');
    const currentRoomName = document.getElementById('current-room-name');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    // Helper to create room item
    function createRoomItem(team) {
        const div = document.createElement('div');
        div.className = 'room-item';
        div.setAttribute('data-room', team.name);

        const img = document.createElement('img');
        img.src = team.logo;
        img.alt = team.name;
        img.className = 'team-logo-sm';

        const span = document.createElement('span');
        span.textContent = team.name;

        div.appendChild(img);
        div.appendChild(span);

        div.addEventListener('click', () => switchRoom(div, team.name));
        return div;
    }

    // Populate Chat Rooms
    if (chatRoomsPrimera) {
        primeraTeams.forEach(team => {
            chatRoomsPrimera.appendChild(createRoomItem(team));
        });
    }
    if (chatRoomsSegunda) {
        segundaTeams.forEach(team => {
            chatRoomsSegunda.appendChild(createRoomItem(team));
        });
    }

    // General rooms listeners
    document.querySelectorAll('.chat-category .room-item').forEach(item => {
        if (!item.parentElement.id.includes('chat-rooms')) {
            item.addEventListener('click', () => {
                const roomName = item.textContent.trim();
                switchRoom(item, roomName);
            });
        }
    });

    let currentRoom = null;
    const chatInputContainer = document.getElementById('chat-input-container');

    async function loadMessages(roomName) {
        try {
            const response = await fetch(`/api/messages/${encodeURIComponent(roomName)}`);
            const messages = await response.json();

            chatMessages.innerHTML = `
                <div class="message system-message">
                    Has entrado a la sala: ${roomName}
                </div>
            `;

            const savedUser = localStorage.getItem('forolaliga_user');
            const currentUsername = savedUser ? JSON.parse(savedUser).username : null;

            messages.forEach(msg => {
                const msgDiv = document.createElement('div');
                const isSent = msg.username === currentUsername;
                msgDiv.className = isSent ? 'message message-sent' : 'message message-received';

                // Get avatar HTML using favorite_team from API
                const avatarHtml = getAvatarHtml(msg.username, msg.favorite_team, 'avatar-chat');

                msgDiv.innerHTML = `
                    <div class="chat-message-content">
                        ${!isSent ? avatarHtml : ''}
                        <div class="message-bubble">
                            <span class="message-author">@${msg.username}</span>
                            <span class="message-text">${escapeHtml(msg.content)}</span>
                        </div>
                        ${isSent ? avatarHtml : ''}
                    </div>
                `;
                chatMessages.appendChild(msgDiv);
            });

            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    function switchRoom(element, roomName) {
        // Update active state
        document.querySelectorAll('.room-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

        // Update header
        currentRoomName.textContent = roomName;
        currentRoom = roomName;

        // Show chat input area
        if (chatInputContainer) {
            chatInputContainer.classList.remove('hidden');
        }

        // Load messages from API
        loadMessages(roomName);
    }

    // Send Message
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const savedUser = localStorage.getItem('forolaliga_user');
        if (!savedUser) {
            alert('Debes iniciar sesión para enviar mensajes');
            return;
        }

        const user = JSON.parse(savedUser);

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room: currentRoom,
                    username: user.username,
                    content: text
                })
            });

            if (response.ok) {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'message message-sent';
                msgDiv.innerHTML = `<strong>${user.username}:</strong> ${text}`;
                chatMessages.appendChild(msgDiv);
                messageInput.value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                alert('Error al enviar mensaje');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el servidor');
        }
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // --- AUTO-REFRESH MESSAGES (POLLING) ---
    let lastMessageId = 0;

    async function refreshMessages() {
        if (!currentRoom) return;

        try {
            const response = await fetch(`/api/messages/${encodeURIComponent(currentRoom)}`);
            const messages = await response.json();

            if (messages.length > 0) {
                const latestId = Math.max(...messages.map(m => m.id));

                // Only update if there are new messages
                if (latestId > lastMessageId) {
                    lastMessageId = latestId;

                    const savedUser = localStorage.getItem('forolaliga_user');
                    const currentUsername = savedUser ? JSON.parse(savedUser).username : null;

                    chatMessages.innerHTML = `
                        <div class="message system-message">
                            Has entrado a la sala: ${currentRoom}
                        </div>
                    `;

                    messages.forEach(msg => {
                        const msgDiv = document.createElement('div');
                        const isSent = msg.username === currentUsername;
                        msgDiv.className = isSent ? 'message message-sent' : 'message message-received';

                        // Get avatar HTML using favorite_team from API
                        const avatarHtml = getAvatarHtml(msg.username, msg.favorite_team, 'avatar-chat');

                        msgDiv.innerHTML = `
                            <div class="chat-message-content">
                                ${!isSent ? avatarHtml : ''}
                                <div class="message-bubble">
                                    <span class="message-author">@${msg.username}</span>
                                    <span class="message-text">${escapeHtml(msg.content)}</span>
                                </div>
                                ${isSent ? avatarHtml : ''}
                            </div>
                        `;
                        chatMessages.appendChild(msgDiv);
                    });

                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }
        } catch (error) {
            // Silent fail for polling
        }
    }

    // Poll for new messages every 3 seconds
    setInterval(refreshMessages, 3000);

    // --- MODAL LOGIC ---
    const loginBtn = document.querySelector('.login-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // --- SESSION PERSISTENCE ---
    function updateLoginUI(user) {
        if (loginBtn) {
            loginBtn.textContent = user.username;
            loginBtn.classList.add('logged-in');
        }
    }

    function logout() {
        localStorage.removeItem('forolaliga_user');
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.classList.remove('logged-in');
        }
    }

    // Check for existing session on page load
    const savedUser = localStorage.getItem('forolaliga_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            updateLoginUI(user);
        } catch (e) {
            localStorage.removeItem('forolaliga_user');
        }
    }

    function closeAllModals() {
        loginModal.classList.add('hidden');
        registerModal.classList.add('hidden');
    }

    if (loginBtn && loginModal && registerModal) {
        // Open Login or Logout
        loginBtn.addEventListener('click', () => {
            if (loginBtn.classList.contains('logged-in')) {
                // If logged in, clicking logs out
                if (confirm('¿Cerrar sesión?')) {
                    logout();
                }
            } else {
                loginModal.classList.remove('hidden');
            }
        });

        // Close Buttons
        closeModals.forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });

        // Close on backdrop click
        window.addEventListener('click', (e) => {
            if (e.target === loginModal || e.target === registerModal) {
                closeAllModals();
            }
        });

        // Switch to Register
        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                loginModal.classList.add('hidden');
                registerModal.classList.remove('hidden');
            });
        }

        // Switch to Login
        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                registerModal.classList.add('hidden');
                loginModal.classList.remove('hidden');
            });
        }

        // Login Form Submission
        const loginForm = document.querySelector('.login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                try {
                    const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const data = await response.json();

                    if (response.ok) {
                        alert('Login exitoso: ' + data.user.username);
                        closeAllModals();
                        // Save to localStorage
                        localStorage.setItem('forolaliga_user', JSON.stringify(data.user));
                        // Update UI to show logged in state
                        updateLoginUI(data.user);
                    } else {
                        alert('Error: ' + data.error);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión con el servidor');
                }
            });
        }

        // Register Form Submission
        const registerForm = document.querySelector('.register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('reg-username').value;
                const password = document.getElementById('reg-password').value;
                const confirmPassword = document.getElementById('reg-confirm-password').value;
                const favoriteTeam = document.getElementById('reg-team-value').value;

                if (password !== confirmPassword) {
                    alert('Las contraseñas no coinciden');
                    return;
                }

                try {
                    const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password, favoriteTeam })
                    });
                    const data = await response.json();

                    if (response.ok) {
                        alert('Registro exitoso! Ahora puedes iniciar sesión.');
                        // Switch to login
                        registerModal.classList.add('hidden');
                        loginModal.classList.remove('hidden');
                    } else {
                        alert('Error: ' + data.error);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión con el servidor');
                }
            });
        }
    }

    // --- TOPICS LOGIC ---
    const topicsContainer = document.getElementById('topics-container');
    const newTopicBtn = document.getElementById('new-topic-btn');
    const topicModal = document.getElementById('topic-modal');
    const topicForm = document.getElementById('topic-form');

    // Setup topic team dropdown
    setupDropdown('topic-team-select', allTeams, 'topic-team-value');

    // Load topics on page load
    async function loadTopics() {
        if (!topicsContainer) return;

        try {
            const response = await fetch('/api/topics');
            const topics = await response.json();

            if (topics.length === 0) {
                topicsContainer.innerHTML = `
                    <div class="empty-topics">
                        <i class="fa-solid fa-comments"></i>
                        <p>No hay temas todavía. ¡Sé el primero en crear uno!</p>
                    </div>
                `;
                return;
            }

            topicsContainer.innerHTML = '';
            topics.forEach(topic => {
                const card = createTopicCard(topic);
                topicsContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading topics:', error);
            topicsContainer.innerHTML = `
                <div class="empty-topics">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    <p>Error al cargar los temas. Inicia el servidor.</p>
                </div>
            `;
        }
    }

    function createTopicCard(topic) {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.style.cursor = 'pointer';

        const timeAgo = getTimeAgo(new Date(topic.created_at));
        const categoryLabel = {
            'primera': 'Primera',
            'segunda': 'Segunda',
            'fichajes': 'Fichajes',
            'general': 'General'
        }[topic.category] || topic.category;

        // Find team logo if team is specified for the topic
        let teamBadge = '';
        if (topic.team) {
            const team = allTeams.find(t => t.name === topic.team);
            if (team) {
                teamBadge = `<div class="topic-team-badge">
                    <img src="${team.logo}" alt="${team.name}" class="team-logo-sm" title="${team.name}">
                </div>`;
            }
        }

        // Get avatar based on author's favorite team
        const avatarHtml = getAvatarHtml(topic.username, topic.author_favorite_team);

        card.innerHTML = `
            <div class="topic-header">
                ${avatarHtml}
                <div class="topic-meta">
                    <span class="tag tag-${topic.category}">${categoryLabel}</span>
                    ${topic.team ? `<span class="team-tag">${topic.team}</span>` : ''}
                    <span class="time">· ${timeAgo}</span>
                </div>
                ${teamBadge}
            </div>
            <h3 class="topic-title">${escapeHtml(topic.title)}</h3>
            <p class="topic-excerpt">${escapeHtml(topic.content.substring(0, 150))}${topic.content.length > 150 ? '...' : ''}</p>
            <div class="topic-footer">
                <div class="topic-stats">
                    <span class="stat"><i class="fa-regular fa-comment"></i> ${topic.replies || 0}</span>
                    <span class="stat"><i class="fa-regular fa-eye"></i> ${topic.views || 0}</span>
                </div>
                <span class="username">@${escapeHtml(topic.username)}</span>
            </div>
        `;

        // Make card clickable to open topic detail
        card.addEventListener('click', () => openTopicDetail(topic.id));

        return card;
    }

    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'hace un momento';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `hace ${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `hace ${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `hace ${days}d`;
        return date.toLocaleDateString('es-ES');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Helper function to get user avatar (team logo or initial)
    function getAvatarHtml(username, favoriteTeam, sizeClass = '') {
        if (favoriteTeam) {
            const team = allTeams.find(t => t.name === favoriteTeam);
            if (team) {
                return `<div class="user-avatar ${sizeClass}" title="${favoriteTeam}">
                    <img src="${team.logo}" alt="${favoriteTeam}" class="avatar-team-logo">
                </div>`;
            }
        }
        // Fallback to initial
        const initial = username ? username.charAt(0).toUpperCase() : '?';
        return `<div class="user-avatar ${sizeClass}">${initial}</div>`;
    }

    // New Topic Button
    if (newTopicBtn && topicModal) {
        newTopicBtn.addEventListener('click', () => {
            const savedUser = localStorage.getItem('forolaliga_user');
            if (!savedUser) {
                alert('Debes iniciar sesión para crear un tema');
                loginModal.classList.remove('hidden');
                return;
            }
            topicModal.classList.remove('hidden');
        });

        // Close topic modal
        const topicCloseBtn = topicModal.querySelector('.close-modal');
        if (topicCloseBtn) {
            topicCloseBtn.addEventListener('click', () => {
                topicModal.classList.add('hidden');
            });
        }

        // Close on backdrop click
        topicModal.addEventListener('click', (e) => {
            if (e.target === topicModal) {
                topicModal.classList.add('hidden');
            }
        });
    }

    // Topic Form Submission
    if (topicForm) {
        topicForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const savedUser = localStorage.getItem('forolaliga_user');
            if (!savedUser) {
                alert('Debes iniciar sesión para crear un tema');
                return;
            }

            const user = JSON.parse(savedUser);
            const title = document.getElementById('topic-title').value.trim();
            const content = document.getElementById('topic-content').value.trim();
            const category = document.getElementById('topic-category').value;
            const team = document.getElementById('topic-team-value').value || null;

            if (!title || !content || !category) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            try {
                const response = await fetch('/api/topics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        content,
                        category,
                        team,
                        username: user.username
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('¡Tema creado exitosamente!');
                    topicModal.classList.add('hidden');
                    topicForm.reset();
                    // Reset team dropdown
                    const teamSpan = document.querySelector('#topic-team-select .selected-option');
                    if (teamSpan) teamSpan.textContent = 'Seleccionar equipo';
                    document.getElementById('topic-team-value').value = '';
                    // Reload topics
                    loadTopics();
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión con el servidor');
            }
        });
    }

    // --- TOPIC DETAIL & REPLIES LOGIC ---
    const topicDetailModal = document.getElementById('topic-detail-modal');
    const topicDetailContent = document.getElementById('topic-detail-content');
    const repliesContainer = document.getElementById('replies-container');
    const replyForm = document.getElementById('reply-form');
    const loginToReply = document.getElementById('login-to-reply');
    let currentTopicId = null;

    async function openTopicDetail(topicId) {
        if (!topicDetailModal) return;
        currentTopicId = topicId;

        try {
            // Fetch topic details
            const topicResponse = await fetch(`/api/topics/${topicId}`);
            const topic = await topicResponse.json();

            // Find team logo
            let teamBadge = '';
            if (topic.team) {
                const team = allTeams.find(t => t.name === topic.team);
                if (team) {
                    teamBadge = `<img src="${team.logo}" alt="${team.name}" class="topic-detail-team-logo" title="${team.name}">`;
                }
            }

            const categoryLabel = {
                'primera': 'Primera',
                'segunda': 'Segunda',
                'fichajes': 'Fichajes',
                'general': 'General'
            }[topic.category] || topic.category;

            topicDetailContent.innerHTML = `
                <div class="topic-detail-header">
                    ${teamBadge}
                    <div class="topic-detail-info">
                        <span class="tag tag-${topic.category}">${categoryLabel}</span>
                        ${topic.team ? `<span class="team-tag">${topic.team}</span>` : ''}
                        <span class="topic-detail-author">por @${escapeHtml(topic.username)}</span>
                        <span class="topic-detail-time">${getTimeAgo(new Date(topic.created_at))}</span>
                    </div>
                </div>
                <h2 class="topic-detail-title">${escapeHtml(topic.title)}</h2>
                <div class="topic-detail-body">${escapeHtml(topic.content)}</div>
                <div class="topic-detail-stats">
                    <span><i class="fa-regular fa-eye"></i> ${topic.views} visualizaciones</span>
                    <span><i class="fa-regular fa-comment"></i> ${topic.replies} respuestas</span>
                </div>
            `;

            // Load replies
            await loadReplies(topicId);

            // Show/hide reply form based on login status
            const savedUser = localStorage.getItem('forolaliga_user');
            if (savedUser) {
                replyForm.classList.remove('hidden');
                loginToReply.classList.add('hidden');
            } else {
                replyForm.classList.add('hidden');
                loginToReply.classList.remove('hidden');
            }

            topicDetailModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading topic:', error);
            alert('Error al cargar el tema');
        }
    }

    async function loadReplies(topicId) {
        try {
            const response = await fetch(`/api/topics/${topicId}/replies`);
            const replies = await response.json();

            if (replies.length === 0) {
                repliesContainer.innerHTML = '<p class="no-replies">No hay respuestas todavía. ¡Sé el primero en responder!</p>';
                return;
            }

            repliesContainer.innerHTML = '';
            replies.forEach(reply => {
                const replyDiv = document.createElement('div');
                replyDiv.className = 'reply-item';

                // Use avatar with team logo
                const avatarHtml = getAvatarHtml(reply.username, reply.favorite_team, 'user-avatar-sm');

                replyDiv.innerHTML = `
                    <div class="reply-header">
                        ${avatarHtml}
                        <span class="reply-username">@${escapeHtml(reply.username)}</span>
                        <span class="reply-time">${getTimeAgo(new Date(reply.created_at))}</span>
                    </div>
                    <div class="reply-content">${escapeHtml(reply.content)}</div>
                `;
                repliesContainer.appendChild(replyDiv);
            });
        } catch (error) {
            console.error('Error loading replies:', error);
            repliesContainer.innerHTML = '<p class="no-replies">Error al cargar las respuestas</p>';
        }
    }

    // Reply form submission
    if (replyForm) {
        replyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const savedUser = localStorage.getItem('forolaliga_user');
            if (!savedUser) {
                alert('Debes iniciar sesión para responder');
                return;
            }

            const user = JSON.parse(savedUser);
            const content = document.getElementById('reply-content').value.trim();

            if (!content) {
                alert('Escribe una respuesta');
                return;
            }

            try {
                const response = await fetch('/api/replies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topicId: currentTopicId,
                        username: user.username,
                        content
                    })
                });

                if (response.ok) {
                    document.getElementById('reply-content').value = '';
                    await loadReplies(currentTopicId);
                    // Also reload topics to update reply count
                    loadTopics();
                } else {
                    const data = await response.json();
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión con el servidor');
            }
        });
    }

    // Close topic detail modal
    if (topicDetailModal) {
        const closeBtn = topicDetailModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                topicDetailModal.classList.add('hidden');
            });
        }

        topicDetailModal.addEventListener('click', (e) => {
            if (e.target === topicDetailModal) {
                topicDetailModal.classList.add('hidden');
            }
        });
    }

    // Load topics on page load
    loadTopics();
});
