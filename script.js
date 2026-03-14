// Global variables
let currentAudio = null;
let floatingHearts = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Create floating hearts
    createFloatingHearts();

    // Initialize video interactions
    initializeVideoInteractions();

    // Add fade-in animations
    addFadeInAnimations();

    // Make images pop out on hover (cursor over photo)
    setupHoverPopOut();

    // Align images so faces stay visible in their cards
    centerFacesInImages();

    // Check if music should be playing (from previous pages)
    if (localStorage.getItem('musicPlaying') === 'true') {
        playBackgroundMusic();
    }

    // Auto-play background music on first interaction only on index.html
    if (window.location.pathname.includes('index.html')) {
        document.addEventListener('click', playBackgroundMusic, { once: true });
    } else {
        // For other pages, start music immediately if not already playing
        const music = document.getElementById('music');
        if (music && music.paused) {
            music.volume = 0.3;
            music.play().catch(e => console.log('Audio play failed:', e));
            localStorage.setItem('musicPlaying', 'true');
        }
    }
}

function createFloatingHearts() {
    const heartEmojis = ['💖', '💕', '💗', '💓', '💘', '💝', '💞', '💟'];

    setInterval(() => {
        if (floatingHearts.length < 10) {
            createHeart(heartEmojis[Math.floor(Math.random() * heartEmojis.length)]);
        }
    }, 2000);
}

function createHeart(emoji) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = emoji;
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    heart.style.fontSize = (Math.random() * 20 + 20) + 'px';

    document.body.appendChild(heart);
    floatingHearts.push(heart);

    // Remove heart after animation
    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
            floatingHearts = floatingHearts.filter(h => h !== heart);
        }
    }, 6000);
}

function initializeVideoInteractions() {
    const videoElements = document.querySelectorAll('.memory-video');

    videoElements.forEach(video => {
        const playButton = video.parentElement.querySelector('.play-button');

        if (playButton) {
            playButton.addEventListener('click', () => {
                toggleVideoPlayback(video);
            });
        }

        video.addEventListener('click', () => {
            toggleVideoPlayback(video);
        });

        video.addEventListener('play', () => {
            updatePlayButton(video, true);
        });

        video.addEventListener('pause', () => {
            updatePlayButton(video, false);
        });

        video.addEventListener('ended', () => {
            updatePlayButton(video, false);
        });
    });
}

function toggleVideoPlayback(video) {
    if (video.paused) {
        // Pause any other playing videos
        document.querySelectorAll('.memory-video').forEach(v => {
            if (v !== video && !v.paused) {
                v.pause();
            }
        });
        video.play();
    } else {
        video.pause();
    }
}

function updatePlayButton(video, isPlaying) {
    const playButton = video.parentElement.querySelector('.play-button');
    if (playButton) {
        playButton.textContent = isPlaying ? '⏸️' : '▶️';
    }
}

function addFadeInAnimations() {
    const memoryCards = document.querySelectorAll('.memory-card');

    memoryCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';

        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function setupHoverPopOut() {
    const images = document.querySelectorAll('.memory-image');

    images.forEach(img => {
        img.style.transition = 'transform 0.25s ease, filter 0.25s ease';

        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.08)';
            img.style.filter = 'brightness(1.05)';
        });

        img.addEventListener('mouseleave', () => {
            img.style.transform = '';
            img.style.filter = '';
        });
    });
}

async function centerFacesInImages() {
    if (!('FaceDetector' in window)) {
        // FaceDetector API not supported; skip face centering.
        return;
    }

    const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    const images = Array.from(document.querySelectorAll('.memory-image'));

    await Promise.all(images.map(async img => {
        if (!img.complete) {
            await new Promise(resolve => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        }

        try {
            const faces = await detector.detect(img);
            if (!faces || faces.length === 0) return;

            const face = faces[0].boundingBox;
            const centerX = face.x + face.width / 2;
            const centerY = face.y + face.height / 2;

            const xPercent = Math.min(100, Math.max(0, (centerX / img.naturalWidth) * 100));
            const yPercent = Math.min(100, Math.max(0, (centerY / img.naturalHeight) * 100));

            img.style.objectPosition = `${xPercent}% ${yPercent}%`;
        } catch (error) {
            // If face detection fails for a given image, ignore and leave default centering.
            console.warn('Face detection error:', error);
        }
    }));
}

function nextPage(pageUrl) {
    // Add transition effect
    document.body.style.opacity = '0';
    document.body.style.transform = 'scale(0.95)';

    setTimeout(() => {
        window.location.href = pageUrl;
    }, 300);
}

function playBackgroundMusic() {
    const music = document.getElementById('music');
    if (music && music.paused) {
        music.volume = 0.3;
        music.play().catch(e => {
            console.log('Audio play failed:', e);
        });
        localStorage.setItem('musicPlaying', 'true');
    }
}

function playMusic() {
    const music = document.getElementById('music');
    if (music) {
        if (music.paused) {
            music.volume = 0.5;
            music.play();
            localStorage.setItem('musicPlaying', 'true');
        } else {
            music.pause();
            localStorage.setItem('musicPlaying', 'false');
        }
    }
}

// Add smooth scrolling for navigation links
document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        // Navigate to next page (simplified - you might want to implement proper navigation)
        const nextButton = document.querySelector('button[onclick*="nextPage"]');
        if (nextButton) {
            nextButton.click();
        }
    }
});

// Add touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX - touchEndX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe left - next page
            const nextButton = document.querySelector('button[onclick*="nextPage"]');
            if (nextButton) {
                nextButton.click();
            }
        } else {
            // Swipe right - previous page (if implemented)
            // You could add previous page navigation here
        }
    }
}
