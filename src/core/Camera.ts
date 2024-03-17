import { Group, PerspectiveCamera, Scene } from 'three';
import Sizes from './Sizes';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Experience, createExperience } from './Experience';

export default class Camera {
	experience: Experience | null;
	sizes: Sizes;
	scene: Scene;
	canvas: HTMLCanvasElement;
	instance: PerspectiveCamera;
	group: Group;
	controls: OrbitControls;

	constructor() {
		this.experience = createExperience();
		this.sizes = this.experience.sizes;
		this.scene = this.experience.scene;
		this.canvas = this.experience.canvas;

		this.instance = this.setInstance();
		this.group = this.setCameraGroup();
		this.controls = this.setOrbitControls();
	}

	setInstance() {
		const instance = new PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100);
		instance.position.set(6, 4, 8);
		this.scene.add(instance);
		this.instance = instance;
		return instance;
	}

	setOrbitControls() {
		const controls = new OrbitControls(this.instance, this.canvas);
		controls.enableDamping = true;
		this.controls = controls;
		return controls;
	}

	setCameraGroup() {
		const group = new Group();

		group.add(this.instance);
		this.scene.add(group);
		this.group = group;
		return group;
	}

	resize() {
		this.instance.aspect = this.sizes.width / this.sizes.height;
		this.instance.updateProjectionMatrix();
	}

	update() {
		if (this.controls.enabled) {
			this.controls.update();
		}
	}

	destroy() {
		this.controls.dispose();
	}
}
