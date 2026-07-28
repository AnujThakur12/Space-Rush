class SkyControls {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.touches = {};
        this.joystick = { active: false, x: 0, y: 0, dx: 0, dy: 0, targetDx: 0, targetDy: 0 };
        this.firePressed = false;
        this.fireTouchId = null;
        this.pausePressed = false;
        this.joystickTouchId = null;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickRadius = 75;
        this.joystickBaseRadius = 75;
        this.mobile = false;
        this.autoFire = true;
        this.joystickMode = 'dynamic';
        this.joystickOpacity = 0.4;
        this.joystickSensitivity = 1;
        this.touchSmoothX = 0;
        this.touchSmoothY = 0;
        this.aimAssistStrength = 0.3;
        this.smoothFactor = 0;
        this._prevTime = 0;

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchMove = this._onTouchMove.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);

        this._addListeners();
        this._detectMobile();
        this._loadSettings();
    }

    _loadSettings() {
        try {
            const storage = window.SkyStorage ? new window.SkyStorage() : null;
            if (storage) {
                const s = storage.getSettings();
                this.joystickMode = s.joystickMode || 'dynamic';
                this.joystickOpacity = s.joystickOpacity || 0.4;
                this.joystickSensitivity = s.joystickSensitivity || 1;
                this.autoFire = s.autoFire !== undefined ? s.autoFire : true;
                this.aimAssistStrength = s.aimAssist || 0.3;
            }
        } catch (e) {}
    }

    _detectMobile() {
        this.mobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (this.mobile) this.autoFire = true;
    }

    _addListeners() {
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });
        this.canvas.addEventListener('touchcancel', this._onTouchEnd, { passive: false });
        this.canvas.addEventListener('mousedown', this._onMouseDown);
        document.addEventListener('mouseup', this._onMouseUp);
        document.addEventListener('mouseleave', this._onMouseUp);
    }

    removeListeners() {
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        this.canvas.removeEventListener('touchstart', this._onTouchStart);
        this.canvas.removeEventListener('touchmove', this._onTouchMove);
        this.canvas.removeEventListener('touchend', this._onTouchEnd);
        this.canvas.removeEventListener('touchcancel', this._onTouchEnd);
        this.canvas.removeEventListener('mousedown', this._onMouseDown);
        document.removeEventListener('mouseup', this._onMouseUp);
        document.removeEventListener('mouseleave', this._onMouseUp);
    }

    _onKeyDown(e) {
        this.keys[e.key] = true;
        if (e.key === 'p' || e.key === 'P') {
            this.pausePressed = true;
        }
        if (e.key === ' ') {
            e.preventDefault();
        }
    }

    _onKeyUp(e) {
        this.keys[e.key] = false;
    }

    _onMouseDown(e) {
        if (e.button === 0) this.firePressed = true;
    }

    _onMouseUp(e) {
        if (e.button === 0) this.firePressed = false;
    }

    _toCanvasCoords(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) * (this.canvas.width / rect.width),
            y: (clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    _onTouchStart(e) {
        for (const touch of e.changedTouches) {
            const { x, y } = this._toCanvasCoords(touch.clientX, touch.clientY);
            const w = this.canvas.width;
            const h = this.canvas.height;

            if (this.joystickMode === 'dynamic' && x < w * 0.5 && !this.joystick.active) {
                const baseR = this.joystickRadius * (w / 1600);
                this.joystickCenter.x = Math.min(x, w * 0.42);
                this.joystickCenter.y = Math.min(y, h - baseR - 20);
                this.joystickRadius = baseR;
                this.joystickTouchId = touch.identifier;
                this.joystick.active = true;
                this.joystick.x = this.joystickCenter.x;
                this.joystick.y = this.joystickCenter.y;
                this.joystick.dx = 0;
                this.joystick.dy = 0;
                this.joystick.targetDx = 0;
                this.joystick.targetDy = 0;
                this.touchSmoothX = 0;
                this.touchSmoothY = 0;
                this.smoothFactor = 0;
                continue;
            }

            if (this.joystickMode === 'fixed' && x < w * 0.4) {
                const baseR = this.joystickRadius * (w / 1600);
                this.joystickCenter.x = w * 0.12;
                this.joystickCenter.y = h * 0.82;
                this.joystickRadius = baseR;
                this.joystickTouchId = touch.identifier;
                this.joystick.active = true;
                this.joystick.x = this.joystickCenter.x;
                this.joystick.y = this.joystickCenter.y;
                this.joystick.dx = 0;
                this.joystick.dy = 0;
                this.joystick.targetDx = 0;
                this.joystick.targetDy = 0;
                this.touchSmoothX = 0;
                this.touchSmoothY = 0;
                this.smoothFactor = 0;
                continue;
            }

            if (x > w * 0.6 && y > h * 0.65) {
                this.firePressed = true;
                this.fireTouchId = touch.identifier;
            }

            if (x < w * 0.06 && y < h * 0.07) {
                this.pausePressed = true;
            }
        }
    }

    _onTouchMove(e) {
        for (const touch of e.changedTouches) {
            const { x, y } = this._toCanvasCoords(touch.clientX, touch.clientY);

            if (touch.identifier === this.joystickTouchId && this.joystick.active) {
                const dx = x - this.joystickCenter.x;
                const dy = y - this.joystickCenter.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = this.joystickRadius;
                let clampedX = x;
                let clampedY = y;
                if (dist > maxDist) {
                    clampedX = this.joystickCenter.x + (dx / dist) * maxDist;
                    clampedY = this.joystickCenter.y + (dy / dist) * maxDist;
                }
                this.joystick.x = clampedX;
                this.joystick.y = clampedY;
                this.joystick.targetDx = (clampedX - this.joystickCenter.x) / maxDist;
                this.joystick.targetDy = (clampedY - this.joystickCenter.y) / maxDist;
            }

            if (touch.identifier === this.fireTouchId) {
                const w = this.canvas.width;
                if (x < w * 0.5) {
                    this.firePressed = false;
                    this.fireTouchId = null;
                }
            }
        }
    }

    _onTouchEnd(e) {
        for (const touch of e.changedTouches) {
            if (touch.identifier === this.joystickTouchId) {
                this.joystickTouchId = null;
                this.joystick.active = false;
                this.joystick.dx = 0;
                this.joystick.dy = 0;
                this.joystick.targetDx = 0;
                this.joystick.targetDy = 0;
                this.touchSmoothX = 0;
                this.touchSmoothY = 0;
            }
            if (touch.identifier === this.fireTouchId) {
                this.fireTouchId = null;
                this.firePressed = false;
            }
        }
    }

    isDown(key) {
        return !!this.keys[key];
    }

    getMovement() {
        if (this.joystick.active) {
            this.joystick.dx += (this.joystick.targetDx - this.joystick.dx) * Math.min(1, 0.25 + this.smoothFactor * 2);
            this.joystick.dy += (this.joystick.targetDy - this.joystick.dy) * Math.min(1, 0.25 + this.smoothFactor * 2);
            this.smoothFactor = Math.min(1, this.smoothFactor + 0.05);
            const deadzone = 0.12;
            const sens = this.joystickSensitivity;
            let dx = Math.abs(this.joystick.dx) > deadzone ? this.joystick.dx * sens : 0;
            let dy = Math.abs(this.joystick.dy) > deadzone ? this.joystick.dy * sens : 0;
            if (Math.abs(dx) > 1) dx = Math.sign(dx);
            if (Math.abs(dy) > 1) dy = Math.sign(dy);
            return { dx, dy };
        }
        this.smoothFactor = 0;
        let dx = 0, dy = 0;
        if (this.isDown('ArrowLeft') || this.isDown('a') || this.isDown('A')) dx = -1;
        if (this.isDown('ArrowRight') || this.isDown('d') || this.isDown('D')) dx = 1;
        if (this.isDown('ArrowUp') || this.isDown('w') || this.isDown('W')) dy = -1;
        if (this.isDown('ArrowDown') || this.isDown('s') || this.isDown('S')) dy = 1;
        return { dx, dy };
    }

    getAimAssist(targets, playerX, playerY) {
        if (!this.mobile || this.aimAssistStrength <= 0 || !targets || targets.length === 0) return 0;
        let closest = null;
        let closestDist = Infinity;
        for (const t of targets) {
            if (!t.active) continue;
            const dx = t.x - playerX;
            const dy = t.y - playerY;
            if (dy >= 0) continue;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < closestDist && dist < 500) {
                closestDist = dist;
                closest = t;
            }
        }
        if (!closest) return 0;
        const aimAngle = Math.atan2(closest.y - playerY, closest.x - playerX);
        return aimAngle * this.aimAssistStrength;
    }

    isFiring() {
        return this.isDown(' ') || this.firePressed || (this.autoFire && !this.mobile) || (this.autoFire && !this.firePressed);
    }

    isMobileFiring() {
        return this.firePressed;
    }

    resetFire() { this.firePressed = false; }

    isPausePressed() {
        if (this.pausePressed) {
            this.pausePressed = false;
            return true;
        }
        return false;
    }

    getJoystickData() {
        return {
            active: this.joystick.active,
            centerX: this.joystickCenter.x,
            centerY: this.joystickCenter.y,
            knobX: this.joystick.x,
            knobY: this.joystick.y,
            radius: this.joystickRadius,
            baseRadius: this.joystickRadius,
            opacity: this.joystickOpacity
        };
    }

    isMobile() { return this.mobile; }
}

window.SkyControls = SkyControls;
