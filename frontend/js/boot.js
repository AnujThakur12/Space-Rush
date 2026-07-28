import './renderer3d.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game-container');
    const renderer3d = new Renderer3D(container);
    const game = new SkyStrike(renderer3d);
    window.renderer3d = renderer3d;
    window.game = game;

    const btn = document.getElementById('touchPause');
    if (btn) {
        const handler = (e) => {
            e.stopPropagation();
            if (game.state === 'playing' && !game.gameOver) {
                game.togglePause();
            }
        };
        btn.addEventListener('click', handler);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handler(e);
        }, { passive: false });
    }
});
