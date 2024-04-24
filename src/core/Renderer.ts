import * as THREE from 'three';
import { Engine, createEngine } from './Engine';
import Sizes from './Sizes';
import Camera from './Camera';
import EventEmitter from './EventEmitter';

export const DEFAULT_RENDERER_CLEAR_COLOR = '#2e2e2e';

export default class Renderer extends EventEmitter {
	engine: Engine | null;
	canvas: HTMLCanvasElement;
	sizes: Sizes;
	scene: THREE.Scene;
	camera: Camera;
	instance: THREE.WebGLRenderer;

	constructor() {
		super();
		this.engine = createEngine();
		this.canvas = this.engine.canvas;
		this.sizes = this.engine.sizes;
		this.scene = this.engine.scene;
		this.camera = this.engine.camera;

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

	animate() {
		this.trigger('beforeAnimate');
		this.instance.render(this.scene, this.camera.instance);
		this.trigger('afterAnimate');
	}

	destroy() {
		this.off('beforeAnimate');
		this.off('afterAnimate');
		this.instance.dispose();
	}
}
