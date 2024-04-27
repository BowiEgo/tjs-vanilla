import * as THREE from 'three';
import Object from '../../core/Object/BaseObject';

export default class Clip extends Object {
	params: {
		constant: number;
	};
	clipPlane: THREE.Plane | undefined;

	constructor() {
		super();
		// Setup
		this.renderer.localClippingEnabled = true;
		this.params = {
			constant: 0,
		};

		this.setClipPlane();
		// this.setHelper();

		// Debug
		if (this.debug.active) {
			this.debugFolder = this.debug.ui?.addFolder('Clip');
			this.debugFolder
				?.add(this.params, 'constant')
				.name('constant')
				.min(-5)
				.max(5)
				.step(0.0001)
				.onChange((val: number) => {
					if (this.clipPlane) {
						this.clipPlane.constant = val;
					}
				});
		}
	}

	setClipPlane(): void {
		this.clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
	}

	setHelper(): void {
		const helpers = new THREE.Group();

		if (this.clipPlane) {
			helpers.add(new THREE.PlaneHelper(this.clipPlane, 2, 0xff0000));
		}

		helpers.visible = true;
		this.scene.add(helpers);
	}

	update(): void {}

	destroy(): void {
		this.renderer.localClippingEnabled = false;
	}
}
