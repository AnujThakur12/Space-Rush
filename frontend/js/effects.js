class SkyEffects {
    constructor() {
        this.particles = [];
        this.trails = [];
        this.flashes = [];
        this.floatingTexts = [];
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.hitStopTimer = 0;
        this._particlePool = [];
    }

    _getParticle() {
        return this._particlePool.pop() || {};
    }

    _recycleParticle(p) {
        if (this._particlePool.length < 500) {
            this._particlePool.push(p);
        }
    }

    update(dt) {
        if (this.hitStopTimer > 0) {
            this.hitStopTimer -= dt;
            return;
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += (p.gravity || 0) * dt;
            p.life -= dt;
            p.alpha = Math.max(0, p.life / p.maxLife);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                this._recycleParticle(p);
            }
        }

        for (let i = this.trails.length - 1; i >= 0; i--) {
            const t = this.trails[i];
            t.life -= dt;
            t.alpha = Math.max(0, t.life / t.maxLife);
            if (t.life <= 0) {
                this.trails.splice(i, 1);
            }
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.speed * dt;
            ft.life -= dt;
            ft.alpha = Math.max(0, ft.life / ft.maxLife);
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        for (let i = this.flashes.length - 1; i >= 0; i--) {
            this.flashes[i].life -= dt;
            if (this.flashes[i].life <= 0) {
                this.flashes.splice(i, 1);
            }
        }

        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }
    }

    _allocParticle(x, y, vx, vy, life, maxLife, size, color, gravity) {
        const p = this._getParticle();
        p.x = x; p.y = y;
        p.vx = vx; p.vy = vy;
        p.life = life; p.maxLife = maxLife;
        p.alpha = 1;
        p.size = size;
        p.color = color;
        p.gravity = gravity || 0;
        this.particles.push(p);
        return p;
    }

    emitExplosion(x, y, count, color, size, big) {
        const colors = color || ['#ff4400', '#ff8800', '#ffcc00', '#ffffff'];
        const cArr = Array.isArray(colors) ? colors : [colors];
        const n = count || 20;
        for (let i = 0; i < n; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (50 + Math.random() * 150) * (big ? 1.5 : 1);
            this._allocParticle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.4 + Math.random() * 0.4, 0.8,
                (size || 3) * (0.5 + Math.random()) * (big ? 1.5 : 1),
                cArr[Math.floor(Math.random() * cArr.length)],
                big ? 30 : 0
            );
        }
        if (big) {
            for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 20 + Math.random() * 60;
                this._allocParticle(
                    x, y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    0.8 + Math.random() * 0.6, 1.4,
                    6 + Math.random() * 8,
                    '#888888', 20
                );
            }
        }
    }

    emitEngineTrail(x, y, dir, color) {
        for (let i = 0; i < 2; i++) {
            this._allocParticle(
                x + (Math.random() - 0.5) * 4,
                y + (dir || -1) * 20,
                (Math.random() - 0.5) * 10,
                (dir || -1) * (80 + Math.random() * 60),
                0.2 + Math.random() * 0.2, 0.4,
                2 + Math.random() * 2,
                color || '#ff6600', 0
            );
        }
    }

    emitBulletTrail(x, y, color) {
        this.trails.push({
            x, y,
            life: 0.15,
            maxLife: 0.15,
            alpha: 1,
            color: color || '#ffff00'
        });
    }

    addFloatingText(x, y, text, color, size) {
        this.floatingTexts.push({
            x, y,
            text,
            color: color || '#ffffff',
            size: size || 14,
            speed: -60,
            life: 1,
            maxLife: 1,
            alpha: 1
        });
    }

    triggerHitStop(duration) {
        this.hitStopTimer = duration || 0.05;
    }

    addScreenFlash(x, y, color, duration) {
        this.flashes.push({
            x, y,
            life: duration || 0.15,
            maxLife: duration || 0.15,
            color: color || '#ffffff'
        });
    }

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
    }

    getShakeOffset() {
        if (this.shakeTimer <= 0) return { x: 0, y: 0 };
        const factor = this.shakeTimer / this.shakeDuration;
        const intensity = this.shakeIntensity * factor;
        return {
            x: (Math.random() - 0.5) * intensity * 2,
            y: (Math.random() - 0.5) * intensity * 2
        };
    }

    render(ctx) {
        const shake = this.getShakeOffset();

        for (const flash of this.flashes) {
            const alpha = flash.life / flash.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha * 0.3;
            ctx.fillStyle = flash.color;
            const size = 100 * (1 - alpha) + 20;
            ctx.beginPath();
            ctx.arc(flash.x, flash.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        for (const t of this.trails) {
            ctx.save();
            ctx.globalAlpha = t.alpha * 0.5;
            ctx.fillStyle = t.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = t.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x + shake.x, p.y + shake.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        for (const ft of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.fillStyle = ft.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#000000';
            ctx.font = `bold ${ft.size}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ft.text, ft.x + shake.x, ft.y + shake.y);
            ctx.restore();
        }
    }

    clear() {
        for (const p of this.particles) this._recycleParticle(p);
        this.particles = [];
        this.trails = [];
        this.flashes = [];
        this.floatingTexts = [];
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.hitStopTimer = 0;
    }
}

window.SkyEffects = SkyEffects;
