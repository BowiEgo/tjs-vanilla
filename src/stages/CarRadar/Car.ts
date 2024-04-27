// import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/Addons.js';
import BaseObject from '../../core/Object/BaseObject';
import ClippedEdges from '../../core/Object/ClippedEdges';

export default class Car extends BaseObject {
	clippedEdges: ClippedEdges;

	constructor() {
		super();

		this.setMesh();
		this.clippedEdges = new ClippedEdges(this);
	}
	setMaterial() {}
	setMesh() {
		const model = (this.resources.items.PorscheModel as GLTF).scene;
		this.mesh = model;
	}
	update(): void {
		this.clippedEdges?.update();
	}
	destroyed(): void {
		this.clippedEdges?.destroy();
	}
}
