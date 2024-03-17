import * as THREE from 'three';

export function disposeMeshes(mesh: THREE.Scene | THREE.Mesh | THREE.Group | THREE.Points) {
	// Travese the whole scene
	mesh.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			child.geometry.dispose();

			// Loop through the material properties
			for (const key in child.material) {
				const value = child.material[key];

				// Test if there is a dispose function
				if (value && typeof value.dispose === 'function') {
					value.dispose();
				}
			}
		}
	});
}
