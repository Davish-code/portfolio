/* ===== PARTICLE BACKGROUND ===== */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();
window.addEventListener('resize', initParticles);

function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(6,182,212,${0.08 * (1 - dist / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ===== TYPING EFFECT ===== */
const titles = ['Developer', 'ECE Engineer', 'AI Enthusiast', 'Problem Solver', 'Web Developer'];
let titleIdx = 0, charIdx = 0, isDeleting = false;
const typedEl = document.getElementById('typed-text');

function type() {
    const current = titles[titleIdx];
    typedEl.textContent = current.substring(0, charIdx);
    if (!isDeleting) {
        charIdx++;
        if (charIdx > current.length) { isDeleting = true; setTimeout(type, 1800); return; }
        setTimeout(type, 80);
    } else {
        charIdx--;
        if (charIdx < 0) { isDeleting = false; titleIdx = (titleIdx + 1) % titles.length; setTimeout(type, 400); return; }
        setTimeout(type, 40);
    }
}
type();

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('.section, #hero');
const navLinks = document.querySelectorAll('.nav-links a');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 60);
    backToTop.classList.toggle('visible', scrollY > 500);

    // active link
    let current = '';
    sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        if (scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
});

/* ===== MOBILE MENU ===== */
const menuToggle = document.getElementById('menu-toggle');
const navLinksContainer = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinksContainer.classList.toggle('open');
});
navLinksContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinksContainer.classList.remove('open');
    });
});

/* ===== SCROLL ANIMATIONS ===== */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Skill bars
            entry.target.querySelectorAll('.skill-fill').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.anim-fade-up').forEach(el => observer.observe(el));

/* ===== STAT COUNTER ===== */
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-number').forEach(num => {
                const target = +num.dataset.target;
                let current = 0;
                const step = Math.ceil(target / 40);
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) { current = target; clearInterval(timer); }
                    num.textContent = current;
                }, 40);
            });
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const aboutStats = document.querySelector('.about-stats');
if (aboutStats) statObserver.observe(aboutStats);

/* ===== PROJECT FILTER ===== */
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.project-card').forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

/* ===== CONTACT FORM ===== */
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('.btn-submit span');
    const icon = form.querySelector('.btn-submit i');
    btn.textContent = 'Sending...';
    icon.className = 'fas fa-spinner fa-spin';

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: new FormData(form)
        });
        const data = await response.json();
        if (data.success) {
            btn.textContent = 'Message Sent!';
            icon.className = 'fas fa-check';
            form.reset();
        } else {
            btn.textContent = 'Failed. Try again';
            icon.className = 'fas fa-times';
        }
    } catch (error) {
        btn.textContent = 'Failed. Try again';
        icon.className = 'fas fa-times';
    }
    setTimeout(() => {
        btn.textContent = 'Send Message';
        icon.className = 'fas fa-paper-plane';
    }, 3000);
});

/* ===== COPY EMAIL ===== */
function copyEmail(e) {
    e.preventDefault();
    navigator.clipboard.writeText('davishtalreja13@gmail.com');
    const tooltip = e.currentTarget.querySelector('.copy-tooltip');
    tooltip.classList.add('show');
    setTimeout(() => tooltip.classList.remove('show'), 1500);
}

/* ===== BACK TO TOP ===== */
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});
