import './style.css';
import { createExperience } from './core/Experience.js';
import IsometricRoomStage from './stages/IsometricRoom/index.js';

window.experience = createExperience(document.querySelector('.webgl') as HTMLCanvasElement);
window.experience.createStage(new IsometricRoomStage());
