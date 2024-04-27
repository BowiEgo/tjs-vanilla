import * as THREE from 'three';
import Sizes from './Sizes';
import Camera from './Camera';
import Renderer from './Renderer';
import Stage from '../stages/Stage';
import Resources from './Resources';
import Time from './Time';
import { disposeMeshes } from './Utils';
import Effect from './Effect';
import Debug from './Debug';
import Cursor from './Cursor';

export type Engine = {
	canvas: HTMLCanvasElement;
	debug: Debug;
	sizes: Sizes;
	time: Time;
	scene: THREE.Scene;
	// intro: Intro | null;
	camera: Camera;
	cursor: Cursor;
	// scroll: Scroll;
	renderer: Renderer;
	stage: Stage | null;
	resources: Resources;
	effect: Effect;
	createStage: (stage: Stage) => void;
	destroyStage: () => void;
	destroyObjects: () => void;
	resize: () => void;
	update: () => void;
	destroy: () => void;
};

let instance: Engine | null = null;

export function createEngine(canvas?: HTMLCanvasElement | null): Engine {
	if (instance) return instance;

	if (!canvas) throw new Error(`can't create Engine because missing canvas element`);

	const engine = {} as Engine;
	instance = engine;

	// Options
	engine.canvas = canvas;

	// Options
	engine.canvas = canvas;

	// Setup
	engine.debug = new Debug();
	engine.sizes = new Sizes();
	engine.time = new Time();
	engine.scene = new THREE.Scene();
	engine.camera = new Camera();
	engine.cursor = new Cursor();
	// engine.scroll = new Scroll();
	engine.renderer = new Renderer();
	engine.effect = new Effect();
	engine.resources = new Resources();

	engine.createStage = (stage: Stage) => {
		engine.stage = stage;
	};
	engine.destroyStage = () => {
		engine.stage?.destroy();
		engine.stage = null;
		if (engine.debug.active) {
			engine.debug.ui?.destroy();
			engine.debug = new Debug();
		}
	};
	engine.resize = () => {
		engine.camera.resize();
		engine.renderer.resize();
		engine.effect.resize();
	};
	engine.update = () => {
		engine.camera.update();
		engine.stage?.update();
		engine.effect.update();
		engine.effect.instance.passes.length === 0 && engine.renderer.update();
	};
	engine.destroy = () => {
		engine.sizes.off('resize');
		engine.time.off('tick');
		disposeMeshes(engine.scene);
		// engine.intro?.destroy();
		engine.cursor.destroy();
		// engine.scroll.destroy();
		engine.camera.destroy();
		engine.effect.destroy();
		engine.renderer.destroy();
		if (engine.debug.active) {
			engine.debug.ui?.destroy();
		}
		instance = null;
	};

	// Resize event
	engine.sizes.on('resize', () => {
		engine.resize();
	});

	// Time tick event
	engine.time.on('tick', () => {
		engine.update();
	});

	return engine;
}
