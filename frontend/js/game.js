class SpaceRush {
    constructor(renderer3d) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.globalCompositeOperation = 'source-over';
        this.state = 'loading';
        this.lastTime = 0;
        this.paused = false;
        this.gameOver = false;
        this.currentLevel = 1;
        this.levelTransition = false;
        this.levelTransitionTimer = 0;
        this.bossActive = false;
        this.bossSpawned = false;
        this.bossLevel = false;
        this.score = 0;
        this.assetsLoaded = false;
        this.slowMotionTimer = 0;

        this.renderer3d = renderer3d || null;
        if (this.renderer3d) {
            this.renderer3d.attach(this);
        }

        this.assets = new SkyAssets();
        window.gameAssets = this.assets;
        this.storage = new SkyStorage();
        this.audio = new SkyAudio(this.assets);
        this.controls = new SkyControls(this.canvas);
        this.collision = SkyCollision;
        this.effects = new SkyEffects();
        this.bulletManager = new SkyBulletManager();
        this.player = new SkyPlayer();
        this.enemyManager = new SkyEnemyManager();
        this.powerUpManager = new SkyPowerUpManager();
        this.boss = null;
        this.ui = new SkyUI(this);

        this._setupCanvas();
        this._bindKeys();
        this._startLoad();
        this._startLoop();
    }

    _startLoad() {
        this.audio.init();

        this.assets.onProgress = (loaded, total) => {
            const pct = Math.min(1, loaded / total);
            const bar = document.querySelector('.loading-bar');
            if (bar) bar.style.width = (pct * 100) + '%';
        };

        this.assets.onComplete = () => {
            this.assetsLoaded = true;
            this._initGame();
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                const gameContainer = document.getElementById('game-container');
                if (loadingScreen) loadingScreen.classList.add('hidden');
                if (gameContainer) gameContainer.classList.add('visible');
                setTimeout(() => {
                    if (loadingScreen) loadingScreen.style.display = 'none';
                }, 500);
            }, 300);
        };

        this.assets.startLoading();

        setTimeout(() => {
            if (!this.assetsLoaded) {
                this.assetsLoaded = true;
                this._initGame();
                const loadingScreen = document.getElementById('loading-screen');
                const gameContainer = document.getElementById('game-container');
                if (loadingScreen) loadingScreen.classList.add('hidden');
                if (gameContainer) gameContainer.classList.add('visible');
                setTimeout(() => {
                    if (loadingScreen) loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 5000);
    }

    _setupCanvas() {
        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this._resizeCanvas(), 300);
        });
    }

    _resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const aspect = winW / winH;
        const refW = 1600;
        const refH = 900;
        let canvasW, canvasH;
        if (aspect > refW / refH) {
            canvasH = Math.min(winH, 960) * dpr;
            canvasW = Math.round(canvasH * aspect);
        } else {
            canvasW = Math.min(winW, 1600) * dpr;
            canvasH = Math.round(canvasW / aspect);
        }
        this.canvas.width = canvasW;
        this.canvas.height = canvasH;
    }

    _bindKeys() {
        document.addEventListener('keydown', async (e) => {
            if (e.key === 'Escape') {
                if (this.state === 'playing' && !this.gameOver) {
                    if (this.paused) { this.paused = false; this.state = 'menu'; this.audio.stopMusic(); }
                    else this.togglePause();
                }
                else if (this.state === 'highscores' || this.state === 'about' ||
                    this.state === 'plane_select' || this.state === 'upgrade') this.state = 'menu';
                else if (this.state === 'settings') this.state = 'menu';
            }

            if (this.state === 'menu') {
                const itemCount = this.ui.menuItems.length;
                if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                    this.ui.menuSelected = (this.ui.menuSelected - 1 + itemCount) % itemCount; this.audio.playMenuHover();
                }
                if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                    this.ui.menuSelected = (this.ui.menuSelected + 1) % itemCount; this.audio.playMenuHover();
                }
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.audio.playMenuClick(); this._handleMenuSelect(this.ui.menuSelected); }
            }

            if (this.state === 'account' && !this.storage.isLoggedIn()) {
                if (this.ui.accountState === 'login') {
                    this._handleAccountLoginKeys(e);
                } else if (this.ui.accountState === 'register') {
                    this._handleAccountRegisterKeys(e);
                }
            }

            if (this.state === 'account' && this.storage.isLoggedIn()) {
                if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { this.ui.accountMenuSelected = 0; this.audio.playMenuHover(); }
                if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { this.ui.accountMenuSelected = 1; this.audio.playMenuHover(); }
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (this.ui.accountMenuSelected === 0) {
                        await this.storage.logout();
                        this.ui.accountMessage = 'Logged out';
                        this.ui.accountMessageColor = '#88bbff';
                        this.ui.notify('Logged out', '#88bbff');
                    } else {
                        if (confirm('Delete account? All progress will be lost!')) {
                            await this.storage.deleteAccount();
                            this.ui.accountMessage = 'Account deleted';
                            this.ui.accountMessageColor = '#ff4444';
                        }
                    }
                }
            }

            if (this.state === 'highscores' && (e.key === 'Escape')) this.state = 'menu';
            if (this.state === 'about' && e.key === 'Escape') this.state = 'menu';
            if (this.state === 'account' && e.key === 'Escape') { this.state = 'menu'; this.ui.accountState = 'profile'; this.ui.accountMessage = ''; this.ui.loginInput = ''; this.ui.passInput = ''; }

            if (this.state === 'settings') {
                if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { this.ui.settingsMenuSelected = (this.ui.settingsMenuSelected - 1 + 8) % 8; this.audio.playMenuHover(); }
                if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { this.ui.settingsMenuSelected = (this.ui.settingsMenuSelected + 1) % 8; this.audio.playMenuHover(); }
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.audio.playMenuClick(); this._handleSettingsSelect(this.ui.settingsMenuSelected); }
                if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this._handleSettingsAdjust(-1);
                if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this._handleSettingsAdjust(1);
            }

            if (this.state === 'plane_select') {
                if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { this.ui.planeMenuSelected = (this.ui.planeMenuSelected - 1 + 5) % 5; this.audio.playMenuHover(); }
                if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { this.ui.planeMenuSelected = (this.ui.planeMenuSelected + 1) % 5; this.audio.playMenuHover(); }
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handlePlaneSelect(this.ui.planeMenuSelected); }
            }

            if (this.state === 'upgrade') {
                if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { this.ui.upgradeMenuSelected = (this.ui.upgradeMenuSelected - 1 + 5) % 5; this.audio.playMenuHover(); }
                if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { this.ui.upgradeMenuSelected = (this.ui.upgradeMenuSelected + 1) % 5; this.audio.playMenuHover(); }
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleUpgradeBuy(this.ui.upgradeMenuSelected); }
            }



            if (this.gameOver) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.restartGame(); }
                if (e.key === 'Escape') { this.state = 'menu'; this.gameOver = false; }
            }
        });

        this.canvas.addEventListener('touchend', async (e) => {
            e.preventDefault();
            if (this.state === 'playing') return;
            const touch = e.changedTouches[0];
            if (!touch) return;
            const W = this.canvas.width, H = this.canvas.height;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = W / rect.width;
            const scaleY = H / rect.height;
            const x = (touch.clientX - rect.left) * scaleX;
            const y = (touch.clientY - rect.top) * scaleY;
            const sy = (v) => (v / 900) * H;
            const sx = (v) => (v / 1600) * W;

            if (this.state === 'menu') {
                const startY = H * 0.45; const itemH = sy(42);
                for (let i = 0; i < this.ui.menuItems.length; i++) {
                    const itemY = startY + i * itemH;
                    if (y > itemY - sy(20) && y < itemY + sy(20)) { this.ui.menuSelected = i; this.audio.playMenuClick(); this._handleMenuSelect(i); return; }
                }
            }

            if (this.gameOver) {
                const btnY = H * 0.75;
                if (y > btnY - sy(20) && y < btnY + sy(20)) { this.restartGame(); return; }
                if (y > btnY + sy(25) && y < btnY + sy(60)) { this.state = 'menu'; this.gameOver = false; this.audio.stopMusic(); return; }
            }

            if (this.state === 'plane_select') {
                const startY = sy(90); const itemH = sy(50);
                for (let i = 0; i < this.ui.planeItems.length; i++) {
                    const itemY = startY + i * itemH;
                    if (y > itemY - sy(20) && y < itemY + sy(20)) { this.ui.planeMenuSelected = i; this._handlePlaneSelect(i); return; }
                }
            }

            if (this.state === 'upgrade') {
                const startY = sy(110); const itemH = sy(50);
                for (let i = 0; i < this.ui.upgradeItems.length; i++) {
                    const itemY = startY + i * itemH;
                    if (y > itemY - sy(20) && y < itemY + sy(20)) { this.ui.upgradeMenuSelected = i; this._handleUpgradeBuy(i); return; }
                }
            }

            if (this.state === 'settings') {
                const startY = sy(120); const itemH = sy(45);
                for (let i = 0; i < this.ui.settingsItems.length; i++) {
                    const itemY = startY + i * itemH;
                    if (y > itemY - sy(20) && y < itemY + sy(20)) {
                        if (i === 6) { this._handleSettingsSelect(6); return; }
                        if (i === 7) { this.state = 'menu'; return; }
                        this.ui.settingsMenuSelected = i;
                        if (i <= 1) {
                            const settings = this.storage.getSettings();
                            if (x > W / 2 - sx(50)) settings[i === 0 ? 'musicVolume' : 'sfxVolume'] = Math.min(1, (settings[i === 0 ? 'musicVolume' : 'sfxVolume'] || 0.5) + 0.1);
                            else settings[i === 0 ? 'musicVolume' : 'sfxVolume'] = Math.max(0, (settings[i === 0 ? 'musicVolume' : 'sfxVolume'] || 0.5) - 0.1);
                            this.storage.updateSettings(settings);
                            this.audio.setMusicVolume(settings.musicVolume);
                            this.audio.setSfxVolume(settings.sfxVolume);
                        } else {
                            const dir = x > W / 2 ? 1 : -1;
                            this._handleSettingsAdjust(dir);
                        }
                        return;
                    }
                }
            }

            if (this.state === 'highscores' || this.state === 'about') {
                if (y > H - sy(50)) { this.state = 'menu'; this.audio.playMenuClick(); return; }
            }

            if (this.state === 'plane_select' || this.state === 'upgrade') {
                if (y > H - sy(40)) { this.state = 'menu'; this.audio.playMenuClick(); return; }
            }

            if (this.state === 'account') {
                this._handleAccountClick(x, y);
            }
        });

        this.canvas.addEventListener('click', async (e) => {
            const W = this.canvas.width, H = this.canvas.height;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = W / rect.width;
            const scaleY = H / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            const sy = (v) => (v / 900) * H;
            const sx = (v) => (v / 1600) * W;

            if (this.state === 'menu') {
                const startY = H * 0.45; const itemH = sy(42);
                for (let i = 0; i < this.ui.menuItems.length; i++) {
                    const itemY = startY + i * itemH;
                    if (y > itemY - sy(20) && y < itemY + sy(20)) { this.ui.menuSelected = i;  this.audio.playMenuClick(); this._handleMenuSelect(i); return; }
                }
            }

            if (this.gameOver) {
                const btnY = H * 0.75;
                if (y > btnY - sy(20) && y < btnY + sy(20)) {  this.restartGame(); return; }
                if (y > btnY + sy(25) && y < btnY + sy(60)) {  this.state = 'menu'; this.gameOver = false; this.audio.stopMusic(); return; }
            }

            if (this.state === 'plane_select') {
                const startY = sy(90); const itemH = sy(50);
                for (let i = 0; i < this.ui.planeItems.length; i++) {
                    const itemY = startY + i * itemH;
                    if (y > itemY - sy(20) && y < itemY + sy(20)) { this.ui.planeMenuSelected = i;  this._handlePlaneSelect(i); return; }
                }
            }

            if (this.state === 'upgrade') {
                const startY = sy(110); const itemH = sy(50);
                for (let i = 0; i < this.ui.upgradeItems.length; i++) {
                    const itemY = startY + i * itemH;
                    if (y > itemY - sy(20) && y < itemY + sy(20)) { this.ui.upgradeMenuSelected = i;  this._handleUpgradeBuy(i); return; }
                }
            }

            if (this.state === 'settings') {
                const startY = sy(120); const itemH = sy(45);
                for (let i = 0; i < this.ui.settingsItems.length; i++) {
                    const itemY = startY + i * itemH;
                    if (y > itemY - sy(20) && y < itemY + sy(20)) {
                        if (i === 6) { this._handleSettingsSelect(6); return; }
                        if (i === 7) { this.state = 'menu'; return; }
                        this.ui.settingsMenuSelected = i;
                        if (i <= 1) {
                            const settings = this.storage.getSettings();
                            if (x > W / 2 - sx(50)) settings[i === 0 ? 'musicVolume' : 'sfxVolume'] = Math.min(1, (settings[i === 0 ? 'musicVolume' : 'sfxVolume'] || 0.5) + 0.1);
                            else settings[i === 0 ? 'musicVolume' : 'sfxVolume'] = Math.max(0, (settings[i === 0 ? 'musicVolume' : 'sfxVolume'] || 0.5) - 0.1);
                            this.storage.updateSettings(settings);
                            this.audio.setMusicVolume(settings.musicVolume);
                            this.audio.setSfxVolume(settings.sfxVolume);
                        } else {
                            const dir = x > W / 2 ? 1 : -1;
                            this._handleSettingsAdjust(dir);
                        }
                        return;
                    }
                }
            }

            if (this.state === 'highscores' || this.state === 'about') {
                if (y > H - sy(50)) { this.state = 'menu'; this.audio.playMenuClick(); return; }
            }

            if (this.state === 'plane_select' || this.state === 'upgrade') {
                if (y > H - sy(40)) { this.state = 'menu'; this.audio.playMenuClick(); return; }
            }

            if (this.state === 'account') {
                this._handleAccountClick(x, y);
            }
        });
    }

    _handleMenuSelect(index) {
        switch (index) {
            case 0: this.startGame(); break;
            case 1: this.state = 'plane_select'; this.ui.planeMenuSelected = Math.max(0, this.ui.planeIds.indexOf(this.storage.get('selectedPlane'))); break;
            case 2: this.state = 'upgrade'; this.player.coins = this.storage.get('coins'); break;
            case 3: this.state = 'highscores'; break;
            case 4: this.state = 'settings'; break;
            case 5: this.state = 'account'; this.ui.accountState = this.storage.isLoggedIn() ? 'profile' : 'login'; this.ui.loginInput = ''; this.ui.passInput = ''; this.ui.accountMessage = ''; break;
            case 6: this.state = 'about'; break;
        }
    }

    _handleSettingsSelect(index) {
        switch (index) {
            case 6:
                if (confirm('Reset all progress? This cannot be undone!')) {
                    this.storage.resetProgress();
                    this.ui.notify('Progress Reset!', '#ff4444');
                }
                break;
            case 7: this.state = 'menu'; break;
        }
    }

    _handleSettingsAdjust(dir) {
        const settings = this.storage.getSettings();
        const idx = this.ui.settingsMenuSelected;
        switch (idx) {
            case 0:
                settings.musicVolume = Math.max(0, Math.min(1, (settings.musicVolume || 0.5) + dir * 0.1));
                this.audio.setMusicVolume(settings.musicVolume);
                this.storage.updateSettings(settings);
                break;
            case 1:
                settings.sfxVolume = Math.max(0, Math.min(1, (settings.sfxVolume || 0.5) + dir * 0.1));
                this.audio.setSfxVolume(settings.sfxVolume);
                this.storage.updateSettings(settings);
                break;
            case 2: {
                const qs = ['low', 'medium', 'high'];
                let qi = qs.indexOf(settings.graphicsQuality);
                qi = Math.max(0, Math.min(qs.length - 1, qi + dir));
                settings.graphicsQuality = qs[qi];
                this.storage.updateSettings(settings);
                break;
            }
            case 3:
                settings.fullscreen = !settings.fullscreen;
                this.storage.updateSettings(settings);
                if (settings.fullscreen) document.documentElement.requestFullscreen().catch(() => {});
                else if (document.fullscreenElement) document.exitFullscreen();
                break;
            case 4:
                settings.mobileVibration = !settings.mobileVibration;
                this.storage.updateSettings(settings);
                break;
            case 5: {
                const modes = ['dynamic', 'fixed'];
                let mi = modes.indexOf(settings.joystickMode);
                mi = Math.max(0, Math.min(modes.length - 1, mi + dir));
                settings.joystickMode = modes[mi];
                this.storage.updateSettings(settings);
                break;
            }
        }
    }

    _handlePlaneSelect(index) {
        const planeId = this.ui.planeIds[index];
        if (!planeId) return;
        if (this.storage.isPlaneUnlocked(planeId)) {
            this.storage.selectPlane(planeId);
            this.player.setPlaneStats(planeId);
            this.ui.notify(`${this.ui.planeItems[index]} equipped!`, '#00ff00');
            this.audio.playPowerUp();
        } else {
            const cost = this.ui.planeCosts[index];
            if (this.storage.spendCoins(cost)) {
                this.storage.unlockPlane(planeId);
                this.storage.selectPlane(planeId);
                this.player.setPlaneStats(planeId);
                this.player.coins = this.storage.get('coins');
                this.ui.notify(`${this.ui.planeItems[index]} unlocked!`, '#ffd700');
                this.audio.playPowerUp();
            } else {
                this.ui.notify('Not enough coins!', '#ff4444');
            }
        }
    }

    _handleUpgradeBuy(index) {
        const key = this.ui.upgradeKeys[index];
        const level = this.storage.getUpgradeLevel(key);
        if (level >= 10) { this.ui.notify('Max level!', '#ff4444'); return; }
        const cost = this.ui.upgradeCosts[index] * (level + 1);
        if (this.storage.spendCoins(cost)) {
            this.storage.setUpgradeLevel(key, level + 1);
            this.player.coins = this.storage.get('coins');
            this.player.applyUpgrades(this.storage.get('upgrades'));
            this.ui.notify(`${this.ui.upgradeItems[index]} upgraded!`, '#00ff88');
            this.audio.playPowerUp();
        } else {
            this.ui.notify('Not enough coins!', '#ff4444');
        }
    }

    async _handleAccountLoginKeys(e) {
        const ui = this.ui;
        if (e.key === 'Tab') { e.preventDefault(); ui.loginField = ui.loginField === 'username' ? 'password' : 'username'; return; }
        if (e.key === 'Backspace') {
            if (ui.loginField === 'username') ui.loginInput = ui.loginInput.slice(0, -1);
            else ui.passInput = ui.passInput.slice(0, -1); return;
        }
        if (e.key.length === 1) {
            if (ui.loginField === 'username' && ui.loginInput.length < 20) ui.loginInput += e.key;
            else if (ui.loginField === 'password' && ui.passInput.length < 20) ui.passInput += e.key; return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!ui.loginInput || !ui.passInput) { ui.accountMessage = 'Enter email and password'; ui.accountMessageColor = '#ff4444'; return; }
            ui.accountMessage = 'Logging in...'; ui.accountMessageColor = '#88bbff';
            const result = await this.storage.login(ui.loginInput, ui.passInput);
            ui.accountMessage = result.error || 'Logged in!'; ui.accountMessageColor = result.ok ? '#00ff00' : '#ff4444';
            if (result.ok) { this.player.coins = this.storage.get('coins'); this.player.applyUpgrades(this.storage.get('upgrades')); ui.notify('Welcome!', '#00ff00'); this.audio.playPowerUp(); }
        }
    }

    async _handleAccountRegisterKeys(e) {
        const ui = this.ui;
        if (e.key === 'Tab') { e.preventDefault(); const f = ['username', 'password', 'confirm']; const c = f.indexOf(ui.registerField); ui.registerField = f[(c + 1) % f.length]; return; }
        if (e.key === 'Backspace') {
            if (ui.registerField === 'username') ui.registerInput = ui.registerInput.slice(0, -1);
            else if (ui.registerField === 'password') ui.registerPassInput = ui.registerPassInput.slice(0, -1);
            else ui.registerPassConfirm = ui.registerPassConfirm.slice(0, -1); return;
        }
        if (e.key.length === 1) {
            if (ui.registerField === 'username' && ui.registerInput.length < 20) ui.registerInput += e.key;
            else if (ui.registerField === 'password' && ui.registerPassInput.length < 20) ui.registerPassInput += e.key;
            else if (ui.registerField === 'confirm' && ui.registerPassConfirm.length < 20) ui.registerPassConfirm += e.key; return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!ui.registerInput || !ui.registerPassInput || !ui.registerPassConfirm) { ui.accountMessage = 'Please fill all fields'; ui.accountMessageColor = '#ff4444'; return; }
            if (ui.registerPassInput !== ui.registerPassConfirm) { ui.accountMessage = 'Passwords do not match!'; ui.accountMessageColor = '#ff4444'; return; }
            ui.accountMessage = 'Creating account...'; ui.accountMessageColor = '#88bbff';
            const result = await this.storage.register(ui.registerInput, ui.registerPassInput);
            ui.accountMessage = result.error || 'Account created!'; ui.accountMessageColor = result.ok ? '#00ff00' : '#ff4444';
            if (result.ok) { this.player.coins = this.storage.get('coins'); ui.notify('Welcome ' + ui.registerInput + '!', '#00ff00'); this.audio.playPowerUp(); }
        }
    }

    async _handleAccountClick(x, y) {
        const ui = this.ui; const h = this.canvas.height;
        const sy = (v) => (v / 900) * h;
        const sx = (v) => (v / 1600) * this.canvas.width;
        if (!this.storage.isLoggedIn()) {
            if (ui.accountState === 'login') {
                if (y > sy(123) && y < sy(149) && x > sx(480) && x < sx(730)) { ui.loginField = 'username'; return; }
                if (y > sy(163) && y < sy(189) && x > sx(480) && x < sx(730)) { ui.loginField = 'password'; return; }
                if (y > sy(270) && y < sy(295)) {
                    if (!ui.loginInput || !ui.passInput) { ui.accountMessage = 'Enter email and password'; ui.accountMessageColor = '#ff4444'; return; }
                    ui.accountMessage = 'Logging in...'; ui.accountMessageColor = '#88bbff';
                    const r = await this.storage.login(ui.loginInput, ui.passInput);
                    ui.accountMessage = r.error || 'Logged in!'; ui.accountMessageColor = r.ok ? '#00ff00' : '#ff4444';
                    if (r.ok) { this.player.coins = this.storage.get('coins'); ui.notify('Welcome!', '#00ff00'); this.audio.playPowerUp(); }
                    return;
                }
                if (y > sy(310) && y < sy(335)) { ui.accountState = 'register'; ui.registerInput = ''; ui.registerPassInput = ''; ui.registerPassConfirm = ''; ui.accountMessage = ''; return; }
                if (y > sy(350) && y < sy(375)) { this.state = 'menu'; ui.accountState = 'profile'; return; }
            } else if (ui.accountState === 'register') {
                if (y > sy(123) && y < sy(149) && x > sx(420) && x < sx(670)) { ui.registerField = 'username'; return; }
                if (y > sy(163) && y < sy(189) && x > sx(420) && x < sx(670)) { ui.registerField = 'password'; return; }
                if (y > sy(203) && y < sy(229) && x > sx(420) && x < sx(670)) { ui.registerField = 'confirm'; return; }
                if (y > sy(310) && y < sy(340)) {
                    if (!ui.registerInput || !ui.registerPassInput || !ui.registerPassConfirm) { ui.accountMessage = 'Please fill all fields'; ui.accountMessageColor = '#ff4444'; return; }
                    if (ui.registerPassInput !== ui.registerPassConfirm) { ui.accountMessage = 'Passwords do not match!'; ui.accountMessageColor = '#ff4444'; return; }
                    ui.accountMessage = 'Creating account...'; ui.accountMessageColor = '#88bbff';
                    const r = await this.storage.register(ui.registerInput, ui.registerPassInput);
                    ui.accountMessage = r.error || 'Account created!'; ui.accountMessageColor = r.ok ? '#00ff00' : '#ff4444';
                    if (r.ok) { this.player.coins = this.storage.get('coins'); ui.notify('Account created!', '#00ff00'); this.audio.playPowerUp(); }
                    return;
                }
                if (y > sy(350) && y < sy(375)) { this.state = 'menu'; ui.accountState = 'profile'; return; }
            }
        } else {
            if (y > sy(270) && y < sy(295)) { await this.storage.logout(); ui.accountMessage = 'Logged out'; ui.accountMessageColor = '#88bbff'; ui.notify('Logged out', '#88bbff'); return; }
            if (y > sy(310) && y < sy(335)) { if (confirm('Delete account?')) { await this.storage.deleteAccount(); ui.accountMessage = 'Account deleted'; ui.accountMessageColor = '#ff4444'; } return; }
            if (y > sy(350) && y < sy(380)) { this.state = 'menu'; ui.accountState = 'profile'; return; }
        }
    }

    _initGame() {
        const settings = this.storage.getSettings();
        this.audio.setMusicVolume(settings.musicVolume);
        this.audio.setSfxVolume(settings.sfxVolume);
        const planeId = this.storage.get('selectedPlane');
        this.player.setPlaneStats(planeId);
        this.player.applyUpgrades(this.storage.get('upgrades'));
        this.player.coins = this.storage.get('coins');
    }

    startGame() {
        this.state = 'playing';
        this.currentLevel = 1;
        this.gameOver = false;
        this.bossActive = false;
        this.bossSpawned = false;
        this.bossLevel = false;
        this.score = 0;
        this.levelTransition = false;
        this.slowMotionTimer = 0;

        const planeId = this.storage.get('selectedPlane');
        this.player.setPlaneStats(planeId);
        this.player.applyUpgrades(this.storage.get('upgrades'));
        this.player.coins = 0;
        this.player.init(this.canvas.width, this.canvas.height);
        this.player.reset(this.canvas.width, this.canvas.height);

        this.enemyManager.clear();
        this.enemyManager.setLevel(1);
        this.bulletManager.clear();
        this.powerUpManager.clear();
        this.effects.clear();
        this.boss = null;
        this.bossSpawned = false;

        this.levelTransition = true;
        this.levelTransitionTimer = 2.5;

        this.controls.resetFire();
        this.audio.startMusic();
        this.ui.notify('Game Started!', '#00ff00');
    }

    restartGame() { this.startGame(); }

    togglePause() {
        this.paused = !this.paused;
        if (this.paused) this.audio.stopMusic();
        else this.audio.startMusic();
    }

    _startLoop() {
        this.lastTime = performance.now();
        const loop = (timestamp) => {
            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
            this.lastTime = timestamp;
            this._update(dt);
            if (this.renderer3d) {
                this.renderer3d.update(dt);
            }
            this._render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    _update(dt) {
        this.ui.bgProgress += dt * 20;
        this.ui.update(dt);
        this.ui.updateTransition(dt);

        if (this.controls.isPausePressed()) {
            if (this.state === 'playing') this.togglePause();
        }

        if (this.state === 'loading') {
            this.state = 'menu';
            return;
        }

        if (this.state !== 'playing' || this.gameOver || this.paused) return;

        if (this.slowMotionTimer > 0) {
            this.slowMotionTimer -= dt;
            const slowFactor = 0.4;
            dt *= slowFactor;
            if (this.slowMotionTimer <= 0) this.slowMotionTimer = 0;
        }

        if (this.levelTransition) {
            this.levelTransitionTimer -= dt;
            if (this.levelTransitionTimer <= 0) this.levelTransition = false;
            return;
        }

        this.player.update(dt, this.controls, this.canvas.width, this.canvas.height);
        this.enemyManager.updatePerformance(this.player.kills, this.gameOver ? 1 : 0, this.player.survivalTime, this.player.health);
        this.effects.update(dt);

        if (this.player.alive) {
            const speed2 = Math.sqrt(this.player.vx * this.player.vx + this.player.vy * this.player.vy);
            const trailCount = Math.max(1, Math.floor(speed2 / 150));
            for (let i = 0; i < trailCount; i++) {
                this.effects.emitEngineTrail(this.player.x, this.player.y, 1, '#ff6600');
            }

            if (this.controls.isFiring() && this.player.canFire(dt)) {
                const fp = this.player.getFirePosition();
                let angle = -Math.PI / 2;
                const aimAngle = this.controls.getAimAssist(
                    this.bossActive && this.boss ? [this.boss] : this.enemyManager.enemies,
                    this.player.x, this.player.y
                );
                if (aimAngle !== 0) {
                    angle += aimAngle * 0.5;
                }
                this.bulletManager.firePlayer(fp.x, fp.y, angle, this.player.weapon, this.player.damage);
                this.effects.emitExplosion(fp.x, fp.y - 10, 3, this.player.getWeaponColor(), 1, false);
                this.effects.addScreenFlash(fp.x, fp.y, this.player.getWeaponColor(), 0.05);
                if (this.renderer3d) {
                    this.renderer3d.emitMuzzleFlash(fp.x, fp.y, this.player.getWeaponColor());
                }
                if (this.player.weapon === 'laser') this.audio.playLaser();
                else if (this.player.weapon === 'rocket') this.audio.playRocket();
                else this.audio.playShoot();
            }
        }

        this._checkBossSpawn();

        if (this.bossActive && this.boss && this.boss.active) {
            const wasDying = this.boss.deathTimer > 0;
            this.boss.update(dt, this.player.x, this.player.y, this.canvas.width, this.canvas.height, this.bulletManager);
            if (wasDying && this.boss.deathTimer <= 0 && !this.boss.active) {
                this._onBossDeathComplete();
            }
        } else {
            this.enemyManager.update(dt, this.player.x, this.player.y, this.canvas.width, this.canvas.height, this.bulletManager);
        }

        const allEnemies = this.bossActive && this.boss ? [this.boss] : this.enemyManager.enemies;
        this.bulletManager.update(dt, allEnemies);
        this.powerUpManager.update(dt, this.canvas.height);
        this._checkCollisions();
    }

    _checkBossSpawn() {
        if (this.bossSpawned) return;
        if (this.currentLevel % 5 === 0 && !this.bossLevel) {
            this.bossLevel = true;
            this.bossSpawned = true;
            this.boss = new SkyBoss(this.currentLevel);
            this.boss.start(this.canvas.width);
            this.bossActive = true;
            this.enemyManager.clear();
            this.ui.showBossWarning();
            this.audio.playBossWarning();
            this.ui.notify(`BOSS: ${this.boss.label}`, '#ff4444');
            this.effects.shake(5, 0.5);
            if (this.renderer3d) {
                this.renderer3d.shake(5);
            }
        }
    }

    _checkCollisions() {
        const p = this.player;
        const bm = this.bulletManager;
        const comboMult = 1 + Math.min(p.combo, 20) * 0.1;

        for (let i = bm.playerBullets.length - 1; i >= 0; i--) {
            const bullet = bm.playerBullets[i];
            if (!bullet.active) continue;
            this.effects.emitBulletTrail(bullet.x, bullet.y, bullet.color);

            if (this.bossActive && this.boss && this.boss.active && this.boss.deathTimer <= 0) {
                if (this.collision.circleRect(
                    { x: bullet.x, y: bullet.y, radius: bullet.size },
                    this.boss.getBounds()
                )) {
                    const dmg = Math.round(bullet.damage * comboMult);
                    const killed = this.boss.takeDamage(dmg);
                    bullet.active = false;
                    bm.playerBullets.splice(i, 1);
                    p.hitsLanded++;
                    this.effects.addFloatingText(bullet.x, bullet.y - 10, dmg.toString(), '#ff8800', 16);
                    this.effects.emitExplosion(bullet.x, bullet.y, 5, '#ff8800', 2, false);
                    this.effects.triggerHitStop(0.03);
                    if (this.renderer3d) {
                        this.renderer3d.emitExplosion(bullet.x, bullet.y, '#ff8800', 6);
                        this.renderer3d.shake(2);
                    }
                    if (killed) this._onBossDefeated();
                    continue;
                }
            }

            let hitEnemy = false;
            for (let j = this.enemyManager.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemyManager.enemies[j];
                if (!enemy.active) continue;
                if (this.collision.circleRect(
                    { x: bullet.x, y: bullet.y, radius: bullet.size },
                    enemy.getBounds()
                )) {
                    const dmg = Math.round(bullet.damage * comboMult);
                    const killed = enemy.takeDamage(dmg);
                    bullet.active = false;
                    bm.playerBullets.splice(i, 1);
                    p.hitsLanded++;
                    this.effects.addFloatingText(bullet.x, bullet.y - 10, dmg.toString(), enemy.color, 14);
                    this.effects.emitExplosion(bullet.x, bullet.y, 8, enemy.color, 2, false);
                    this.effects.triggerHitStop(0.02);
                    this.effects.shake(2, 0.1);
                    if (this.renderer3d) {
                        this.renderer3d.emitExplosion(bullet.x, bullet.y, enemy.color, 5);
                        this.renderer3d.shake(1);
                    }
                    if (killed) this._onEnemyKilled(enemy);
                    hitEnemy = true;
                    break;
                }
            }
            if (hitEnemy) continue;
        }

        for (let i = bm.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = bm.enemyBullets[i];
            if (!bullet.active) continue;
            if (this.collision.circleCircle(
                { x: bullet.x, y: bullet.y, radius: bullet.size },
                { x: p.x, y: p.y, radius: p.radius }
            )) {
                if (p.alive) {
                    const tookDmg = p.takeDamage(bullet.damage);
                    bullet.active = false;
                    bm.enemyBullets.splice(i, 1);
                    if (tookDmg) {
                        this.audio.playPlayerHit();
                        this.effects.shake(4, 0.2);
                        this.effects.addScreenFlash(p.x, p.y, '#ff0000', 0.1);
                        if (!p.alive) this._onPlayerDeath();
                    }
                }
            }
        }

        for (let j = this.enemyManager.enemies.length - 1; j >= 0; j--) {
            const enemy = this.enemyManager.enemies[j];
            if (!enemy.active) continue;
            if (this.collision.circleRect(
                { x: p.x, y: p.y, radius: p.radius },
                enemy.getBounds()
            )) {
                if (p.alive) {
                    p.takeDamage(20);
                    this.effects.emitExplosion(enemy.x, enemy.y, 15, '#ff4400', 3, true);
                    if (this.renderer3d) {
                        this.renderer3d.emitExplosion(enemy.x, enemy.y, '#ff4400', 12);
                        this.renderer3d.shake(4);
                    }
                    enemy.active = false;
                    this.enemyManager.enemies.splice(j, 1);
                    this.audio.playExplosion();
                    if (!p.alive) this._onPlayerDeath();
                }
            }
        }

        if (this.bossActive && this.boss && this.boss.active && this.boss.deathTimer <= 0) {
            if (this.collision.circleRect(
                { x: p.x, y: p.y, radius: p.radius },
                this.boss.getBounds()
            )) {
                if (p.alive) {
                    p.takeDamage(30);
                    this.effects.emitExplosion(p.x, p.y, 10, '#ff0000', 3, false);
                    this.effects.shake(8, 0.3);
                    if (this.renderer3d) {
                        this.renderer3d.emitExplosion(p.x, p.y, '#ff0000', 15);
                        this.renderer3d.shake(6);
                    }
                    if (!p.alive) this._onPlayerDeath();
                }
            }
        }

        for (let i = this.powerUpManager.powerups.length - 1; i >= 0; i--) {
            const pu = this.powerUpManager.powerups[i];
            if (!pu.active) continue;
            if (this.collision.circleRect(
                { x: p.x, y: p.y, radius: p.radius },
                pu.getBounds()
            )) {
                pu.apply(p, this);
                this.effects.emitExplosion(pu.x, pu.y, 10, pu.color, 3, false);
                if (this.renderer3d) {
                    this.renderer3d.emitExplosion(pu.x, pu.y, pu.color, 8);
                }
                this.audio.playPowerUp();
                this.ui.notify(`+${pu.label}`, pu.color);
                pu.active = false;
                this.powerUpManager.powerups.splice(i, 1);
            }
        }
    }

    _checkAchievements() {
        const p = this.player;
        const s = this.storage;
        const kills = s.get('totalKills') || 0;
        this._tryAchievement(s, 'kill_10', 'Baby Steps', 'Kill 10 enemies', kills >= 10);
        this._tryAchievement(s, 'kill_100', 'Getting Started', 'Kill 100 enemies', kills >= 100);
        this._tryAchievement(s, 'kill_1000', 'War Machine', 'Kill 1000 enemies', kills >= 1000);
        this._tryAchievement(s, 'combo_10', 'Combo King', 'Reach 10x combo', p.maxCombo >= 10);
        this._tryAchievement(s, 'combo_25', 'Unstoppable', 'Reach 25x combo', p.maxCombo >= 25);
        this._tryAchievement(s, 'score_10k', 'Score Runner', 'Reach 10,000 points', s.get('highScore') >= 10000);
        this._tryAchievement(s, 'score_50k', 'Elite Pilot', 'Reach 50,000 points', s.get('highScore') >= 50000);
        this._tryAchievement(s, 'level_20', 'Veteran', 'Reach level 20', this.currentLevel >= 20);
        this._tryAchievement(s, 'all_planes', 'Collector', 'Unlock all planes', s.get('unlockedPlanes').length >= 5);
        const upgrades = s.get('upgrades');
        const totalUpgrade = upgrades.health + upgrades.damage + upgrades.speed + upgrades.fireRate + upgrades.armor;
        this._tryAchievement(s, 'max_upgrades', 'Fully Loaded', 'Max out all upgrades', totalUpgrade >= 25);
    }

    _tryAchievement(s, id, name, desc, condition) {
        if (condition) {
            const unlocked = s.addAchievement(id, name, desc);
            if (unlocked) {
                this.ui.notify(`🏆 ${name}`, '#ffd700');
                this.audio.playPowerUp();
            }
        }
    }

    _onEnemyKilled(enemy) {
        this.player.addCombo();
        const comboMult = 1 + Math.min(this.player.combo, 20) * 0.1;
        const bonusScore = Math.floor(enemy.score * comboMult);
        this.player.addScore(bonusScore);
        this.player.addCoins(enemy.coins + Math.floor(this.player.combo * 0.5));
        this.player.addXP(enemy.score);
        this.player.kills++;
        this.storage.addStat('totalKills', 1);
        this.storage.addStat('totalScore', bonusScore);
        this.audio.playExplosion();
        this.effects.emitExplosion(enemy.x, enemy.y, 15, enemy.color, 3, true);
        this.effects.shake(3, 0.12);
        if (this.renderer3d) {
            this.renderer3d.emitExplosion(enemy.x, enemy.y, enemy.color, 15);
            this.renderer3d.shake(2);
        }
        if (this.player.combo >= 5) {
            this.effects.addFloatingText(enemy.x, enemy.y - 30, `${this.player.combo}x COMBO!`, '#ffd700', 20);
        }
        this.powerUpManager.checkDrop(enemy.x, enemy.y);
        this._checkAchievements();
    }

    _onBossDefeated() {
        this.audio.playBigExplosion();
        this.effects.emitExplosion(this.boss.x, this.boss.y, 30, '#ff8800', 5, true);
        this.effects.shake(10, 0.5);
        if (this.renderer3d) {
            this.renderer3d.emitExplosion(this.boss.x, this.boss.y, '#ff8800', 40);
            this.renderer3d.shake(12);
        }
        this.ui.notify(`BOSS DEFEATED! +${this.boss.score}pts`, '#ffd700');
    }

    _onBossDeathComplete() {
        this.audio.playVictory();
        this.player.addScore(this.boss.score);
        this.player.addCoins(this.boss.coins);
        this.storage.addStat('bossesDefeated', 1);
        for (let i = 0; i < 5; i++) {
            this.powerUpManager.spawnAt(
                this.boss.x + (Math.random() - 0.5) * 80,
                this.boss.y + (Math.random() - 0.5) * 80
            );
        }
        this.bossActive = false;
        this.boss = null;
        this.enemyManager.clear();

        setTimeout(() => {
            this.currentLevel++;
            this.bossSpawned = false;
            this.bossLevel = false;
            this.enemyManager.setLevel(this.currentLevel);
            this.levelTransition = true;
            this.levelTransitionTimer = 2.5;
            this.ui.notify(`Level ${this.currentLevel} - Prepare!`, '#88bbff');
        }, 1500);
    }

    _onPlayerDeath() {
        this.gameOver = true;
        this.audio.playGameOver();
        this.audio.stopMusic();
        this.effects.emitExplosion(this.player.x, this.player.y, 50, '#ff4400', 6, true);
        this.effects.shake(12, 0.5);
        if (this.renderer3d) {
            this.renderer3d.emitExplosion(this.player.x, this.player.y, '#ff4400', 50);
            this.renderer3d.shake(10);
        }
        this.storage.addScore(this.player.score);
        this.storage.addCoins(this.player.coins);
        this.storage.set('totalKills', (this.storage.get('totalKills') || 0) + this.player.kills);
        this.storage.addStat('gamesPlayed', 1);
        this.storage.addStat('totalCoins', this.player.coins);
        if (this.player.maxCombo > (this.storage.get('stats')?.maxCombo || 0)) {
            this.storage.get('stats').maxCombo = this.player.maxCombo;
        }

        const leaderboardEntry = {
            name: this.storage.getUsername() || 'Pilot',
            score: this.player.score,
            kills: this.player.kills,
            level: this.currentLevel,
            time: this.player.survivalTime,
            date: new Date().toISOString()
        };
        this.storage.addToLeaderboard(leaderboardEntry);
    }

    _getTotalCoins() { return this.storage.get('coins') + this.player.coins; }

    _render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        switch (this.state) {
            case 'menu':
                this.ui.renderMainMenu();
                break;
            case 'highscores':
                this.ui.renderHighScores();
                break;
            case 'settings':
                this.ui.renderSettings();
                break;
            case 'about':
                this.ui.renderAbout();
                break;
            case 'account':
                this.ui.renderAccount();
                break;
            case 'plane_select':
                this.ui.renderPlaneSelect();
                break;
            case 'upgrade':
                this.ui.renderUpgradeMenu();
                break;
            case 'playing':
                this.ui.renderHUD();
                this.ui.renderBossBar();
                this.ui.renderBossWarning();
                this.ui.renderNotifications();
                if (this.levelTransition) this.ui.renderLevelTransition();
                if (this.paused) this.ui.renderPause();
                if (this.gameOver) this.ui.renderGameOver();
                this.ui.renderMobileControls();
                break;
        }

        if (this.state !== 'loading') {
            this.ui.renderWatermark();
        }
        this.ui.renderTransition();
    }

    getStat(name) {
        if (name === 'highScore') return this.storage.get('highScore');
        if (name === 'coins') return this.storage.get('coins');
        return 0;
    }
}

window.SpaceRush = SpaceRush;
