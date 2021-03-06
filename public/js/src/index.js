import '../../../node_modules/font-awesome/css/font-awesome.css';
import '../../css/app.css';

import Game from './game';
import {models, textures, music, programs} from './assets';

const canvas                  = document.querySelector(`canvas`),
    debug                   = document.querySelector(`.debug`),
    loading                 = document.querySelector(`.loading`),
    hud                     = document.querySelector(`.hud`),
    gl                      = canvas.getContext(`webgl`);

canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

const load = async () => {
    const objPrograms = programs(gl),
        game = new Game(
            canvas,
            hud,
            debug,
            gl,
            models,
            await textures(),
            music,
            objPrograms
        );

    loading.remove();
    //game.menu....
    game.start();
};

window.addEventListener(`load`, load);
window.addEventListener(`error`, err => console.log(err));

/*if (module.hot) {
    module.hot.accept('./print.js', function() {
        console.log('Accepting the updated printMe module!');
        printMe();
    })
}*/