// ---------- ALWAYS START FRESH ----------
localStorage.removeItem('idrisChatMessages'); // in case an old version stored this
// ----------------------------------------

const messagesContent = $('.msgs-content');
const messageInput = $('.msg-input');
const messageSubmit = $('.msg-submit');
const typingStats = $('.typing-stats');
const avatarImage = 'fox.webp';

const STORAGE_KEY_THEME = 'idrisChatTheme';

let minutes = -1;
let lastMessageDate = '';
let typingStartTime = null;
let lastUserMessageText = '';
let fakeIndex = 0;
let currentUserName = null;

const fakeMessages = [
    'Interesting!',
    'Tell me more.',
    'That sounds cool.',
    'Nice idea.',
    'I like how you think.',
    'This project will be awesome.',
    'Keep going, you are doing great!',
    ':)'
];

// =============== INITIALIZATION ===============

$(window).on('load', function () {
    // Apply saved theme (name is NOT saved)
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'theme-dark';
    applyTheme(savedTheme);

    // Init scrollbar
    messagesContent.mCustomScrollbar();

    // Ensure empty chat each time
    $('.mCSB_container').empty();
    minutes = -1;
    lastMessageDate = '';

    // Always ask for the name again
    $('.setup-overlay').show();

    setupEvents();
});

function setupEvents() {
    // Start chat button
    $('#start-chat').on('click', function () {
        let name = $('#user-name-input').val().trim();
        if (!name) {
            name = 'Guest';
        }
        currentUserName = name;
        setUserName(name);
        $('.setup-overlay').fadeOut(200);

        // Greeting at start of every new session
        setTimeout(function () {
            addMessageToPage(
                `Hi ${name}, I'm Edrees Bot 🤖. Type /help to see what I can do.`,
                false
            );
        }, 600);
    });

    // Enter to start chat in overlay
    $('#user-name-input').on('keydown', function (e) {
        if (e.which === 13) {
            $('#start-chat').click();
        }
    });

    // Theme toggle
    $('.theme-toggle').on('click', function () {
        const body = $('body');
        const next = body.hasClass('theme-neon') ? 'theme-dark' : 'theme-neon';
        applyTheme(next);
    });

    // Send on Enter
    messageInput.on('keydown', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            insertMessage();
            return false;
        }
    });

    // Typing stats
    messageInput.on('input', updateTypingStats);

    // Send button
    messageSubmit.on('click', insertMessage);
}

// =============== THEME ===============

