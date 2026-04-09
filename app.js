// ============================================
// 🎉 Wedding Countdown App - Main Logic
// ============================================

(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);
    let currentDay = null;
    let particleSystem = null;
    let confettiSystem = null;
    let audio = null;
    let isPlaying = false;

    // ===== Init =====
    document.addEventListener('DOMContentLoaded', () => {
        applyTheme();
        calculateCurrentDay();

        if (CONFIG.passwordProtection) {
            showPassword();
        } else {
            initApp();
        }
    });

    function applyTheme() {
        const r = document.documentElement;
        const c = CONFIG.colors;
        Object.entries({
            '--color-primary': c.primary,
            '--color-primary-light': c.primaryLight,
            '--color-secondary': c.secondary,
            '--color-accent': c.accent,
            '--color-bg': c.background,
            '--color-bg-light': c.backgroundLight,
            '--color-card-bg': c.cardBg,
            '--color-card-border': c.cardBorder,
            '--color-text': c.text,
            '--color-text-secondary': c.textSecondary,
        }).forEach(([k, v]) => r.style.setProperty(k, v));
    }

    function calculateCurrentDay() {
        const now = new Date();
        const wedding = new Date(CONFIG.weddingDate);
        // Reset hours to compare dates only
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const wedDate = new Date(wedding.getFullYear(), wedding.getMonth(), wedding.getDate());
        const diffDays = Math.ceil((wedDate - nowDate) / (1000 * 60 * 60 * 24));

        if (diffDays > CONFIG.countdownDays) {
            currentDay = -1; // before countdown
        } else if (diffDays <= 0) {
            currentDay = 0; // wedding day or after
        } else {
            currentDay = diffDays;
        }
    }

    // ===== Password =====
    function showPassword() {
        $('password-overlay').classList.remove('hidden');
        $('password-submit').addEventListener('click', checkPassword);
        $('password-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }

    function checkPassword() {
        const input = $('password-input');
        if (input.value === CONFIG.password) {
            $('password-overlay').classList.add('fade-out');
            setTimeout(() => {
                $('password-overlay').classList.add('hidden');
                initApp();
            }, 600);
        } else {
            input.classList.add('shake');
            $('password-error').textContent = CONFIG.texts.passwordError;
            setTimeout(() => input.classList.remove('shake'), 500);
        }
    }

    // ===== Main App =====
    function initApp() {
        const app = $('app');
        app.classList.remove('hidden');

        // Set header info
        $('groom-name').textContent = CONFIG.groomName;
        $('bride-name').textContent = CONFIG.brideName;
        $('hebrew-date').textContent = CONFIG.hebrewDate;
        $('gregorian-date').textContent = CONFIG.gregorianDate;
        $('countdown-title').textContent = CONFIG.texts.countdownTitle;
        document.title = `${CONFIG.groomName} & ${CONFIG.brideName} - ${CONFIG.texts.siteTitle}`;

        // Start particles
        particleSystem = new ParticleSystem('particles-canvas');
        particleSystem.start();

        // Countdown timer
        updateCountdown();
        setInterval(updateCountdown, 1000);

        // Show content based on current day
        if (currentDay === -1) {
            showBeforeCountdown();
        } else if (currentDay === 0) {
            showWeddingDay();
        } else {
            showDailyContent();
        }

        // Build gallery
        buildGallery();

        // Setup contact popup
        setupContactPopup();

        // Fade in
        setTimeout(() => app.classList.add('visible'), 100);
    }

    // ===== Countdown =====
    function updateCountdown() {
        const now = new Date();
        const wedding = new Date(CONFIG.weddingDate);
        const diff = wedding - now;

        if (diff <= 0) {
            ['days', 'hours', 'minutes', 'seconds'].forEach((id) => {
                $(id).textContent = '00';
            });
            return;
        }

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        $('days').textContent = String(d).padStart(2, '0');
        $('hours').textContent = String(h).padStart(2, '0');
        $('minutes').textContent = String(m).padStart(2, '0');
        $('seconds').textContent = String(s).padStart(2, '0');
    }

    // ===== Before Countdown =====
    function showBeforeCountdown() {
        $('daily-section').classList.add('hidden');
        $('music-section').classList.add('hidden');
        $('before-section').classList.remove('hidden');
        $('before-text').textContent = CONFIG.texts.beforeCountdown;
    }

    // ===== Wedding Day =====
    function showWeddingDay() {
        // Show special content
        $('day-number').textContent = '0';
        showDailyContent();

        // Start confetti
        confettiSystem = new ConfettiSystem('confetti-canvas');
        confettiSystem.start();

        // Add special banner class
        const badge = document.querySelector('.day-badge');
        if (badge) {
            badge.style.background = 'linear-gradient(135deg, #ffd700, #ff69b4, #9b72cf)';
            badge.style.animation = 'badgePulse 1.5s ease-in-out infinite';
        }
    }

    // ===== Daily Content =====
    function showDailyContent() {
        const day = currentDay;
        $('day-number').textContent = day;

        // Photo
        const ext = CONFIG.photoExtensions[day] || 'jpg';
        const photoSrc = `${CONFIG.photosPath}${day}.${ext}`;
        const photo = $('daily-photo');
        photo.src = photoSrc;
        photo.alt = `יום ${day}`;

        photo.onload = () => {
            // Check if already revealed today
            const lastSeen = localStorage.getItem('lastSeenDay');
            if (lastSeen === String(day)) {
                // Already seen - show directly
                revealPhotoInstant();
            } else {
                // First time - show with animation
                setupRevealAnimation(day);
            }
        };

        photo.onerror = () => {
            photo.src = '';
            revealPhotoInstant();
        };

        // Blessing
        const blessing = CONFIG.blessings[day] || '';
        $('blessing-text').textContent = blessing;

        // Music
        setupMusic(day);
    }

    function setupRevealAnimation(day) {
        const cover = $('reveal-cover');
        const coverText = $('cover-text');
        coverText.textContent = CONFIG.texts.revealText;

        cover.addEventListener('click', () => {
            cover.classList.add('revealed');
            localStorage.setItem('lastSeenDay', String(day));
            setTimeout(() => {
                $('daily-photo').classList.add('visible');
                $('reveal-container').classList.add('photo-revealed');
                $('blessing-card').classList.add('visible');
            }, 300);
        }, { once: true });
    }

    function revealPhotoInstant() {
        const cover = $('reveal-cover');
        cover.classList.add('hidden');
        $('daily-photo').classList.add('visible');
        $('reveal-container').classList.add('photo-revealed');
        $('blessing-card').classList.add('visible');
    }

    // ===== Music =====
    function setupMusic(day) {
        audio = $('audio-player');
        const musicSrc = `${CONFIG.musicPath}${day}.${CONFIG.musicExtension}`;
        audio.src = musicSrc;

        const playBtn = $('play-btn');
        const playIcon = $('play-icon');
        const pauseIcon = $('pause-icon');
        const progressBar = $('progress-bar');
        const progressContainer = $('progress-container');
        const visualizer = $('visualizer');
        const currentTimeEl = $('current-time');
        const totalTimeEl = $('total-time');
        const songTitle = $('song-title');

        songTitle.textContent = `🎵 שיר ליום ${day}`;

        // Handle music not found
        audio.onerror = () => {
            songTitle.textContent = '🎵 השיר יתווסף בקרוב...';
            playBtn.style.opacity = '0.4';
            playBtn.style.cursor = 'default';
        };

        audio.onloadedmetadata = () => {
            totalTimeEl.textContent = formatTime(audio.duration);
        };

        audio.ontimeupdate = () => {
            if (audio.duration) {
                const pct = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = pct + '%';
                currentTimeEl.textContent = formatTime(audio.currentTime);
            }
        };

        audio.onended = () => {
            isPlaying = false;
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            visualizer.classList.remove('playing');
            progressBar.style.width = '0%';
        };

        playBtn.addEventListener('click', () => {
            if (audio.error || !audio.src) return;
            if (isPlaying) {
                audio.pause();
                isPlaying = false;
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                visualizer.classList.remove('playing');
            } else {
                audio.play().then(() => {
                    isPlaying = true;
                    playIcon.classList.add('hidden');
                    pauseIcon.classList.remove('hidden');
                    visualizer.classList.add('playing');
                }).catch(() => {
                    songTitle.textContent = '🎵 לחצי שוב להפעלה';
                });
            }
        });

        // Click on progress bar to seek
        progressContainer.addEventListener('click', (e) => {
            if (!audio.duration) return;
            const rect = progressContainer.getBoundingClientRect();
            // RTL aware - calculate from right
            const clickX = e.clientX - rect.left;
            const pct = clickX / rect.width;
            audio.currentTime = pct * audio.duration;
        });
    }

    function formatTime(s) {
        if (!s || isNaN(s)) return '0:00';
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    // ===== Gallery =====
    function buildGallery() {
        const container = $('gallery-scroll');
        if (!container) return;
        container.innerHTML = '';

        // Build from day 30 down to 0 (right to left for RTL)
        for (let day = CONFIG.countdownDays; day >= 0; day--) {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            if (currentDay === -1) {
                // Before countdown - all locked
                item.classList.add('locked');
                item.innerHTML = `
                    <div class="gallery-lock">🔒</div>
                    <span class="gallery-day-label">יום ${day}</span>
                `;
            } else if (day < currentDay) {
                // Future day (fewer days left = hasn't happened yet) - locked
                item.classList.add('locked');
                item.innerHTML = `
                    <div class="gallery-lock">🔒</div>
                    <span class="gallery-day-label">יום ${day}</span>
                `;
            } else if (day === currentDay) {
                // Current day
                item.classList.add('current');
                const ext = CONFIG.photoExtensions[day] || 'jpg';
                item.innerHTML = `
                    <img src="${CONFIG.photosPath}${day}.${ext}" class="gallery-thumb" alt="יום ${day}" onerror="this.style.display='none'">
                    <span class="gallery-day-label">היום ✨</span>
                `;
            } else {
                // Past day (more days left = already happened) - unlocked
                const ext = CONFIG.photoExtensions[day] || 'jpg';
                item.innerHTML = `
                    <img src="${CONFIG.photosPath}${day}.${ext}" class="gallery-thumb" alt="יום ${day}" onerror="this.style.display='none'">
                    <span class="gallery-day-label">יום ${day}</span>
                `;
                item.addEventListener('click', () => openModal(day));
            }

            container.appendChild(item);
        }

        // Scroll to current day
        setTimeout(() => {
            const currentItem = container.querySelector('.current');
            if (currentItem) {
                currentItem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }, 500);
    }

    // ===== Modal =====
    function openModal(day) {
        const modal = $('photo-modal');
        const ext = CONFIG.photoExtensions[day] || 'jpg';
        $('modal-photo').src = `${CONFIG.photosPath}${day}.${ext}`;
        $('modal-day-badge').textContent = `יום ${day}`;
        $('modal-blessing').textContent = CONFIG.blessings[day] || '';
        modal.classList.remove('hidden');

        $('modal-close').addEventListener('click', () => modal.classList.add('hidden'), { once: true });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        }, { once: true });
    }

    // ===== Contact Popup =====
    function setupContactPopup() {
        const popup = $('contact-popup');
        const ydLink = document.querySelector('.yd-link');
        const closeBtn = $('contact-close');

        if (ydLink) {
            ydLink.addEventListener('click', () => {
                popup.classList.remove('hidden');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                popup.classList.add('hidden');
            });
        }

        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) popup.classList.add('hidden');
            });
        }
    }

    // ===== Service Worker (PWA) =====
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        });
    }
})();
