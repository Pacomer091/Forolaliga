document.addEventListener('DOMContentLoaded', () => {
    console.log('Foro LaLiga loaded');
    const socket = typeof io !== 'undefined' ? io() : null;

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

    const allTeams = [...primeraTeams, ...segundaTeams].sort((a, b) => a.name.localeCompare(b.name));

    const teamColors = {
        "Athletic Club": { primary: "#EE2523", hover: "#C71F1D" },
        "Atlético de Madrid": { primary: "#CB3524", hover: "#A62B1D" },
        "CA Osasuna": { primary: "#C1282D", hover: "#9D1E22" },
        "Celta de Vigo": { primary: "#85B6DE", hover: "#6F9BBF" },
        "Deportivo Alavés": { primary: "#005CAB", hover: "#004B8A" },
        "Elche CF": { primary: "#00874C", hover: "#006E3E" },
        "FC Barcelona": { primary: "#A50044", hover: "#850036" },
        "Getafe CF": { primary: "#005CAB", hover: "#004B8A" },
        "Girona FC": { primary: "#E20613", hover: "#BC0510" },
        "Levante UD": { primary: "#A50044", hover: "#850036" },
        "Rayo Vallecano": { primary: "#E20613", hover: "#BC0510" },
        "RCD Espanyol": { primary: "#008ED4", hover: "#0073AD" },
        "RCD Mallorca": { primary: "#E20613", hover: "#BC0510" },
        "Real Betis Balompié": { primary: "#00933B", hover: "#007A31" },
        "Real Madrid CF": { primary: "#3A86FF", hover: "#2667FF" },
        "Real Oviedo": { primary: "#005CAB", hover: "#004B8A" },
        "Real Sociedad": { primary: "#005CAB", hover: "#004B8A" },
        "Sevilla FC": { primary: "#E20613", hover: "#BC0510" },
        "Valencia CF": { primary: "#000000", hover: "#333333" },
        "Villarreal CF": { primary: "#FFE300", hover: "#E6CC00" },
        "Albacete Balompié": { primary: "#E20613", hover: "#BC0510" },
        "AD Ceuta FC": { primary: "#000000", hover: "#333333" },
        "Real Racing Club": { primary: "#00874C", hover: "#006E3E" },
        "UD Almería": { primary: "#E20613", hover: "#BC0510" },
        "Córdoba CF": { primary: "#00874C", hover: "#006E3E" },
        "Real Sociedad B": { primary: "#005CAB", hover: "#004B8A" },
        "FC Andorra": { primary: "#E20613", hover: "#BC0510" },
        "Cultural Leonesa": { primary: "#E20613", hover: "#BC0510" },
        "Real Sporting de Gijón": { primary: "#E20613", hover: "#BC0510" },
        "Burgos CF": { primary: "#000000", hover: "#333333" },
        "RC Deportivo": { primary: "#005CAB", hover: "#004B8A" },
        "Real Valladolid CF": { primary: "#662D91", hover: "#512474" },
        "Cádiz CF": { primary: "#FFE300", hover: "#E6CC00" },
        "SD Eibar": { primary: "#A50044", hover: "#850036" },
        "Real Zaragoza": { primary: "#005CAB", hover: "#004B8A" },
        "CD Castellón": { primary: "#000000", hover: "#333333" },
        "Granada CF": { primary: "#E20613", hover: "#BC0510" },
        "UD Las Palmas": { primary: "#FFE300", hover: "#E6CC00" },
        "CD Leganés": { primary: "#005CAB", hover: "#004B8A" },
        "SD Huesca": { primary: "#A50044", hover: "#850036" },
        "Málaga CF": { primary: "#85B6DE", hover: "#6F9BBF" },
        "CD Mirandés": { primary: "#E20613", hover: "#BC0510" }
    };

    let currentThemeTeam = null;
    let activeTeamFilter = null;
    let activeSearchQuery = '';

    function applyTeamTheme(teamName) {
        console.log('Applying theme for:', teamName);
        const root = document.documentElement;
        if (!teamName) {
            resetDefaultTheme();
            currentThemeTeam = null;
            return;
        }

        let theme = teamColors[teamName];
        if (!theme) {
            const teamKey = Object.keys(teamColors).find(key =>
                key.toLowerCase() === teamName.toLowerCase() ||
                key.toLowerCase().includes(teamName.toLowerCase()) ||
                teamName.toLowerCase().includes(key.toLowerCase())
            );
            if (teamKey) theme = teamColors[teamKey];
        }

        if (theme) {
            root.style.setProperty('--accent-blue', theme.primary);
            root.style.setProperty('--accent-blue-hover', theme.hover);
            root.style.setProperty('--accent-purple', theme.primary);
            root.style.setProperty('--tag-primera', theme.primary);
            currentThemeTeam = teamName;
        } else {
            resetDefaultTheme();
            currentThemeTeam = null;
        }

        function resetDefaultTheme() {
            root.style.setProperty('--accent-blue', '#3A86FF');
            root.style.setProperty('--accent-blue-hover', '#2667FF');
            root.style.setProperty('--accent-purple', '#8338EC');
            root.style.setProperty('--tag-primera', '#3A86FF');
        }
    }

    function playLoginAnimation(teamName, callback) {
        // OPTIMIZATION: Skip animation if already on this theme
        if (currentThemeTeam && teamName && currentThemeTeam.toLowerCase() === teamName.toLowerCase()) {
            console.log('Already on theme:', teamName, '- Skipping animation.');
            if (callback) callback();
            return;
        }

        const overlay = document.getElementById('login-overlay');
        const logoImg = document.getElementById('overlay-team-logo');
        const overlayContent = document.querySelector('.overlay-content');

        if (!overlay || !logoImg) {
            if (callback) callback();
            return;
        }

        let teamLogoSrc = '';
        let teamColor = '#ffffff';

        if (teamName) {
            const team = allTeams.find(t =>
                t.name === teamName ||
                t.name.toLowerCase().includes(teamName.toLowerCase()) ||
                teamName.toLowerCase().includes(t.name.toLowerCase())
            );
            if (team) teamLogoSrc = team.logo;

            let theme = teamColors[teamName];
            if (!theme) {
                const teamKey = Object.keys(teamColors).find(key =>
                    key.toLowerCase() === teamName.toLowerCase() ||
                    key.toLowerCase().includes(teamName.toLowerCase()) ||
                    teamName.toLowerCase().includes(key.toLowerCase())
                );
                if (teamKey) theme = teamColors[teamKey];
            }
            if (theme) teamColor = theme.primary;
        }

        if (!teamLogoSrc) {
            if (callback) callback();
            return;
        }

        logoImg.src = teamLogoSrc;
        overlay.classList.remove('hidden');
        logoImg.classList.remove('animate-explode');
        logoImg.classList.add('animate-pulse');

        setTimeout(() => {
            logoImg.classList.remove('animate-pulse');
            logoImg.classList.add('animate-explode');

            if (overlayContent) {
                const particleCount = 60;
                for (let i = 0; i < particleCount; i++) {
                    const p = document.createElement('div');
                    p.classList.add('particle', 'animate-particle');
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 150 + Math.random() * 400;
                    const tx = Math.cos(angle) * velocity;
                    const ty = Math.sin(angle) * velocity;
                    p.style.setProperty('--tx', `${tx}px`);
                    p.style.setProperty('--ty', `${ty}px`);
                    p.style.setProperty('--particle-color', teamColor);
                    const size = 6 + Math.random() * 8;
                    p.style.width = `${size}px`;
                    p.style.height = `${size}px`;
                    overlayContent.appendChild(p);
                }
            }

            setTimeout(() => {
                overlay.classList.add('hidden');
                logoImg.classList.remove('animate-explode');
                if (overlayContent) {
                    overlayContent.querySelectorAll('.particle').forEach(p => p.remove());
                }
                if (callback) callback();
            }, 800);
        }, 2500);
    }

    // --- VIEW SWITCHING ---
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = {
        'forum-view': document.getElementById('forum-view'),
        'chat-view': document.getElementById('chat-view')
    };

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            Object.keys(views).forEach(key => {
                if (key === targetId) {
                    views[key].classList.remove('hidden');
                } else {
                    views[key].classList.add('hidden');
                }
            });
        });
    });

    // --- DROPDOWNS ---
    function resetDropdown(elementId) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const span = el.querySelector('.selected-option');
        if (span) {
            span.textContent = 'Seleccionar equipo';
            span.style.color = '';
        }
    }

    function setupDropdown(elementId, teams, hiddenInputId = null, onSelect = null) {
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
                    if (hiddenInput) hiddenInput.value = team.name;
                    if (onSelect) onSelect(team.name);
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
            if (isHidden) {
                optionsList.classList.remove('hidden');
                if (searchInput) searchInput.focus();
            } else {
                optionsList.classList.add('hidden');
            }
        });
    }

    setupDropdown('primera-select', primeraTeams, null, (teamName) => {
        resetDropdown('segunda-select');
        activeTeamFilter = teamName;
        playLoginAnimation(teamName, () => {
            applyTeamTheme(teamName);
            loadTopics();
        });
        const ftc = document.getElementById('favorite-team-filter');
        if (ftc) ftc.classList.remove('active');
    });

    setupDropdown('segunda-select', segundaTeams, null, (teamName) => {
        resetDropdown('primera-select');
        activeTeamFilter = teamName;
        playLoginAnimation(teamName, () => {
            applyTeamTheme(teamName);
            loadTopics();
        });
        const ftc = document.getElementById('favorite-team-filter');
        if (ftc) ftc.classList.remove('active');
    });

    setupDropdown('reg-team-select', allTeams, 'reg-team-value');
    setupDropdown('topic-team-select', allTeams, 'topic-team-value');

    const viewAllLink = document.querySelector('.view-all-link');
    if (viewAllLink) {
        viewAllLink.addEventListener('click', (e) => {
            e.preventDefault();
            resetDropdown('primera-select');
            resetDropdown('segunda-select');
            activeTeamFilter = null;
            activeSearchQuery = '';

            const savedUser = localStorage.getItem('forolaliga_user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                const favoriteTeam = user.favoriteTeam || user.favorite_team;
                if (favoriteTeam) {
                    playLoginAnimation(favoriteTeam, () => {
                        applyTeamTheme(favoriteTeam);
                        loadTopics();
                    });
                } else {
                    applyTeamTheme(null);
                    loadTopics();
                }
            } else {
                applyTeamTheme(null);
                loadTopics();
            }

            const ftc = document.getElementById('favorite-team-filter');
            if (ftc) ftc.classList.remove('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.options-list').forEach(list => list.classList.add('hidden'));
        }
    });

    // --- FAVORITE TEAM LOGIC ---
    function updateFavoriteTeamWidget() {
        try {
            const savedUser = localStorage.getItem('forolaliga_user');
            const favTeamCard = document.getElementById('favorite-team-filter');

            if (savedUser && favTeamCard) {
                const user = JSON.parse(savedUser);
                const favoriteTeam = user.favoriteTeam || user.favorite_team;
                if (favoriteTeam) {
                    const teamData = allTeams.find(t =>
                        t.name === favoriteTeam ||
                        t.name.toLowerCase().includes(favoriteTeam.toLowerCase()) ||
                        favoriteTeam.toLowerCase().includes(t.name.toLowerCase())
                    );
                    if (teamData) {
                        favTeamCard.querySelector('.fav-team-logo').src = teamData.logo;
                        favTeamCard.querySelector('.fav-name').textContent = teamData.name;
                        favTeamCard.classList.remove('hidden');

                        favTeamCard.onclick = () => {
                            resetDropdown('primera-select');
                            resetDropdown('segunda-select');
                            activeTeamFilter = teamData.name;

                            playLoginAnimation(teamData.name, () => {
                                applyTeamTheme(teamData.name);
                                loadTopics();
                            });

                            document.querySelectorAll('.favorite-team-card').forEach(c => c.classList.remove('active'));
                            favTeamCard.classList.add('active');
                        };
                        return;
                    }
                }
            }
            if (favTeamCard) favTeamCard.classList.add('hidden');
        } catch (error) {
            console.error('Error in updateFavoriteTeamWidget:', error);
        }
    }

    updateFavoriteTeamWidget();

    // --- CHAT LOGIC ---
    const chatRoomsPrimera = document.getElementById('chat-rooms-primera');
    const chatRoomsSegunda = document.getElementById('chat-rooms-segunda');
    const currentRoomNameEl = document.getElementById('current-room-name');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const chatInputContainer = document.getElementById('chat-input-container');

    // Mobile rooms toggle
    const roomsToggleBtn = document.getElementById('rooms-toggle-btn');
    const roomsCloseBtn = document.getElementById('rooms-close-btn');
    const chatSidebar = document.querySelector('.chat-sidebar');

    if (roomsToggleBtn && chatSidebar) {
        roomsToggleBtn.addEventListener('click', () => {
            chatSidebar.classList.add('mobile-open');
        });
    }

    if (roomsCloseBtn && chatSidebar) {
        roomsCloseBtn.addEventListener('click', () => {
            chatSidebar.classList.remove('mobile-open');
        });
    }

    // Mobile forum filters toggle
    const filtersToggleBtn = document.getElementById('filters-toggle-btn');
    const filtersCloseBtn = document.getElementById('filters-close-btn');
    const forumSidebar = document.querySelector('.sidebar');

    if (filtersToggleBtn && forumSidebar) {
        filtersToggleBtn.addEventListener('click', () => {
            forumSidebar.classList.add('mobile-open');
        });
    }

    if (filtersCloseBtn && forumSidebar) {
        filtersCloseBtn.addEventListener('click', () => {
            forumSidebar.classList.remove('mobile-open');
        });
    }

    // Global variables for GIF picker access
    window.currentRoom = null;

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

    if (chatRoomsPrimera) {
        primeraTeams.forEach(team => chatRoomsPrimera.appendChild(createRoomItem(team)));
    }
    if (chatRoomsSegunda) {
        segundaTeams.forEach(team => chatRoomsSegunda.appendChild(createRoomItem(team)));
    }

    document.querySelectorAll('.chat-category .room-item').forEach(item => {
        if (!item.parentElement.id.includes('chat-rooms')) {
            item.addEventListener('click', () => {
                const roomName = item.textContent.trim();
                switchRoom(item, roomName);
            });
        }
    });

    window.loadMessages = async function (roomName) {
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

                const avatarHtml = getAvatarHtml(msg.username, msg.favorite_team, 'avatar-chat');

                msgDiv.innerHTML = `
                    <div class="chat-message-content">
                        ${!isSent ? avatarHtml : ''}
                        <div class="message-bubble">
                            <span class="message-author">@${msg.username}</span>
                            <span class="message-text">${renderContentWithGifs(msg.content, 'message-gif')}</span>
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
    };

    function switchRoom(element, roomName) {
        document.querySelectorAll('.room-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        currentRoomNameEl.textContent = roomName;
        window.currentRoom = roomName;
        if (chatInputContainer) chatInputContainer.classList.remove('hidden');
        window.loadMessages(roomName);
    }

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
                    room: window.currentRoom,
                    username: user.username,
                    content: text
                })
            });

            if (response.ok) {
                messageInput.value = '';
                window.loadMessages(window.currentRoom);
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

    // --- AUTO-REFRESH MESSAGES ---
    let lastMessageId = 0;
    async function refreshMessages() {
        if (!window.currentRoom) return;
        try {
            const response = await fetch(`/api/messages/${encodeURIComponent(window.currentRoom)}`);
            const messages = await response.json();
            if (messages.length > 0) {
                const latestId = Math.max(...messages.map(m => m.id));
                if (latestId > lastMessageId) {
                    lastMessageId = latestId;
                    window.loadMessages(window.currentRoom);
                }
            }
        } catch (error) { }
    }
    setInterval(refreshMessages, 3000);

    // --- MODAL LOGIC ---
    const loginBtn = document.querySelector('.login-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    function updateLoginUI(user) {
        if (loginBtn) {
            const favoriteTeam = user.favoriteTeam || user.favorite_team;
            let crestHtml = '';

            if (favoriteTeam) {
                const team = allTeams.find(t =>
                    t.name === favoriteTeam ||
                    t.name.toLowerCase().includes(favoriteTeam.toLowerCase()) ||
                    favoriteTeam.toLowerCase().includes(t.name.toLowerCase())
                );
                if (team) {
                    crestHtml = `<img src="${team.logo}" alt="${team.name}" class="nav-team-logo">`;
                }
            }

            loginBtn.innerHTML = `
                <div class="user-btn-content">
                    ${crestHtml}
                    <span>${escapeHtml(user.username)}</span>
                    <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; margin-left: 4px; opacity: 0.7;"></i>
                </div>
            `;
            loginBtn.classList.add('logged-in');
        }
    }

    function logout() {
        localStorage.removeItem('forolaliga_user');
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Acceder';
            loginBtn.classList.remove('logged-in');
        }
        applyTeamTheme(null);
        loadTopics();
    }

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
        if (loginModal) loginModal.classList.add('hidden');
        if (registerModal) registerModal.classList.add('hidden');
        const topicModal = document.getElementById('topic-modal');
        if (topicModal) topicModal.classList.add('hidden');
        const topicDetailModal = document.getElementById('topic-detail-modal');
        if (topicDetailModal) topicDetailModal.classList.add('hidden');
        const gifModal = document.getElementById('gif-modal');
        if (gifModal) gifModal.classList.add('hidden');
    }

    if (loginBtn && loginModal && registerModal) {
        // Create user dropdown menu
        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown hidden';
        userDropdown.innerHTML = `
            <div class="user-dropdown-item" id="edit-profile-option">
                <i class="fa-solid fa-user-edit"></i> Editar perfil
            </div>
            <div class="user-dropdown-item" id="logout-option">
                <i class="fa-solid fa-sign-out-alt"></i> Cerrar sesión
            </div>
        `;
        loginBtn.parentElement.style.position = 'relative';
        loginBtn.parentElement.appendChild(userDropdown);

        // Add styles for dropdown
        const dropdownStyle = document.createElement('style');
        dropdownStyle.textContent = `
            .user-dropdown {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                background: rgba(20, 20, 30, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                min-width: 180px;
                z-index: 1000;
                overflow: hidden;
            }
            .user-dropdown.hidden {
                display: none;
            }
            .user-dropdown-item {
                padding: 12px 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #fff;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .user-dropdown-item:last-child {
                border-bottom: none;
            }
            .user-dropdown-item:hover {
                background: var(--accent-blue);
                color: white;
            }
            .user-dropdown-item i {
                width: 16px;
            }
        `;
        document.head.appendChild(dropdownStyle);

        loginBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (loginBtn.classList.contains('logged-in')) {
                userDropdown.classList.toggle('hidden');
            } else {
                loginModal.classList.remove('hidden');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.login-btn') && !userDropdown.classList.contains('hidden')) {
                userDropdown.classList.add('hidden');
            }
        });

        // Edit profile option
        const editProfileOption = userDropdown.querySelector('#edit-profile-option');
        if (editProfileOption) {
            editProfileOption.addEventListener('click', () => {
                const savedUser = localStorage.getItem('forolaliga_user');
                if (savedUser) {
                    const user = JSON.parse(savedUser);
                    openProfileModal(user.username);
                    userDropdown.classList.add('hidden');
                }
            });
        }

        // Logout option
        const logoutOption = userDropdown.querySelector('#logout-option');
        if (logoutOption) {
            logoutOption.addEventListener('click', () => {
                if (confirm('¿Cerrar sesión?')) {
                    logout();
                    userDropdown.classList.add('hidden');
                }
            });
        }

        closeModals.forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });

        window.addEventListener('click', (e) => {
            if (e.target === loginModal || e.target === registerModal) closeAllModals();
        });

        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                loginModal.classList.add('hidden');
                registerModal.classList.remove('hidden');
            });
        }

        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                registerModal.classList.add('hidden');
                loginModal.classList.remove('hidden');
            });
        }

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
                        localStorage.setItem('forolaliga_user', JSON.stringify(data.user));
                        closeAllModals();

                        // Show shield animation then reload
                        if (data.user.favoriteTeam || data.user.favorite_team) {
                            playLoginAnimation(data.user.favoriteTeam || data.user.favorite_team, () => {
                                location.reload();
                            });
                        } else {
                            location.reload();
                        }
                    } else {
                        showToast('Error: ' + data.error, 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showToast('Error de conexión con el servidor', 'error');
                }
            });
        }

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
                        showToast('¡Registro exitoso! Ya puedes iniciar sesión.', 'success');
                        registerModal.classList.add('hidden');
                        loginModal.classList.remove('hidden');
                    } else {
                        showToast('Error: ' + data.error, 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error de conexión con el servidor');
                }
            });
        }
    }

    // --- HELPER FUNCTIONS ---
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = {
            'success': 'fa-circle-check',
            'error': 'fa-circle-exclamation',
            'info': 'fa-circle-info',
            'warning': 'fa-triangle-exclamation'
        }[type] || 'fa-circle-info';

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderContentWithGifs(content, cssClass = 'topic-gif') {
        if (!content) return '';
        let safeContent = escapeHtml(content);
        safeContent = safeContent.replace(/\[GIF\](.*?)\[\/GIF\]/g, (match, url) => {
            return `<img src="${url}" class="${cssClass}" alt="GIF">`;
        });
        return safeContent;
    }

    function getCleanExcerpt(content, maxLength) {
        if (!content) return '';
        const cleanContent = content.replace(/\[GIF\].*?\[\/GIF\]/g, '').trim();
        return escapeHtml(cleanContent.substring(0, maxLength));
    }

    function getAvatarHtml(username, favoriteTeam, sizeClass = '') {
        if (favoriteTeam) {
            const team = allTeams.find(t => t.name === favoriteTeam);
            if (team) {
                return `<div class="user-avatar ${sizeClass}" title="${favoriteTeam}">
                    <img src="${team.logo}" alt="${favoriteTeam}" class="avatar-team-logo">
                </div>`;
            }
        }
        const initial = username ? username.charAt(0).toUpperCase() : '?';
        return `<div class="user-avatar ${sizeClass}">${initial}</div>`;
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

    // --- TOPICS LOGIC ---
    const topicsContainer = document.getElementById('topics-container');
    const newTopicBtn = document.getElementById('new-topic-btn');
    const topicModal = document.getElementById('topic-modal');
    const topicForm = document.getElementById('topic-form');
    const filterStatusContainer = document.getElementById('filter-status-container');

    async function loadTopics() {
        if (!topicsContainer) return;

        try {
            const response = await fetch('/api/topics');
            let topics = await response.json();

            // Apply filters
            if (activeTeamFilter) {
                topics = topics.filter(topic => topic.team === activeTeamFilter);
            }

            if (activeSearchQuery) {
                topics = topics.filter(topic =>
                    topic.title.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
                    (topic.content && topic.content.toLowerCase().includes(activeSearchQuery.toLowerCase()))
                );
            }

            // Update Filter Status Label
            if (filterStatusContainer) {
                if (activeTeamFilter) {
                    const teamData = allTeams.find(t => t.name === activeTeamFilter);
                    filterStatusContainer.innerHTML = `
                        Viendo hilos de: 
                        <div class="active-filter-badge">
                            ${teamData ? `<img src="${teamData.logo}" alt="${teamData.name}">` : ''}
                            ${activeTeamFilter}
                        </div>
                        <button class="btn-clear-filter" id="clear-filter-btn">
                            <i class="fa-solid fa-xmark"></i> Quitar Filtro
                        </button>
                    `;
                    filterStatusContainer.classList.remove('hidden');

                    // Add listener to the clear button
                    const clearBtn = document.getElementById('clear-filter-btn');
                    if (clearBtn) {
                        clearBtn.onclick = () => {
                            activeTeamFilter = null;
                            resetDropdown('primera-select');
                            resetDropdown('segunda-select');

                            // Revert theme if not logged in or doesn't have a fav team
                            const savedUser = localStorage.getItem('forolaliga_user');
                            let targetTheme = null;
                            if (savedUser) {
                                const user = JSON.parse(savedUser);
                                targetTheme = user.favoriteTeam || user.favorite_team;
                            }

                            applyTeamTheme(targetTheme);
                            loadTopics();
                        };
                    }
                } else {
                    filterStatusContainer.classList.add('hidden');
                    filterStatusContainer.innerHTML = '';
                }
            }

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

        let teamBadge = '';
        if (topic.team) {
            const team = allTeams.find(t => t.name === topic.team);
            if (team) {
                teamBadge = `<div class="topic-team-badge">
                    <img src="${team.logo}" alt="${team.name}" class="team-logo-sm" title="${team.name}">
                </div>`;
            }
        }

        const avatarHtml = getAvatarHtml(topic.username, topic.author_favorite_team);
        const hasGif = topic.content && topic.content.includes('[GIF]');

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
            <p class="topic-excerpt">${getCleanExcerpt(topic.content, 150)}${hasGif ? ' <i class="fa-solid fa-image" title="Contiene GIF"></i>' : ''}</p>
            <div class="topic-footer">
                <div class="topic-stats">
                    <span class="stat"><i class="fa-regular fa-comment"></i> ${topic.replies || 0}</span>
                    <span class="stat"><i class="fa-regular fa-eye"></i> ${topic.views || 0}</span>
                </div>
                <span class="username">@${escapeHtml(topic.username)}</span>
            </div>
            <div class="reactions-container" data-type="topic" data-id="${topic.id}">
                <!-- Reactions injected by JS -->
            </div>
        `;

        renderReactions('topic', topic.id, card.querySelector('.reactions-container'));

        card.addEventListener('click', (e) => {
            if (e.target.closest('.reaction-btn')) return; // Don't open detail if clicking emoji
            openTopicDetail(topic.id);
        });
        return card;
    }

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

        const topicCloseBtn = topicModal.querySelector('.close-modal');
        if (topicCloseBtn) {
            topicCloseBtn.addEventListener('click', () => topicModal.classList.add('hidden'));
        }

        topicModal.addEventListener('click', (e) => {
            if (e.target === topicModal) topicModal.classList.add('hidden');
        });
    }

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
            let content = document.getElementById('topic-content').value.trim();
            const category = document.getElementById('topic-category').value;
            const team = document.getElementById('topic-team-value').value || null;

            const gifUrl = document.getElementById('topic-gif-url')?.value;
            if (gifUrl) {
                content += `\n[GIF]${gifUrl}[/GIF]`;
            }

            if (!title || !content || !category) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            try {
                const response = await fetch('/api/topics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content, category, team, username: user.username })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('¡Tema creado exitosamente!');
                    topicModal.classList.add('hidden');
                    topicForm.reset();
                    const teamSpan = document.querySelector('#topic-team-select .selected-option');
                    if (teamSpan) teamSpan.textContent = 'Seleccionar equipo';
                    document.getElementById('topic-team-value').value = '';
                    const gifPreview = document.getElementById('topic-gif-preview');
                    if (gifPreview) gifPreview.classList.add('hidden');
                    const gifImg = document.getElementById('topic-gif-img');
                    if (gifImg) gifImg.src = '';
                    const gifUrlInput = document.getElementById('topic-gif-url');
                    if (gifUrlInput) gifUrlInput.value = '';
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

    // --- TOPIC DETAIL & REPLIES ---
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
            const topicResponse = await fetch(`/api/topics/${topicId}`);
            const topic = await topicResponse.json();

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
                <div class="topic-detail-body">${renderContentWithGifs(topic.content, 'topic-gif')}</div>
                <div class="topic-detail-stats">
                    <span><i class="fa-regular fa-eye"></i> ${topic.views} visualizaciones</span>
                    <span><i class="fa-regular fa-comment"></i> ${topic.replies} respuestas</span>
                </div>
                <div class="reactions-container" data-type="topic" data-id="${topic.id}">
                    <!-- Topic reactions -->
                </div>
            `;

            renderReactions('topic', topic.id, topicDetailContent.querySelector('.reactions-container'));

            await loadReplies(topicId);

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
                const avatarHtml = getAvatarHtml(reply.username, reply.favorite_team, 'user-avatar-sm');

                replyDiv.innerHTML = `
                    <div class="reply-header">
                        ${avatarHtml}
                        <span class="reply-username">@${escapeHtml(reply.username)}</span>
                        <span class="reply-time">${getTimeAgo(new Date(reply.created_at))}</span>
                    </div>
                    <div class="reply-content">${renderContentWithGifs(reply.content, 'reply-gif')}</div>
                    <div class="reactions-container" data-type="reply" data-id="${reply.id}">
                        <!-- Reactions injected by JS -->
                    </div>
                `;
                renderReactions('reply', reply.id, replyDiv.querySelector('.reactions-container'));
                repliesContainer.appendChild(replyDiv);
            });
        } catch (error) {
            console.error('Error loading replies:', error);
            repliesContainer.innerHTML = '<p class="no-replies">Error al cargar las respuestas</p>';
        }
    }

    if (replyForm) {
        replyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const savedUser = localStorage.getItem('forolaliga_user');
            if (!savedUser) {
                alert('Debes iniciar sesión para responder');
                return;
            }

            const user = JSON.parse(savedUser);
            let content = document.getElementById('reply-content').value.trim();

            const replyGifUrlInput = document.getElementById('reply-gif-url');
            if (replyGifUrlInput && replyGifUrlInput.value) {
                content += `\n[GIF]${replyGifUrlInput.value}[/GIF]`;
            }

            if (!content) {
                alert('Escribe una respuesta');
                return;
            }

            try {
                const response = await fetch('/api/replies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topicId: currentTopicId, username: user.username, content })
                });

                if (response.ok) {
                    document.getElementById('reply-content').value = '';
                    const gifPreview = document.getElementById('reply-gif-preview');
                    if (gifPreview) gifPreview.classList.add('hidden');
                    const gifImg = document.getElementById('reply-gif-img');
                    if (gifImg) gifImg.src = '';
                    if (replyGifUrlInput) replyGifUrlInput.value = '';
                    await loadReplies(currentTopicId);
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

    if (topicDetailModal) {
        const closeBtn = topicDetailModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => topicDetailModal.classList.add('hidden'));
        }
        topicDetailModal.addEventListener('click', (e) => {
            if (e.target === topicDetailModal) topicDetailModal.classList.add('hidden');
        });
    }

    loadTopics();

    // --- GIF PICKER ---
    const GIPHY_API_KEY = 'tHbQhZgGFhTmRQMdOKK7z4HKPb096ssJ';
    const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs';

    let currentGifTarget = null;

    const gifModal = document.getElementById('gif-modal');
    const gifSearchInput = document.getElementById('gif-search-input');
    const gifSearchBtn = document.getElementById('gif-search-btn');
    const gifResults = document.getElementById('gif-results');
    const gifCategoryBtns = document.querySelectorAll('.gif-category-btn');

    const topicGifBtn = document.getElementById('topic-gif-btn');
    const replyGifBtn = document.getElementById('reply-gif-btn');
    const chatGifBtn = document.getElementById('chat-gif-btn');

    const topicGifPreview = document.getElementById('topic-gif-preview');
    const topicGifImg = document.getElementById('topic-gif-img');
    const topicGifUrl = document.getElementById('topic-gif-url');
    const topicGifRemove = document.getElementById('topic-gif-remove');

    const replyGifPreview = document.getElementById('reply-gif-preview');
    const replyGifImg = document.getElementById('reply-gif-img');
    const replyGifUrl = document.getElementById('reply-gif-url');
    const replyGifRemove = document.getElementById('reply-gif-remove');

    function openGifModal(target) {
        currentGifTarget = target;
        if (gifModal) {
            gifModal.classList.remove('hidden');
            loadTrendingGifs();
            if (gifSearchInput) gifSearchInput.focus();
        }
    }

    function closeGifModal() {
        if (gifModal) gifModal.classList.add('hidden');
        currentGifTarget = null;
    }

    async function loadTrendingGifs() {
        showGifLoading();
        try {
            const response = await fetch(`${GIPHY_API_URL}/trending?api_key=${GIPHY_API_KEY}&limit=24&rating=g`);
            const data = await response.json();
            displayGifs(data.data);
        } catch (error) {
            console.error('Error loading GIFs:', error);
            if (gifResults) gifResults.innerHTML = '<p class="gif-loading">Error al cargar GIFs</p>';
        }
    }

    async function searchGifs(query) {
        if (!query.trim()) {
            loadTrendingGifs();
            return;
        }
        showGifLoading();
        try {
            const response = await fetch(`${GIPHY_API_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=g`);
            const data = await response.json();
            displayGifs(data.data);
        } catch (error) {
            console.error('Error searching GIFs:', error);
            if (gifResults) gifResults.innerHTML = '<p class="gif-loading">Error al buscar GIFs</p>';
        }
    }

    function showGifLoading() {
        if (gifResults) {
            gifResults.innerHTML = '<div class="gif-loading"><i class="fa-solid fa-spinner fa-spin"></i> Cargando GIFs...</div>';
        }
    }

    function displayGifs(gifs) {
        if (!gifResults) return;

        if (gifs.length === 0) {
            gifResults.innerHTML = '<p class="gif-loading">No se encontraron GIFs</p>';
            return;
        }

        gifResults.innerHTML = '';
        gifs.forEach(gif => {
            const div = document.createElement('div');
            div.className = 'gif-item';
            div.innerHTML = `<img src="${gif.images.fixed_height_small.url}" alt="${gif.title}">`;
            div.addEventListener('click', () => selectGif(gif.images.fixed_height.url));
            gifResults.appendChild(div);
        });
    }

    function selectGif(gifUrl) {
        if (currentGifTarget === 'topic') {
            if (topicGifImg) topicGifImg.src = gifUrl;
            if (topicGifUrl) topicGifUrl.value = gifUrl;
            if (topicGifPreview) topicGifPreview.classList.remove('hidden');
        } else if (currentGifTarget === 'reply') {
            if (replyGifImg) replyGifImg.src = gifUrl;
            if (replyGifUrl) replyGifUrl.value = gifUrl;
            if (replyGifPreview) replyGifPreview.classList.remove('hidden');
        } else if (currentGifTarget === 'chat') {
            sendChatGif(gifUrl);
        } else if (currentGifTarget === 'banner') {
            const profileBannerUrl = document.getElementById('profile-banner-url');
            const bannerPreviewImg = document.getElementById('banner-preview-img');
            const bannerPreview = document.getElementById('current-banner-preview');
            const profileBanner = document.getElementById('profile-banner');

            if (profileBannerUrl) profileBannerUrl.value = gifUrl;
            if (bannerPreviewImg) bannerPreviewImg.src = gifUrl;
            if (bannerPreview) bannerPreview.classList.remove('hidden');
            if (profileBanner) profileBanner.innerHTML = `<img src="${gifUrl}" alt="Profile Banner">`;
        }
        closeGifModal();
    }

    async function sendChatGif(gifUrl) {
        const savedUser = localStorage.getItem('forolaliga_user');
        if (!savedUser || !window.currentRoom) {
            alert('Entra a una sala de chat primero');
            return;
        }

        const user = JSON.parse(savedUser);

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room: window.currentRoom,
                    username: user.username,
                    content: `[GIF]${gifUrl}[/GIF]`
                })
            });

            if (response.ok) {
                window.loadMessages(window.currentRoom);
            }
        } catch (error) {
            console.error('Error sending GIF:', error);
        }
    }

    if (topicGifBtn) topicGifBtn.addEventListener('click', () => openGifModal('topic'));
    if (replyGifBtn) replyGifBtn.addEventListener('click', () => openGifModal('reply'));
    if (chatGifBtn) chatGifBtn.addEventListener('click', () => openGifModal('chat'));

    if (topicGifRemove) {
        topicGifRemove.addEventListener('click', () => {
            if (topicGifPreview) topicGifPreview.classList.add('hidden');
            if (topicGifImg) topicGifImg.src = '';
            if (topicGifUrl) topicGifUrl.value = '';
        });
    }

    if (replyGifRemove) {
        replyGifRemove.addEventListener('click', () => {
            if (replyGifPreview) replyGifPreview.classList.add('hidden');
            if (replyGifImg) replyGifImg.src = '';
            if (replyGifUrl) replyGifUrl.value = '';
        });
    }

    if (gifSearchBtn) {
        gifSearchBtn.addEventListener('click', () => {
            const query = gifSearchInput ? gifSearchInput.value : '';
            searchGifs(query);
        });
    }

    if (gifSearchInput) {
        gifSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchGifs(gifSearchInput.value);
            }
        });
    }

    gifCategoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gifCategoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            if (category === 'trending') {
                loadTrendingGifs();
            } else {
                searchGifs(category);
            }
        });
    });

    if (gifModal) {
        const closeBtn = gifModal.querySelector('.close-modal');
        if (closeBtn) closeBtn.addEventListener('click', closeGifModal);
        gifModal.addEventListener('click', (e) => {
            if (e.target === gifModal) closeGifModal();
        });
    }

    // --- PROFILE MODAL SYSTEM ---
    const profileModal = document.getElementById('profile-modal');
    const profileUsername = document.getElementById('profile-username');
    const profileTeam = document.getElementById('profile-team');
    const profileJoined = document.getElementById('profile-joined');
    const profileAvatarContainer = document.getElementById('profile-avatar-container');
    const profileBio = document.getElementById('profile-bio');
    const profileBioPreview = document.getElementById('profile-bio-preview');
    const profileLocation = document.getElementById('profile-location');
    const profileLocationDisplay = document.getElementById('profile-location-display');
    const profileEditSide = document.getElementById('profile-edit-side');
    const previewBadge = document.getElementById('preview-badge');
    const bioChars = document.getElementById('bio-chars');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const profileBadges = document.getElementById('profile-badges');
    const profileSocials = document.getElementById('profile-socials');
    const profileTwitter = document.getElementById('profile-twitter');
    const profileInstagram = document.getElementById('profile-instagram');
    const profileModalContent = profileModal ? profileModal.querySelector('.modal-content') : null;
    const mobileEditBtn = document.getElementById('mobile-edit-btn');
    const closeEditMobile = document.getElementById('close-edit-mobile');

    let currentProfileUsername = null;

    async function openProfileModal(username) {
        if (!profileModal) return;
        currentProfileUsername = username;

        try {
            const response = await fetch(`/api/users/${encodeURIComponent(username)}`);
            if (!response.ok) {
                alert('Error al cargar el perfil');
                return;
            }

            const userData = await response.json();

            profileUsername.textContent = `@${userData.username}`;
            profileTeam.textContent = userData.favorite_team || 'Sin equipo';

            const joinedDate = new Date(userData.created_at);
            profileJoined.textContent = `Unido: ${joinedDate.toLocaleDateString('es-ES')}`;

            profileAvatarContainer.innerHTML = getAvatarHtml(userData.username, userData.favorite_team, 'profile-avatar-large');

            // Display Location & Bio Preview
            const locationText = userData.location || 'Ubicación no especificada';
            if (profileLocationDisplay) {
                profileLocationDisplay.innerHTML = `<i class="fa-solid fa-location-dot"></i><span> ${locationText}</span>`;
            }
            if (profileBioPreview) {
                profileBioPreview.textContent = userData.bio || 'Este usuario no tiene biografía.';
            }

            // Render Badges & Socials
            renderBadges(userData);
            renderSocials(userData);

            // Apply Team Theming to the Modal
            if (userData.favorite_team) {
                let theme = teamColors[userData.favorite_team];
                if (!theme) {
                    const teamKey = Object.keys(teamColors).find(key =>
                        key.toLowerCase() === userData.favorite_team.toLowerCase() ||
                        key.toLowerCase().includes(userData.favorite_team.toLowerCase()) ||
                        userData.favorite_team.toLowerCase().includes(key.toLowerCase())
                    );
                    if (teamKey) theme = teamColors[teamKey];
                }

                if (theme) {
                    profileModal.style.setProperty('--profile-accent', theme.primary);
                    profileModal.style.setProperty('--profile-accent-hover', theme.hover);
                } else {
                    profileModal.style.removeProperty('--profile-accent');
                    profileModal.style.removeProperty('--profile-accent-hover');
                }
            } else {
                profileModal.style.removeProperty('--profile-accent');
                profileModal.style.removeProperty('--profile-accent-hover');
            }

            const profileBanner = document.getElementById('profile-banner');
            if (profileBanner) {
                if (userData.banner_url) {
                    profileBanner.innerHTML = `<img src="${userData.banner_url}" alt="Profile Banner">`;
                } else {
                    profileBanner.innerHTML = '';
                }
            } else {
                console.error('profile-banner element not found!');
            }

            const savedUser = localStorage.getItem('forolaliga_user');
            const isOwnProfile = savedUser && JSON.parse(savedUser).username.toLowerCase() === username.toLowerCase();
            const bannerEditSection = document.getElementById('banner-edit-section');
            const locationEditSection = document.getElementById('location-edit-section');
            const profileBannerUrl = document.getElementById('profile-banner-url');
            const bannerPreview = document.getElementById('current-banner-preview');
            const bannerPreviewImg = document.getElementById('banner-preview-img');

            if (isOwnProfile) {
                if (profileModalContent) profileModalContent.classList.remove('view-only');
                profileBio.value = userData.bio || '';
                profileBio.disabled = false;

                // Show Edit Side
                if (profileEditSide) profileEditSide.classList.remove('hidden');
                if (previewBadge) previewBadge.classList.remove('hidden');

                // Set banner values
                if (profileBannerUrl) profileBannerUrl.value = userData.banner_url || '';
                if (userData.banner_url) {
                    if (bannerPreviewImg) bannerPreviewImg.src = userData.banner_url;
                    if (bannerPreview) bannerPreview.classList.remove('hidden');
                } else {
                    if (bannerPreview) bannerPreview.classList.add('hidden');
                }

                // Set location value
                if (profileLocation) profileLocation.value = userData.location || '';
                if (profileTwitter) profileTwitter.value = userData.twitter_url || '';
                if (profileInstagram) profileInstagram.value = userData.instagram_url || '';

                updateCharCounter();
                if (mobileEditBtn) mobileEditBtn.classList.remove('hidden');
            } else {
                // Not own profile: Fill preview correctly but hide edit side
                if (profileModalContent) profileModalContent.classList.add('view-only');
                if (profileBioPreview) profileBioPreview.textContent = userData.bio || 'Este usuario no tiene biografía.';
                if (profileEditSide) profileEditSide.classList.add('hidden');
                if (previewBadge) previewBadge.classList.add('hidden');
                if (mobileEditBtn) mobileEditBtn.classList.add('hidden');
            }

            // Ensure mobile overlay is closed when opening any profile
            if (profileEditSide) profileEditSide.classList.remove('mobile-active');

            profileModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error opening profile modal:', error);
        }
    }

    function renderBadges(userData) {
        if (!profileBadges) return;
        profileBadges.innerHTML = '';

        const badges = [];
        const badgeAssetsPath = 'assets/badges/';

        // 1. Bronze (Novato/Welcome)
        badges.push({
            id: 'novato',
            img: 'novato.png',
            title: 'Bronce: ¡Bienvenido al foro!',
            class: 'badge-novato'
        });

        // 2. Silver (Veterano: +30 days)
        const joinDate = new Date(userData.created_at);
        const daysSinceJoin = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
        if (daysSinceJoin >= 30) {
            badges.push({
                id: 'veterano',
                img: 'veterano.png',
                title: 'Plata: Veterano (Más de 30 días)',
                class: 'badge-veterano'
            });
        }

        // 3. Gold (Capitán: +50 messages)
        if (userData.message_count >= 50) {
            badges.push({
                id: 'pichichi',
                img: 'oro.png',
                title: `Oro: Capitán (${userData.message_count} mensajes)`,
                class: 'badge-pichichi'
            });
        }

        // 4. Honor (Fiel: Favorite Team selected)
        if (userData.favorite_team) {
            badges.push({
                id: 'gold',
                img: 'honor.png',
                title: `Honor: Fiel al ${userData.favorite_team}`,
                class: 'badge-gold'
            });
        }

        // Render awarded badges
        badges.forEach(badge => {
            const div = document.createElement('div');
            div.className = `badge-item ${badge.class}`;
            div.setAttribute('data-title', badge.title);

            // Interaction: Open Zoom
            div.addEventListener('click', () => {
                openBadgeZoom(badge);
            });

            // Create processed image
            const img = new Image();
            img.src = `${badgeAssetsPath}${badge.img}`;
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Remove black pixels
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // If pixel is very dark (black background)
                    if (r < 30 && g < 30 && b < 30) {
                        data[i + 3] = 0; // Set alpha to 0 (transparent)
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                const cleanImg = document.createElement('img');
                cleanImg.src = canvas.toDataURL();
                div.appendChild(cleanImg);
            };

            img.onerror = () => {
                // Fallback to original if processing fails
                const fallbackImg = document.createElement('img');
                fallbackImg.src = `${badgeAssetsPath}${badge.img}`;
                div.appendChild(fallbackImg);
            };

            profileBadges.appendChild(div);
        });
    }

    function openBadgeZoom(badge) {
        const overlay = document.getElementById('badge-zoom-overlay');
        const imgContainer = document.querySelector('.badge-zoom-content');
        const title = document.getElementById('zoomed-badge-title');
        const desc = document.getElementById('zoomed-badge-desc');

        if (!overlay || !imgContainer || !title || !desc) return;

        // Clear previous zoomed img
        const oldImg = document.getElementById('zoomed-badge-img');
        if (oldImg) oldImg.remove();

        const badgeImageUrl = `assets/badges/${badge.img}`;

        // Process large version too
        const img = new Image();
        img.src = badgeImageUrl;
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] < 30 && data[i + 1] < 30 && data[i + 2] < 30) data[i + 3] = 0;
            }
            ctx.putImageData(imageData, 0, 0);

            const cleanImg = document.createElement('img');
            cleanImg.id = 'zoomed-badge-img';
            cleanImg.src = canvas.toDataURL();
            imgContainer.insertBefore(cleanImg, title);
        };

        const parts = badge.title.split(': ');
        title.textContent = parts[0];
        desc.textContent = parts[1] || '';

        overlay.classList.remove('hidden');
    }

    // Close Badge Zoom
    document.addEventListener('click', (e) => {
        const overlay = document.getElementById('badge-zoom-overlay');
        if (e.target.id === 'badge-zoom-overlay' || e.target.classList.contains('close-zoom')) {
            overlay.classList.add('hidden');
        }
    });


    function updateCharCounter() {
        if (bioChars && profileBio) {
            bioChars.textContent = profileBio.value.length;
        }
    }

    if (profileBio) {
        profileBio.addEventListener('input', () => {
            updateCharCounter();
            if (profileBioPreview) {
                profileBioPreview.textContent = profileBio.value.trim() || 'Tu biografía aparecerá aquí...';
            }
        });
    }

    if (profileLocation) {
        profileLocation.addEventListener('change', () => {
            if (profileLocationDisplay) {
                const loc = profileLocation.value || 'Ubicación no especificada';
                profileLocationDisplay.innerHTML = `<i class="fa-solid fa-location-dot"></i><span> ${loc}</span>`;
            }
        });
    }

    if (profileTwitter) {
        profileTwitter.addEventListener('input', () => {
            renderSocials({
                twitter_url: profileTwitter.value,
                instagram_url: profileInstagram.value
            });
        });
    }

    if (profileInstagram) {
        profileInstagram.addEventListener('input', () => {
            renderSocials({
                twitter_url: profileTwitter.value,
                instagram_url: profileInstagram.value
            });
        });
    }

    function renderSocials(userData) {
        if (!profileSocials) return;
        profileSocials.innerHTML = '';

        if (userData.twitter_url && userData.twitter_url.trim() !== '') {
            const a = document.createElement('a');
            a.href = userData.twitter_url.startsWith('http') ? userData.twitter_url : `https://${userData.twitter_url}`;
            a.target = '_blank';
            a.className = 'social-icon twitter';
            a.innerHTML = '<i class="fa-brands fa-x-twitter"></i>';
            profileSocials.appendChild(a);
        }

        if (userData.instagram_url && userData.instagram_url.trim() !== '') {
            const a = document.createElement('a');
            a.href = userData.instagram_url.startsWith('http') ? userData.instagram_url : `https://${userData.instagram_url}`;
            a.target = '_blank';
            a.className = 'social-icon instagram';
            a.innerHTML = '<i class="fa-brands fa-instagram"></i>';
            profileSocials.appendChild(a);
        }
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            try {
                const savedUser = localStorage.getItem('forolaliga_user');
                if (!savedUser) {
                    alert('Debes iniciar sesión');
                    return;
                }

                const user = JSON.parse(savedUser);
                const bio = profileBio.value;
                const banner_url = document.getElementById('profile-banner-url').value;
                const location = profileLocation.value;
                const twitter_url = profileTwitter.value;
                const instagram_url = profileInstagram.value;

                const response = await fetch('/api/users/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: user.username,
                        bio,
                        banner_url,
                        location,
                        twitter_url,
                        instagram_url
                    })
                });

                if (response.ok) {
                    alert('Perfil actualizado exitosamente');
                    if (typeof openProfileModal === 'function') {
                        openProfileModal(user.username);
                    }
                } else {
                    const data = await response.json();
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('CRITICAL ERROR in saveProfileBtn listener:', error);
                alert('Ocurrió un error crítico: ' + error.message);
            }
        });
    }

    // Banner GIF selection
    const selectBannerBtn = document.getElementById('select-banner-btn');
    const removeBannerBtn = document.getElementById('remove-banner-btn');

    if (selectBannerBtn) {
        selectBannerBtn.addEventListener('click', () => {
            currentGifTarget = 'banner';
            openGifModal('banner');
        });
    }

    if (removeBannerBtn) {
        removeBannerBtn.addEventListener('click', () => {
            const bannerPreview = document.getElementById('current-banner-preview');
            const bannerPreviewImg = document.getElementById('banner-preview-img');
            const profileBannerUrl = document.getElementById('profile-banner-url');

            if (bannerPreview) bannerPreview.classList.add('hidden');
            if (bannerPreviewImg) bannerPreviewImg.src = '';
            if (profileBannerUrl) profileBannerUrl.value = '';

            // Also clear the main banner display
            const profileBanner = document.getElementById('profile-banner');
            if (profileBanner) {
                profileBanner.innerHTML = '';
            }
        });
    }

    if (profileModal) {
        const closeBtn = profileModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                profileModal.classList.add('hidden');
                if (profileEditSide) profileEditSide.classList.remove('mobile-active');
            });
        }
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                profileModal.classList.add('hidden');
                if (profileEditSide) profileEditSide.classList.remove('mobile-active');
            }
        });
    }

    // Toggle Mobile Edit Overlay
    if (mobileEditBtn) {
        mobileEditBtn.addEventListener('click', () => {
            if (profileEditSide) profileEditSide.classList.add('mobile-active');
        });
    }

    if (closeEditMobile) {
        closeEditMobile.addEventListener('click', () => {
            if (profileEditSide) profileEditSide.classList.remove('mobile-active');
        });
    }

    // Make usernames clickable to open profiles
    document.addEventListener('click', (e) => {
        const usernameEl = e.target.closest('.username, .message-author, .reply-username, .topic-detail-author');
        if (usernameEl) {
            const cleanUsername = usernameEl.textContent.replace('@', '').replace('por ', '').trim();
            if (cleanUsername) {
                openProfileModal(cleanUsername);
            }
        }
    });

    // Add cursor pointer to usernames
    const style = document.createElement('style');
    style.textContent = `
        .username, .message-author, .reply-username, .topic-detail-author {
            cursor: pointer;
            transition: color 0.2s ease;
        }
        .username:hover, .message-author:hover, .reply-username:hover, .topic-detail-author:hover {
            color: var(--accent-blue);
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);

    // Apply favorite team theme on page load
    const currentUser = localStorage.getItem('forolaliga_user');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            const favoriteTeam = user.favoriteTeam || user.favorite_team;
            if (favoriteTeam) {
                applyTeamTheme(favoriteTeam);
            }
        } catch (e) {
            console.error('Error applying initial theme:', e);
        }
    }

    // Load topics on page load
    loadTopics();

    // --- REACTIONS LOGIC ---
    async function renderReactions(targetType, targetId, container) {
        if (!container) return;

        const savedUser = localStorage.getItem('forolaliga_user');
        const currentUser = savedUser ? JSON.parse(savedUser).username : null;

        try {
            const url = `/api/reactions/${targetType}/${targetId}${currentUser ? `?username=${currentUser}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();

            const emojis = ['👍', '🔥', '⚽', '👏', '📉'];
            const countsMap = {};
            data.counts.forEach(c => countsMap[c.emoji] = c.count);

            container.innerHTML = '';
            emojis.forEach(emoji => {
                const count = countsMap[emoji] || 0;
                const isActive = data.userReactions && data.userReactions.includes(emoji);

                const btn = document.createElement('button');
                btn.className = `reaction-btn ${isActive ? 'active' : ''}`;
                btn.innerHTML = `${emoji} <span class="count">${count}</span>`;
                btn.title = `Reaccionar con ${emoji}`;

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleReaction(targetType, targetId, emoji);
                });

                container.appendChild(btn);
            });
        } catch (error) {
            console.error('Error rendering reactions:', error);
        }
    }

    async function toggleReaction(targetType, targetId, emoji) {
        const savedUser = localStorage.getItem('forolaliga_user');
        if (!savedUser) {
            showToast('Inicia sesión para reaccionar', 'error');
            if (loginModal) loginModal.classList.remove('hidden');
            return;
        }

        const username = JSON.parse(savedUser).username;

        try {
            const response = await fetch('/api/reactions/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetType, targetId, username, emoji })
            });

            if (response.ok) {
                // Update local UI immediately
                const containers = document.querySelectorAll(`.reactions-container[data-type="${targetType}"][data-id="${targetId}"]`);
                containers.forEach(container => {
                    renderReactions(targetType, targetId, container);
                });
            }
        } catch (error) {
            console.error('Error toggling reaction:', error);
        }
    }

    // Real-time synchronization for reactions
    if (typeof io !== 'undefined') {
        socket.on('reactionUpdated', (data) => {
            const containers = document.querySelectorAll(`.reactions-container[data-type="${data.targetType}"][data-id="${data.targetId}"]`);
            containers.forEach(container => {
                renderReactions(data.targetType, data.targetId, container);
            });
        });
    }
});