function applyTheme(theme) {
    const body = $('body');
    body.removeClass('theme-dark theme-neon');
    body.addClass(theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
}

// =============== USER / TITLE ===============

function setUserName(name) {
    $('.chat-title .title-text h1').text(name.toUpperCase());
}

// =============== SCROLLBAR & TIMESTAMP ===============

function updateScrollbar() {
    messagesContent
        .mCustomScrollbar('update')
        .mCustomScrollbar('scrollTo', 'bottom', {
            scrollInertia: 10,
            timeout: 0
        });
}

function addTimestamp(time) {
    const date = time || new Date();
    const minutesNow = date.getMinutes();

    if (minutes !== minutesNow) {
        minutes = minutesNow;
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(minutesNow).padStart(2, '0');
        const timeStamp = $('<div class="timestamp"></div>').text(`${hh}:${mm}`);
        $('.msg:last').append(timeStamp);
    }
}

// =============== DATE SEPARATOR ===============

function addDateSeparator(time) {
    const date = time || new Date();
    const dateStr = date.toDateString();

    if (dateStr === lastMessageDate) {
        return;
    }
    lastMessageDate = dateStr;

    const now = new Date();
    const todayStr = now.toDateString();

    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let label;
    if (dateStr === todayStr) {
        label = 'Today';
    } else if (dateStr === yesterdayStr) {
        label = 'Yesterday';
    } else {
        label = date.toLocaleDateString();
    }

    const sep = $('<div class="date-separator"></div>').text(label);
    $('.mCSB_container').append(sep);
}

// =============== MESSAGE RENDERING ===============

function addMessageToPage(msg, isPersonal = false, time = new Date()) {
    addDateSeparator(time);

    const message = $('<div class="msg"></div>').text(msg);

    if (isPersonal) {
        message.addClass('msg-personal');
    } else {
        const figure = $('<figure class="avatar"></figure>');
        const image = $('<img>').attr('src', avatarImage);
        figure.append(image);
        message.addClass('new').prepend(figure);
    }

    $('.mCSB_container').append(message);
    addTimestamp(time);
    updateScrollbar();
}

// =============== TYPING / INPUT ===============

function updateTypingStats() {
    const text = messageInput.val();
    const length = text.length;

    if (length > 0 && !typingStartTime) {
        typingStartTime = Date.now();
    }

    if (length === 0) {
        typingStartTime = null;
        typingStats.text('');
        return;
    }

    const elapsedSec = (Date.now() - typingStartTime) / 1000;
    if (elapsedSec > 0.5) {
        const cps = length / elapsedSec;
        typingStats.text(`Typing speed: ${cps.toFixed(1)} chars/sec`);
    }
}

function resetTypingStats() {
    typingStartTime = null;
    typingStats.text('');
}

// =============== SENDING / BOT LOGIC ===============

function insertMessage() {
    const messageText = messageInput.val().trim();
    if (messageText === '') {
        return false;
    }

    // Show user message
    addMessageToPage(messageText, true);
    lastUserMessageText = messageText;

    // Reset input & typing stats
    messageInput.val('');
    resetTypingStats();

    // Handle commands
    if (messageText[0] === '/') {
        handleCommand(messageText);
        return false;
    }

    // Normal bot reply
    setTimeout(fakeMessage, 800 + Math.random() * 800);
    return false;
}

function handleCommand(cmd) {
    const c = cmd.toLowerCase();

    if (c === '/help') {
        addMessageToPage(
            'Commands:\n/help – show this help\n/about – about Edrees Bot\n/github – my GitHub profile\n/skills – short list of my skills',
            false
        );
    } else if (c === '/about') {
        addMessageToPage(
            'I am Edrees Bot, a fake chat built by Edrees to practice HTML/CSS/JS and UI design.',
            false
        );
    } else if (c === '/github') {
        addMessageToPage(
            'You can view my projects on GitHub: https://github.com/idriexs',
            false
        );
    } else if (c === '/skills') {
        addMessageToPage(
            'Skills: Web development basics, .NET / MAUI, Python & machine learning, microcontroller projects, and more 🚀',
            false
        );
    } else {
        addMessageToPage('Unknown command. Type /help to see available commands.', false);
    }
}

function getBotReply(text) {
    const t = text.toLowerCase();

    if (t.includes('who are you') || t.includes('kimsin') || t.includes('neresin')) {
        return "I'm Edrees Bot, a friendly assistant created by Edrees.";
    }
    if (t.includes('project') || t.includes('proje')) {
        return 'This fake chat project is for practicing UI, JavaScript, and creative design.';
    }
    if (t.includes('github')) {
        return 'Here is my GitHub: https://github.com/idriexs . You will find several projects there.';
    }
    if (t.includes('hello') || t.includes('hi') || t.includes('selam')) {
        return 'Hello! 👋 How is your day going?';
    }
    if (t.includes('thanks') || t.includes('teşekkür')) {
        return 'You are welcome! I am happy to help 😊';
    }
    if (t.includes('bye') || t.includes('görüşürüz')) {
        return 'Bye! Come back anytime to chat.';
    }

    // fallback random message
    const msg = fakeMessages[fakeIndex % fakeMessages.length];
    fakeIndex += 1;
    return msg;
}

function fakeMessage() {
    if (messageInput.val() !== '') {
        return false;
    }

    const loadingMessage = $('<div class="msg loading new"></div>');
    const figure = $('<figure class="avatar"></figure>');
    const image = $('<img>').attr('src', avatarImage);
    figure.append(image);

    const dotsSpan = $('<span></span>');
    const label = $('<div class="typing-label"></div>').text('Edrees is typing...');

    loadingMessage.append(figure).append(dotsSpan).append(label);
    $('.mCSB_container').append(loadingMessage);
    updateScrollbar();

    setTimeout(function () {
        loadingMessage.remove();
        const botReply = getBotReply(lastUserMessageText);
        addMessageToPage(botReply, false);
    }, 1000 + Math.random() * 1000);
}
