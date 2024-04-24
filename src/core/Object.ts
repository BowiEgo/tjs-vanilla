import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/Addons.js';
import { Engine, createEngine } from './Engine';
import { disposeMeshes } from './Utils';
import Resources from './Resources';
import Time from './Time';
import Cursor from './Cursor';
import Sizes from './Sizes';
import Debug from './Debug';
import GUI from 'lil-gui';

type Material = THREE.MeshBasicMaterial | THREE.MeshStandardMaterial | THREE.ShaderMaterial;

export default class Object {
	engine: Engine;
	scene: THREE.Scene;
	renderer: THREE.WebGLRenderer;
	camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
	sizes: Sizes;
	time: Time;
	cursor: Cursor;
	resources: Resources;
	debug: Debug;
	debugFolder: GUI | undefined;

	texture: THREE.Texture | undefined;
	model: GLTF | undefined;

	geometry:
		| THREE.BoxGeometry
		| THREE.ConeGeometry
		| THREE.RingGeometry
		| THREE.TubeGeometry
		| THREE.EdgesGeometry
		| THREE.LatheGeometry
		| THREE.PlaneGeometry
		| THREE.BufferGeometry
		| undefined;
	material: Material | Material[] | undefined;
	mesh: THREE.Mesh | THREE.Group | undefined;

	constructor() {
		this.engine = createEngine();
		this.scene = this.engine.scene;
		this.renderer = this.engine.renderer.instance;
		this.camera = this.engine.camera.instance;
		this.sizes = this.engine.sizes;
		this.time = this.engine.time;
		this.cursor = this.engine.cursor;
		this.resources = this.engine.resources;
		this.debug = this.engine.debug;

		this.engine.renderer.on('beforeAnimate', this.beforeAnimate.bind(this));
		this.engine.renderer.on('afterAnimate', this.afterAnimate.bind(this));
	}

	setTexture() {}

	setModel() {}

	setGeometry() {}

	setMaterial() {}

	setMesh() {}

	setPostProcessing() {}

	beforeAnimate() {}

	animate() {}

	afterAnimate() {}

	destroy() {
		if (this.mesh) {
			disposeMeshes(this.mesh);
			this.scene.remove(this.mesh);
		}
	}
}
