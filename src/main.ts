import './style.css';
import { createEngine } from './core/Engine.js';
import {
	CarRadarStage,
	// IsometricRoomStage,
} from './stages';

window.engine = createEngine(document.querySelector('.webgl') as HTMLCanvasElement);
window.engine.createStage(new CarRadarStage());
