import * as THREE from 'three';
import { Experience, createExperience } from './Experience';
import Sizes from './Sizes';
import Camera from './Camera';

export const DEFAULT_RENDERER_CLEAR_COLOR = '#2e2e2e';

export default class Renderer {
	experience: Experience | null;
	canvas: HTMLCanvasElement;
	sizes: Sizes;
	scene: THREE.Scene;
	camera: Camera;
	instance: THREE.WebGLRenderer;

	constructor() {
		this.experience = createExperience();
		this.canvas = this.experience.canvas;
		this.sizes = this.experience.sizes;
		this.scene = this.experience.scene;
		this.camera = this.experience.camera;

		this.instance = this.setInstance();
	}

	private setInstance(): THREE.WebGLRenderer {
		const instance = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
		});
		// this is default in three.js
		// this.instance.outputColorSpace = SRGBColorSpace
		instance.toneMapping = THREE.ReinhardToneMapping;
		instance.toneMappingExposure = 1.75;
		instance.shadowMap.enabled = true;
		instance.shadowMap.type = THREE.PCFSoftShadowMap;
		instance.setClearColor(DEFAULT_RENDERER_CLEAR_COLOR);
		this.instance = instance;
		this.resize();
		return instance;
	}

	resize() {
		this.instance.setSize(this.sizes.width, this.sizes.height);
		this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
	}

	update() {
		this.instance.render(this.scene, this.camera.instance);
	}

	destroy() {
		this.instance.dispose();
	}
}
