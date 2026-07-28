import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const IS_MOBILE = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
const SCALE = 0.05;

class Renderer3D {
    constructor(container) {
        this.container = container;
        this.game = null;
        this.clientWidth = window.innerWidth;
        this.clientHeight = window.innerHeight;
        this.starLayers = [];
        this.playerMesh = null;
        this.playerLight = null;
        this.enemyMeshes = [];
        this.bossMesh = null;
        this.bulletMeshes = { player: [], enemy: [] };
        this.powerupMeshes = [];
        this.shieldMesh = null;
        this.trailParticles = [];
        this.trailNext = 0;
        this.explosionPool = [];
        this.muzzleFlashes = [];
        this.shakeAmount = 0;
        this.qualityLevel = IS_MOBILE ? 'medium' : 'high';
        this.fpsHistory = [];
        this.frameCount = 0;
        this.lastFpsCheck = performance.now();
        this.baseStarSizes = [];

        this._setupScene();
        this._setupLights();
        this._setupStarfield();
        this._setupPostProcessing();
        this._buildGeometries();
        this._initPools();

        window.addEventListener('resize', () => this._onResize());
    }

    _setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000008);
        this.camera = new THREE.PerspectiveCamera(55, this.clientWidth / this.clientHeight, 0.1, 2000);
        this.camera.position.set(0, 28, 22);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({
            antialias: !IS_MOBILE,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });
        const pr = IS_MOBILE ? 1.2 : Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pr);
        this.renderer.setSize(this.clientWidth, this.clientHeight);
        if (!IS_MOBILE) {
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.2;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        }
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.pointerEvents = 'none';
        this.container.insertBefore(this.renderer.domElement, this.container.firstChild);
    }

    _setupLights() {
        const ambient = new THREE.AmbientLight(0x222244, IS_MOBILE ? 0.8 : 0.6);
        this.scene.add(ambient);
        const main = new THREE.DirectionalLight(0xffeedd, IS_MOBILE ? 1.5 : 2.5);
        main.position.set(15, 30, 10);
        this.scene.add(main);
        const fill = new THREE.DirectionalLight(0x4488ff, IS_MOBILE ? 0.5 : 0.8);
        fill.position.set(-15, 10, -10);
        this.scene.add(fill);
        if (!IS_MOBILE) {
            const rim = new THREE.DirectionalLight(0xff8844, 0.4);
            rim.position.set(0, -10, -20);
            this.scene.add(rim);
        }
    }

    _setupStarfield() {
        const starConfigs = IS_MOBILE
            ? [
                { count: 1200, spread: 300, color: 0x8888cc, size: 0.5, speed: 5, opacity: 0.9 },
                { count: 400, spread: 400, color: 0xaaaaff, size: 0.8, speed: 12, opacity: 0.7 },
                { count: 100, spread: 500, color: 0xffaa66, size: 1.2, speed: 22, opacity: 0.5 }
              ]
            : [
                { count: 5000, spread: 350, color: 0x8888cc, size: 0.4, speed: 5, opacity: 1.0 },
                { count: 2000, spread: 450, color: 0xaaaaff, size: 0.7, speed: 12, opacity: 0.9 },
                { count: 600, spread: 550, color: 0xffaa66, size: 1.2, speed: 22, opacity: 0.8 }
              ];

        for (const cfg of starConfigs) {
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(cfg.count * 3);
            const colors = new Float32Array(cfg.count * 3);
            const sizes = new Float32Array(cfg.count);
            const phases = new Float32Array(cfg.count);
            const c = new THREE.Color(cfg.color);
            for (let i = 0; i < cfg.count; i++) {
                pos[i * 3] = (Math.random() - 0.5) * cfg.spread * 2;
                pos[i * 3 + 1] = (Math.random() - 0.5) * cfg.spread * 0.3;
                pos[i * 3 + 2] = -Math.random() * cfg.spread;
                const b = 0.3 + Math.random() * 0.7;
                colors[i * 3] = c.r * b;
                colors[i * 3 + 1] = c.g * b;
                colors[i * 3 + 2] = c.b * b;
                sizes[i] = cfg.size * (0.5 + Math.random() * 1.5);
                phases[i] = Math.random() * Math.PI * 2;
            }
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            const mat = new THREE.PointsMaterial({
                size: cfg.size,
                vertexColors: true,
                transparent: true,
                opacity: cfg.opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true
            });
            const points = new THREE.Points(geo, mat);
            points.userData = { speed: cfg.speed, spread: cfg.spread, phases };
            this.scene.add(points);
            this.starLayers.push(points);
            this.baseStarSizes.push(sizes.slice());
        }
    }

    _setupPostProcessing() {
        if (IS_MOBILE) { this.composer = null; return; }
        try {
            this.composer = new EffectComposer(this.renderer);
            this.composer.addPass(new RenderPass(this.scene, this.camera));
            this.bloomPass = new UnrealBloomPass(
                new THREE.Vector2(this.clientWidth, this.clientHeight),
                0.2, 0.04, 0.02
            );
            this.composer.addPass(this.bloomPass);
        } catch (e) {
            this.composer = null;
        }
    }

    _buildGeometries() {
        const bulletDetail = IS_MOBILE ? 6 : 8;
        const bMat = new THREE.MeshBasicMaterial({ color: 0x88ffff, transparent: true, opacity: 0.9 });
        this.geoBullet = new THREE.SphereGeometry(0.15, bulletDetail, bulletDetail);
        this.matBullet = bMat;

        const ebMat = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.9 });
        this.geoEBullet = new THREE.SphereGeometry(0.2, bulletDetail, bulletDetail);
        this.matEBullet = ebMat;

        this.geoPowerup = new THREE.OctahedronGeometry(0.5, IS_MOBILE ? 0 : 0);
        const puMat = new THREE.MeshStandardMaterial({
            color: 0xffff00, emissive: 0xffaa00, emissiveIntensity: IS_MOBILE ? 0.3 : 0.5,
            metalness: IS_MOBILE ? 0 : 0.3, roughness: 0.5
        });
        this.matPowerup = puMat;

        this._buildPlayerShip();
        this._buildEnemyBasic();
        this._buildEliteShip();
        this._buildBossShip();

        this.geoTrail = new THREE.SphereGeometry(0.1, 4, 4);
        this.matTrail = new THREE.MeshBasicMaterial({
            color: 0xff6600, transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false
        });

        this.geoShield = new THREE.SphereGeometry(1, IS_MOBILE ? 12 : 16, IS_MOBILE ? 12 : 16);
        this.matShield = new THREE.MeshBasicMaterial({
            color: 0x00ffff, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
        });
    }

    _buildPlayerShip() {
        const g = new THREE.Group();
        const bodyMat = IS_MOBILE
            ? new THREE.MeshBasicMaterial({ color: 0x00aaff })
            : new THREE.MeshStandardMaterial({
                color: 0x00aaff, emissive: 0x0044ff, emissiveIntensity: 0.3,
                metalness: 0.7, roughness: 0.3
              });
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, IS_MOBILE ? 5 : 6), bodyMat);
        body.rotation.x = -Math.PI / 2;
        body.position.z = -0.4;
        g.add(body);

        const wingMat = IS_MOBILE
            ? new THREE.MeshBasicMaterial({ color: 0x0088dd })
            : new THREE.MeshStandardMaterial({
                color: 0x0088dd, emissive: 0x0044aa, emissiveIntensity: 0.15,
                metalness: 0.6, roughness: 0.4
              });
        const wing = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.5), wingMat);
        wing.position.z = 0.1;
        g.add(wing);

        if (!IS_MOBILE) {
            const cockpitMat = new THREE.MeshStandardMaterial({
                color: 0x88ddff, emissive: 0x0066ff, emissiveIntensity: 0.1,
                transparent: true, opacity: 0.6, metalness: 0.9, roughness: 0.1
            });
            const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), cockpitMat);
            cockpit.position.set(0, 0.15, -0.35);
            cockpit.scale.set(1, 0.4, 1.2);
            g.add(cockpit);
        }

        const engineMat = IS_MOBILE
            ? new THREE.MeshBasicMaterial({ color: 0x00aaff })
            : new THREE.MeshStandardMaterial({
                color: 0x0088ff, emissive: 0x00aaff, emissiveIntensity: 2,
                transparent: true, opacity: 0.9
              });
        const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 0.15, IS_MOBILE ? 6 : 8), engineMat);
        engine.position.z = 0.7;
        engine.rotation.x = Math.PI / 2;
        g.add(engine);

        const tipMat = IS_MOBILE
            ? new THREE.MeshBasicMaterial({ color: 0x0044ff })
            : new THREE.MeshStandardMaterial({
                color: 0x0044ff, emissive: 0x0044ff, emissiveIntensity: 1,
                transparent: true, opacity: 0.6
              });
        for (let s = -1; s <= 1; s += 2) {
            const tip = new THREE.Mesh(new THREE.SphereGeometry(0.1, IS_MOBILE ? 4 : 6, IS_MOBILE ? 4 : 6), tipMat);
            tip.position.set(s * 0.75, 0, 0.1);
            g.add(tip);
        }
        this.geoPlayer = g;
    }

    _buildEnemyBasic() {
        const mat = IS_MOBILE
            ? new THREE.MeshBasicMaterial({ color: 0xff4444 })
            : new THREE.MeshStandardMaterial({
                color: 0xff4444, emissive: 0xff2200, emissiveIntensity: 0.2,
                metalness: 0.3, roughness: 0.7
              });
        const segs = IS_MOBILE ? 0 : 0;
        this.geoEnemyBasic = new THREE.OctahedronGeometry(0.6, segs);
        this.matEnemyBasic = mat;

        this.eliteMat = IS_MOBILE
            ? new THREE.MeshBasicMaterial({ color: 0xaa44ff })
            : new THREE.MeshStandardMaterial({
                color: 0xaa44ff, emissive: 0x6600ff, emissiveIntensity: 0.3,
                metalness: 0.5, roughness: 0.5
              });
    }

    _buildEliteShip() {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, IS_MOBILE ? 0 : 0), this.eliteMat);
        g.add(body);

        if (!IS_MOBILE) {
            const spikeMat = new THREE.MeshStandardMaterial({
                color: 0xff66ff, emissive: 0xff00ff, emissiveIntensity: 0.3
            });
            for (let i = 0; i < 4; i++) {
                const a = (i / 4) * Math.PI * 2;
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.5, 4), spikeMat);
                spike.position.set(Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6);
                spike.rotation.x = Math.PI / 2;
                spike.rotation.z = a;
                g.add(spike);
            }
        }
        this.geoEnemyElite = g;
    }

    _buildBossShip() {
        const g = new THREE.Group();
        const bodyMat = IS_MOBILE
            ? new THREE.MeshBasicMaterial({ color: 0xff6600 })
            : new THREE.MeshStandardMaterial({
                color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 0.2,
                metalness: 0.8, roughness: 0.2
              });
        const body = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, IS_MOBILE ? 0 : 0), bodyMat);
        g.add(body);

        if (!IS_MOBILE) {
            const ringMat = new THREE.MeshStandardMaterial({
                color: 0xff8800, emissive: 0xff4400, emissiveIntensity: 0.3,
                metalness: 0.8, roughness: 0.2
            });
            const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.12, 8, 24), ringMat);
            ring.rotation.x = Math.PI / 2;
            g.add(ring);

            const innerMat = new THREE.MeshStandardMaterial({
                color: 0xff4400, emissive: 0xff0000, emissiveIntensity: 0.5,
                metalness: 0.6, roughness: 0.4
            });
            const inner = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.1, 6, 16), innerMat);
            inner.rotation.x = Math.PI / 3;
            g.add(inner);
        }
        this.geoBoss = g;
    }

    _initPools() {
        const maxExplosions = IS_MOBILE ? 80 : 200;
        const geo = new THREE.SphereGeometry(0.08, 4, 4);
        for (let i = 0; i < maxExplosions; i++) {
            const mat = new THREE.MeshBasicMaterial({
                color: 0xff8800, transparent: true, opacity: 1,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            const m = new THREE.Mesh(geo, mat);
            m.visible = false;
            this.scene.add(m);
            this.explosionPool.push({
                mesh: m, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1, color: new THREE.Color(0xff8800)
            });
        }

        this.trailParticles = [];
        this.trailNext = 0;
        const trailCount = IS_MOBILE ? 15 : 30;
        for (let i = 0; i < trailCount; i++) {
            const m = new THREE.Mesh(this.geoTrail, this.matTrail.clone());
            m.visible = false;
            this.scene.add(m);
            this.trailParticles.push({ mesh: m, life: 0, maxLife: 0.6 });
        }
    }

    attach(game) {
        this.game = game;
        this.playerMesh = this.geoPlayer.clone(true);
        this.scene.add(this.playerMesh);
        if (!IS_MOBILE) {
            this.playerLight = new THREE.PointLight(0x0088ff, 1, 6);
            this.playerLight.position.set(0, 0, 0.8);
            this.playerMesh.add(this.playerLight);
        }
        this.shieldMesh = new THREE.Mesh(this.geoShield, this.matShield);
        this.shieldMesh.visible = false;
        this.playerMesh.add(this.shieldMesh);
    }

    update(dt) {
        const g = this.game;
        if (!g) { this._render(); return; }
        this._checkPerformance(dt);
        this._updateStarfield(dt);
        this._updateCamera(dt, g);
        this._updatePlayer(g);
        this._updateEnemies(g);
        this._updateBoss(g);
        this._updateBullets(g);
        this._updatePowerups(g);
        this._updateEngineTrail(dt, g);
        this._updateExplosions(dt);
        this._updateMuzzleFlashes(dt);
        this._render();
    }

    _checkPerformance(dt) {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsCheck >= 1000) {
            const fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsCheck = now;
            this.fpsHistory.push(fps);
            if (this.fpsHistory.length > 5) this.fpsHistory.shift();
            const avg = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

            if (avg < 25 && this.qualityLevel !== 'low') {
                this._setQuality('low');
            } else if (avg > 45 && this.qualityLevel === 'low') {
                this._setQuality('medium');
            }
        }
    }

    _setQuality(level) {
        this.qualityLevel = level;
        if (level === 'low') {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
            for (let i = 0; i < this.starLayers.length; i++) {
                const layer = this.starLayers[i];
                const sizes = layer.geometry.attributes.size;
                for (let j = 0; j < sizes.count; j++) {
                    sizes.array[j] = this.baseStarSizes[i][j] * 0.5;
                }
                sizes.needsUpdate = true;
            }
            this.renderer.toneMapping = THREE.NoToneMapping;
        } else if (level === 'medium') {
            const pr = IS_MOBILE ? 1.2 : Math.min(window.devicePixelRatio, 1.5);
            this.renderer.setPixelRatio(pr);
            for (let i = 0; i < this.starLayers.length; i++) {
                const layer = this.starLayers[i];
                const sizes = layer.geometry.attributes.size;
                for (let j = 0; j < sizes.count; j++) {
                    sizes.array[j] = this.baseStarSizes[i][j];
                }
                sizes.needsUpdate = true;
            }
        }
    }

    _updateStarfield(dt) {
        const time = performance.now() * 0.001;
        for (const layer of this.starLayers) {
            const pos = layer.geometry.attributes.position;
            const sizes = layer.geometry.attributes.size;
            const arr = pos.array;
            const speed = layer.userData.speed || 5;
            const spread = layer.userData.spread || 300;
            for (let i = 2; i < arr.length; i += 3) {
                arr[i] += speed * dt * 2;
                if (arr[i] > 20) {
                    arr[i] = -spread;
                    arr[i - 2] = (Math.random() - 0.5) * spread * 2;
                    arr[i - 1] = (Math.random() - 0.5) * spread * 0.3;
                }
            }
            pos.needsUpdate = true;
            if (!IS_MOBILE) {
                const idx = this.starLayers.indexOf(layer);
                const baseSizes = this.baseStarSizes[idx];
                const phases = layer.userData.phases;
                for (let si = 0; si < sizes.count; si++) {
                    const tw = 0.6 + 0.4 * Math.sin(time * 1.5 + phases[si]);
                    sizes.array[si] = baseSizes[si] * tw;
                }
                sizes.needsUpdate = true;
            }
        }
    }

    _updateCamera(dt, g) {
        if (g.state === 'playing' && g.player) {
            const p = g.player;
            const tx = p.x * SCALE;
            const tz = -p.y * SCALE;
            const targetPos = new THREE.Vector3(tx, 26, tz + 20);
            this.camera.position.lerp(targetPos, 4 * dt);
            this.camera.lookAt(tx, 0, tz);
            if (this.shakeAmount > 0.01) {
                this.camera.position.x += (Math.random() - 0.5) * this.shakeAmount * 0.3;
                this.camera.position.z += (Math.random() - 0.5) * this.shakeAmount * 0.3;
                this.camera.position.y += (Math.random() - 0.5) * this.shakeAmount * 0.15;
                this.shakeAmount *= Math.max(0, 1 - 6 * dt);
            } else {
                this.shakeAmount = 0;
            }
        } else {
            const angle = Date.now() * 0.00006;
            this.camera.position.x = Math.sin(angle) * 10;
            this.camera.position.z = 28 + Math.cos(angle) * 6;
            this.camera.position.y = 20;
            this.camera.lookAt(0, 0, 0);
        }
    }

    _updatePlayer(g) {
        if (!this.playerMesh) return;
        if (!g.player || g.state !== 'playing') { this.playerMesh.visible = false; return; }
        const p = g.player;
        this.playerMesh.visible = p.alive;
        if (!p.alive) return;
        const px = p.x * SCALE;
        const pz = -p.y * SCALE;
        this.playerMesh.position.set(px, 1.5, pz);
        const targetRoll = Math.min(0.35, Math.max(-0.35, p.vx * 0.003));
        this.playerMesh.rotation.z += (targetRoll - this.playerMesh.rotation.z) * Math.min(1, 8 * 0.016);
        const targetPitch = Math.min(0.15, Math.max(-0.15, -p.vy * 0.002));
        this.playerMesh.rotation.x += (targetPitch - this.playerMesh.rotation.x) * Math.min(1, 6 * 0.016);
        this.playerMesh.position.y += Math.sin(Date.now() * 0.003) * 0.06;
        if (this.playerLight) {
            this.playerLight.intensity = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
        }
        const hasShield = p.shield > 0;
        this.shieldMesh.visible = hasShield;
        if (hasShield) {
            this.shieldMesh.material.opacity = 0.1 + 0.08 * Math.sin(Date.now() * 0.004);
            this.shieldMesh.scale.setScalar(1.3);
        }
    }

    _updateEnemies(g) {
        const enemies = g.enemyManager ? g.enemyManager.enemies : [];
        while (this.enemyMeshes.length < enemies.length) {
            const idx = this.enemyMeshes.length;
            let mesh;
            if (enemies[idx] && enemies[idx].isElite) {
                mesh = this.geoEnemyElite.clone(true);
            } else {
                mesh = new THREE.Mesh(this.geoEnemyBasic, this.matEnemyBasic);
            }
            this.scene.add(mesh);
            this.enemyMeshes.push(mesh);
        }
        while (this.enemyMeshes.length > enemies.length) {
            const m = this.enemyMeshes.pop();
            this.scene.remove(m);
        }
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            const m = this.enemyMeshes[i];
            if (!e || !e.active) { m.visible = false; continue; }
            m.visible = true;
            m.position.set(e.x * SCALE, 1.2, -e.y * SCALE);
            m.rotation.y += 0.04;
            if (e.hitFlash > 0 && m.material) {
                m.material.emissiveIntensity = 1.0;
            }
            if (IS_MOBILE) {
                m.position.y += Math.sin(Date.now() * 0.004 + i) * 0.05;
            }
        }
    }

    _updateBoss(g) {
        const boss = g.boss;
        if (boss && boss.active) {
            if (!this.bossMesh) {
                this.bossMesh = this.geoBoss.clone(true);
                this.scene.add(this.bossMesh);
            }
            this.bossMesh.visible = true;
            this.bossMesh.position.set(boss.x * SCALE, 2.5, -boss.y * SCALE);
            this.bossMesh.rotation.y += 0.01;
            if (!IS_MOBILE) {
                this.bossMesh.rotation.x = Math.sin(Date.now() * 0.001) * 0.05;
                this.bossMesh.position.y += Math.sin(Date.now() * 0.002) * 0.1;
            }
            if (boss.deathTimer > 0) {
                const s = 1 + (1.5 - Math.min(boss.deathTimer, 1.5)) * 0.4;
                this.bossMesh.scale.setScalar(s);
            } else {
                this.bossMesh.scale.setScalar(1);
            }
        } else if (this.bossMesh) {
            this.bossMesh.visible = false;
        }
    }

    _updateBullets(g) {
        const bm = g.bulletManager;
        const pB = bm ? bm.playerBullets : [];
        const eB = bm ? bm.enemyBullets : [];
        this._syncBulletList(this.bulletMeshes.player, pB, this.geoBullet, this.matBullet, 0x88ffff);
        this._syncBulletList(this.bulletMeshes.enemy, eB, this.geoEBullet, this.matEBullet, 0xff4444);
    }

    _syncBulletList(pool, bullets, geo, mat, color) {
        while (pool.length < bullets.length) {
            const mesh = new THREE.Mesh(geo, mat.clone());
            this.scene.add(mesh);
            pool.push(mesh);
        }
        while (pool.length > bullets.length) {
            const m = pool.pop();
            this.scene.remove(m);
        }
        const now = Date.now() * 0.01;
        for (let i = 0; i < bullets.length; i++) {
            const b = bullets[i];
            const m = pool[i];
            if (!b || !b.active) { m.visible = false; continue; }
            m.visible = true;
            m.position.set(b.x * SCALE, 0.6, -b.y * SCALE);
            const pulse = 0.7 + 0.3 * Math.sin(now + i);
            if (!IS_MOBILE) {
                m.material.opacity = pulse;
            }
        }
    }

    _updatePowerups(g) {
        const pups = g.powerUpManager ? g.powerUpManager.powerups : [];
        while (this.powerupMeshes.length < pups.length) {
            const mesh = new THREE.Mesh(this.geoPowerup, this.matPowerup.clone());
            this.scene.add(mesh);
            this.powerupMeshes.push(mesh);
        }
        while (this.powerupMeshes.length > pups.length) {
            const m = this.powerupMeshes.pop();
            this.scene.remove(m);
        }
        for (let i = 0; i < pups.length; i++) {
            const p = pups[i];
            const m = this.powerupMeshes[i];
            if (!p || !p.active) { m.visible = false; continue; }
            m.visible = true;
            m.position.set(p.x * SCALE, 1.5 + 0.2 * Math.sin(Date.now() * 0.004 + i), -p.y * SCALE);
            m.rotation.x += 0.02;
            m.rotation.y += 0.03;
        }
    }

    _updateEngineTrail(dt, g) {
        for (const t of this.trailParticles) {
            if (t.life <= 0) { t.mesh.visible = false; continue; }
            t.life -= dt;
            const progress = 1 - t.life / t.maxLife;
            t.mesh.material.opacity = (1 - progress) * 0.7;
            t.mesh.scale.multiplyScalar(0.96);
            t.mesh.position.y -= dt * 0.3;
            if (t.life <= 0) t.mesh.visible = false;
        }

        if (!g.player || !g.player.alive || g.state !== 'playing') return;
        const p = g.player;
        const t = this.trailParticles[this.trailNext];
        t.life = t.maxLife = 0.4 + Math.random() * 0.3;
        t.mesh.visible = true;
        t.mesh.position.set(
            p.x * SCALE + (Math.random() - 0.5) * 0.15,
            0.8 + Math.random() * 0.3,
            -p.y * SCALE + 0.7 + (Math.random() - 0.5) * 0.1
        );
        t.mesh.scale.setScalar(0.6 + Math.random() * 0.5);
        t.mesh.material.opacity = 0.7;
        this.trailNext = (this.trailNext + 1) % this.trailParticles.length;
    }

    emitExplosion(x, y, color = '#ff8800', count = 8) {
        const c3 = new THREE.Color(color);
        const actualCount = Math.min(count, this.qualityLevel === 'low' ? 6 : count);
        for (let i = 0; i < actualCount; i++) {
            let p = null;
            for (const ep of this.explosionPool) {
                if (ep.life <= 0) { p = ep; break; }
            }
            if (!p) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * (this.qualityLevel === 'low' ? 2.5 : 4);
            p.mesh.visible = true;
            p.mesh.position.set(x * SCALE, 0.3 + Math.random() * 0.3, -y * SCALE);
            p.vx = Math.cos(angle) * speed;
            p.vz = Math.sin(angle) * speed;
            p.vy = 1 + Math.random() * (IS_MOBILE ? 2 : 3);
            p.life = 0.3 + Math.random() * (IS_MOBILE ? 0.3 : 0.4);
            p.maxLife = p.life;
            p.color.copy(c3);
            p.mesh.material.color.copy(c3);
        }
    }

    emitMuzzleFlash(x, y, color = '#88ffff') {
        const c3 = new THREE.Color(color);
        const light = new THREE.PointLight(c3, IS_MOBILE ? 1 : 2, IS_MOBILE ? 2 : 4);
        light.position.set(x * SCALE, 0.6, -y * SCALE);
        this.scene.add(light);
        this.muzzleFlashes.push({ light, life: 0.06, maxLife: 0.06 });
    }

    _updateExplosions(dt) {
        for (let i = this.explosionPool.length - 1; i >= 0; i--) {
            const p = this.explosionPool[i];
            if (p.life <= 0) { p.mesh.visible = false; continue; }
            p.life -= dt;
            if (p.life <= 0) { p.mesh.visible = false; continue; }
            const t = 1 - p.life / p.maxLife;
            p.mesh.position.x += p.vx * dt;
            p.mesh.position.z += p.vz * dt;
            p.mesh.position.y += p.vy * dt;
            p.vy -= 6 * dt;
            p.mesh.scale.setScalar(0.5 + t * 2);
            p.mesh.material.opacity = 1 - t;
        }
    }

    _updateMuzzleFlashes(dt) {
        for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
            const f = this.muzzleFlashes[i];
            f.life -= dt;
            if (f.life <= 0) {
                this.scene.remove(f.light);
                this.muzzleFlashes.splice(i, 1);
            }
        }
    }

    shake(intensity) {
        this.shakeAmount = Math.max(this.shakeAmount, Math.min(intensity, IS_MOBILE ? 8 : 15));
    }

    _render() {
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    _onResize() {
        this.clientWidth = window.innerWidth;
        this.clientHeight = window.innerHeight;
        this.camera.aspect = this.clientWidth / this.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.clientWidth, this.clientHeight);
        if (this.composer) {
            this.composer.setSize(this.clientWidth, this.clientHeight);
        }
    }

    dispose() {
        this.renderer.dispose();
    }
}

window.Renderer3D = Renderer3D;
