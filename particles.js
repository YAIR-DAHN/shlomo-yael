// ============================================
// ✨ Particle System - Hearts & Sparkles
// ============================================

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        const types = ['heart', 'sparkle', 'circle'];
        const type = types[Math.floor(Math.random() * types.length)];
        return {
            x: Math.random() * this.canvas.width,
            y: this.canvas.height + 20,
            size: Math.random() * 14 + 5,
            speedY: -(Math.random() * 0.8 + 0.3),
            speedX: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.4 + 0.1,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            type,
            color: this.getRandomColor(),
            life: 0,
            maxLife: Math.random() * 350 + 200
        };
    }

    getRandomColor() {
        const colors = ['#c9a96e', '#e8b4b8', '#9b72cf', '#e8d5a3', '#f5c6cb', '#ffffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    drawHeart(x, y, size, color, opacity, rotation) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate((rotation * Math.PI) / 180);
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        const s = size / 2;
        this.ctx.moveTo(0, s * 0.3);
        this.ctx.bezierCurveTo(-s, -s * 0.5, -s, s * 0.5, 0, s);
        this.ctx.bezierCurveTo(s, s * 0.5, s, -s * 0.5, 0, s * 0.3);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawSparkle(x, y, size, color, opacity, rotation) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate((rotation * Math.PI) / 180);
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = color;
        const s = size / 2;
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(angle - 0.15) * s * 0.3, Math.sin(angle - 0.15) * s * 0.3);
            this.ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
            this.ctx.lineTo(Math.cos(angle + 0.15) * s * 0.3, Math.sin(angle + 0.15) * s * 0.3);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    drawCircle(x, y, size, color, opacity) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size / 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (Math.random() < 0.06) this.particles.push(this.createParticle());
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;
            p.life++;
            const lifeRatio = p.life / p.maxLife;
            const alpha = lifeRatio > 0.7 ? p.opacity * (1 - (lifeRatio - 0.7) / 0.3) : p.opacity;
            if (p.type === 'heart') this.drawHeart(p.x, p.y, p.size, p.color, alpha, p.rotation);
            else if (p.type === 'sparkle') this.drawSparkle(p.x, p.y, p.size, p.color, alpha, p.rotation);
            else this.drawCircle(p.x, p.y, p.size, p.color, alpha);
            if (p.life >= p.maxLife || p.y < -20) this.particles.splice(i, 1);
        }
        if (this.particles.length > 80) this.particles = this.particles.slice(-60);
        this.animationId = requestAnimationFrame(() => this.update());
    }

    start() { this.update(); }
    stop() { if (this.animationId) cancelAnimationFrame(this.animationId); }
}

// ============================================
// 🎊 Confetti System - For Day 0
// ============================================

class ConfettiSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.confetti = [];
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createConfetti() {
        const colors = ['#c9a96e','#e8b4b8','#9b72cf','#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff922b'];
        return {
            x: Math.random() * this.canvas.width,
            y: -10,
            size: Math.random() * 8 + 4,
            speedY: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
            wobble: Math.random() * 10,
            wobbleSpeed: Math.random() * 0.1 + 0.05
        };
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < 3; i++) {
            if (Math.random() < 0.4) this.confetti.push(this.createConfetti());
        }
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const c = this.confetti[i];
            c.wobble += c.wobbleSpeed;
            c.x += c.speedX + Math.sin(c.wobble) * 2;
            c.y += c.speedY;
            c.rotation += c.rotationSpeed;
            this.ctx.save();
            this.ctx.translate(c.x, c.y);
            this.ctx.rotate((c.rotation * Math.PI) / 180);
            this.ctx.fillStyle = c.color;
            this.ctx.globalAlpha = 0.8;
            if (c.shape === 'rect') this.ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
            else { this.ctx.beginPath(); this.ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2); this.ctx.fill(); }
            this.ctx.restore();
            if (c.y > this.canvas.height + 10) this.confetti.splice(i, 1);
        }
        if (this.confetti.length > 300) this.confetti = this.confetti.slice(-200);
        this.animationId = requestAnimationFrame(() => this.update());
    }

    start() { this.canvas.classList.remove('hidden'); this.update(); }
    stop() { if (this.animationId) cancelAnimationFrame(this.animationId); }
}
