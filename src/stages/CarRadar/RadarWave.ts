import * as THREE from 'three';
import Object from '../../core/Object/BaseObject';
import vertex from '../../shaders/radarWave.vert';
import fragment from '../../shaders/radarWave.frag';
import { GLTF } from 'three/examples/jsm/Addons.js';

export default class RadarWave extends Object {
	target: THREE.WebGLRenderTarget | undefined;
	postMesh: THREE.Mesh | THREE.Group;
	postScene: THREE.Scene;
	postCamera: THREE.PerspectiveCamera;
	params: {
		num: number;
		stripeGap: number;
		stripeWidth: number;
		stripeLength: number;
		stripePosition: { x: number; y: number; z: number };
		stripeRotation: { x: number; y: number; z: number };
		stripeIntervalProp: 'x' | 'y' | 'z';
		offset: number;
		vibration: number;
	};

	constructor() {
		super();
		// Debug
		if (this.debug.active) {
			this.debugFolder = this.debug.ui?.addFolder('RadarWave');
		}

		// Setup
		this.postMesh = (this.resources.items.RadarwaveMesh as GLTF).scene;

		this.postScene = new THREE.Scene();
		this.postCamera = new THREE.PerspectiveCamera(70, 1, 1, 6);
		this.postCamera.position.z = 3;

		this.params = {
			num: 30,
			stripeGap: 8.5,
			stripeWidth: 10,
			stripeLength: 0.04,
			stripePosition: { x: 0, y: 1.55, z: 0 },
			stripeRotation: { x: Math.PI / 2, y: 0, z: Math.PI / 2 },
			stripeIntervalProp: 'x',
			offset: 3.77,
			vibration: 1.8,
		};

		this.setGeometry();
		this.setMaterial();
		this.setMesh();
	}

	setGeometry(): void {
		// this.geometry = new THREE.BoxGeometry(1, 2);
		this.geometry = (this.postMesh.children[0] as THREE.Mesh).geometry.clone();
	}

	setMaterial(): void {
		this.material = new THREE.ShaderMaterial({
			// extensions: {
			// 	derivatives: '#extension GL_OES_standard_deribatives : enable',
			// },
			side: THREE.DoubleSide,
			uniforms: {
				u_resolution: { value: new THREE.Vector4(this.sizes.width, this.sizes.height) },
				uMouse: { value: new THREE.Vector2(0, 0) },
				u_time: { value: 0 },
				depthInfo: { value: null },
				cameraNear: { value: this.postCamera.near },
				cameraFar: { value: this.postCamera.far },
				tDiffuse: { value: null },
				tDepth: { value: null },
				offset: { value: this.params.offset },
				vibration: { value: this.params.vibration },
			},
			transparent: true,
			vertexShader: vertex,
			fragmentShader: fragment,
		});
	}

	setMesh(): void {
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.y = 0;

		this.scene.add(this.mesh);
	}

	beforeUpdate(): void {
		if (this.target) {
			this.renderer.setRenderTarget(this.target);
		}
		this.renderer.render(this.postScene, this.postCamera);

		if (this.material instanceof THREE.ShaderMaterial) {
			this.material.uniforms.tDiffuse.value = this.target?.texture;
			this.material.uniforms.tDepth.value = this.target?.depthTexture;
			this.renderer.setRenderTarget(null);
		}
	}

	update(): void {
		if (this.material instanceof THREE.ShaderMaterial) {
			this.material.uniforms.u_time.value = this.time.elapsed;
			this.material.uniforms.uMouse.value.set(
				(this.cursor.x + 0.5) * 2048,
				(this.cursor.y + 0.5) * 2048
			);
		}
	}
}
