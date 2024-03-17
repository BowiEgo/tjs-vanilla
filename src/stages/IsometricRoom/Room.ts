import * as THREE from 'three';
import { Experience, createExperience } from '../../core/Experience';
import Resources from '../../core/Resources';
import { disposeMeshes } from '../../core/Utils';
import { GLTF } from 'three/examples/jsm/Addons.js';

export default class Room {
	experience: Experience;
	scene: THREE.Scene;
	resources: Resources;
	resource: GLTF;
	model: THREE.Mesh | THREE.Group;

	constructor() {
		this.experience = createExperience();
		this.scene = this.experience.scene;
		this.resources = this.experience.resources;

		// Setup
		this.resource = this.resources.items.roomModel as GLTF;
		this.model = this.setModel();
	}

	setModel() {
		const model = this.resource.scene;

		this.scene.add(model);

		model.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.castShadow = true;
			}
		});

		return model;
	}

	update() {}

	destroy() {
		disposeMeshes(this.model);
		this.scene.remove(this.model);
	}
}
