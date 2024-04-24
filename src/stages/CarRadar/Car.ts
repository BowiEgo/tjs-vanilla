import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/Addons.js';
import Object from '../../core/Object';

export default class Car extends Object {
	constructor() {
		super();
		// Setup

		this.setMesh();
	}

	setMesh() {
		const model = (this.resources.items.PorscheModel as GLTF).scene;

		this.scene.add(model);

		model.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.castShadow = true;
				child.material = new THREE.MeshBasicMaterial({
					color: 'rgb(37, 166, 241)',
				});
			}
		});

		this.mesh = model;

		return model;
	}
}
