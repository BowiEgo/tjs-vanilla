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

export type Experience = {
	canvas: HTMLCanvasElement;
	debug: Debug;
	sizes: Sizes;
	time: Time;
	scene: THREE.Scene;
	// intro: Intro | null;
	camera: Camera;
	// cursor: Cursor;
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

let instance: Experience | null = null;

export function createExperience(canvas?: HTMLCanvasElement | null): Experience {
	if (instance) return instance;

	if (!canvas) throw new Error(`can't create experience because missing canvas element`);

	const experience = {} as Experience;
	instance = experience;

	// Options
	experience.canvas = canvas;

	// Options
	experience.canvas = canvas;

	// Setup
	experience.debug = new Debug();
	experience.sizes = new Sizes();
	experience.time = new Time();
	experience.scene = new THREE.Scene();
	experience.camera = new Camera();
	// experience.cursor = new Cursor();
	// experience.scroll = new Scroll();
	experience.renderer = new Renderer();
	experience.effect = new Effect();
	experience.resources = new Resources();

	experience.createStage = (stage: Stage) => {
		experience.stage = stage;
	};
	experience.destroyStage = () => {
		experience.stage?.destroy();
		experience.stage = null;
		if (experience.debug.active) {
			experience.debug.ui?.destroy();
			experience.debug = new Debug();
		}
	};
	experience.resize = () => {
		experience.camera.resize();
		experience.renderer.resize();
		experience.effect.resize();
	};
	experience.update = () => {
		experience.camera.update();
		experience.stage?.update();
		experience.effect.update();
		experience.effect.instance.passes.length === 0 && experience.renderer.update();
	};
	experience.destroy = () => {
		experience.sizes.off('resize');
		experience.time.off('tick');
		disposeMeshes(experience.scene);
		// experience.intro?.destroy();
		// experience.cursor.destroy();
		// experience.scroll.destroy();
		experience.camera.destroy();
		experience.effect.destroy();
		experience.renderer.destroy();
		if (experience.debug.active) {
			experience.debug.ui?.destroy();
		}
		instance = null;
	};

	// Resize event
	experience.sizes.on('resize', () => {
		experience.resize();
	});

	// Time tick event
	experience.time.on('tick', () => {
		experience.update();
	});

	return experience;
}
