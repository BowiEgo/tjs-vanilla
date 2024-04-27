import * as THREE from 'three';
import Object from '../../core/Object/BaseObject';
import vertex from '../../shaders/RadarWave/vertex.glsl';
import fragment from '../../shaders/RadarWave/fragment.glsl';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { disposeMeshes } from '../../core/Utils';

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

	constructor({ postMesh }: { postMesh: THREE.Mesh | THREE.Group }) {
		super();
		// Debug
		if (this.debug.active) {
			this.debugFolder = this.debug.ui?.addFolder('RadarWave');
		}

		// Setup
		this.postMesh = postMesh;
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
		this.setRenderTarget();

		this.debugFolder
			?.add(this.postMesh.rotation, 'x')
			.name('postMeshRotationX')
			.min(-5)
			.max(5)
			.step(0.001);

		this.debugFolder?.add(this.postMesh.position, 'z').name('postMeshPositionZ').min(-5).max(5);

		this.debugFolder
			?.add(this.params, 'num')
			.name('num')
			.min(0)
			.max(100)
			.step(1)
			.onChange(() => {
				this.setGeometry();
				this.setMesh();
			});

		this.debugFolder
			?.add(this.params, 'stripeGap')
			.name('stripeGap')
			.min(0)
			.max(10)
			.onChange(() => {
				this.setGeometry();
				this.setMesh();
			});

		this.debugFolder
			?.add(this.params.stripePosition, 'x')
			.name('stripePositionX')
			.min(-5)
			.max(5)
			.onChange(() => {
				this.setGeometry();
				this.setMesh();
			});

		this.debugFolder
			?.add(this.params.stripePosition, 'y')
			.name('stripePositionY')
			.min(-5)
			.max(5)
			.onChange(() => {
				this.setGeometry();
				this.setMesh();
			});

		this.debugFolder
			?.add(this.params.stripeRotation, 'x')
			.name('stripeRotationX')
			.min(-Math.PI)
			.max(Math.PI)
			.onChange(() => {
				this.setGeometry();
				this.setMesh();
			});

		this.debugFolder
			?.add(this.params.stripeRotation, 'y')
			.name('stripeRotationY')
			.min(-Math.PI)
			.max(Math.PI)
			.onChange(() => {
				this.setGeometry();
				this.setMesh();
			});

		this.debugFolder
			?.add(this.params.stripeRotation, 'z')
			.name('stripeRotationZ')
			.min(-Math.PI)
			.max(Math.PI)
			.onChange(() => {
				this.setGeometry();
				this.setMesh();
			});

		this.debugFolder
			?.add(this.params, 'stripeWidth')
			.name('stripeWidth')
			.min(0)
			.max(10)
			.onChange(() => {
				this.setGeometry();
				this.setMesh();
			});

		this.debugFolder
			?.add(this.params, 'stripeLength')
			.name('stripeLength')
			.min(0)
			.max(10)
			.onChange(() => {
				this.setGeometry();
				this.setMesh();
			});

		this.debugFolder
			?.add(this.params, 'stripeIntervalProp', ['x', 'y', 'z'])
			.name('stripeIntervalProp')
			.onChange(() => {
				this.setGeometry();
				this.setMesh();
			});

		// Shader
		this.debugFolder
			?.add(this.params, 'offset')
			.name('offset')
			.min(-5)
			.max(5)
			.onChange((val: number) => {
				this.material.uniforms.offset.value = val;
			});

		this.debugFolder
			?.add(this.params, 'vibration')
			.name('vibration')
			.min(-5)
			.max(5)
			.onChange((val: number) => {
				this.material.uniforms.vibration.value = val;
			});
	}

	setRenderTarget() {
		if (this.mesh) {
			this.target = new THREE.WebGLRenderTarget(this.sizes.width, this.sizes.height);
			this.target.texture.minFilter = THREE.NearestFilter;
			this.target.texture.magFilter = THREE.NearestFilter;
			this.target.stencilBuffer = false;
			this.target.depthTexture = new THREE.DepthTexture(this.sizes.width, this.sizes.height);
			this.target.depthTexture.format = THREE.DepthFormat;
			this.target.depthTexture.type = THREE.UnsignedShortType;

			this.postMesh.rotation.x = Math.PI / 2;
			this.postMesh.position.z = -3;
			this.postScene?.add(this.postMesh);
		}
	}

	setGeometry(): void {
		this.geometry = new THREE.PlaneGeometry(
			this.params.stripeWidth,
			this.params.stripeLength,
			100,
			1
		);
	}

	setMaterial(): void {
		this.material = new THREE.ShaderMaterial({
			// extensions: {
			// 	derivatives: '#extension GL_OES_standard_deribatives : enable',
			// },
			side: THREE.DoubleSide,
			uniforms: {
				uResolution: { value: new THREE.Vector4() },
				uMouse: { value: new THREE.Vector2(0, 0) },
				uTime: { value: 0 },
				depthInfo: { value: null },
				cameraNear: { value: this.postCamera.near },
				cameraFar: { value: this.postCamera.far },
				tDiffuse: { value: null },
				tDepth: { value: null },
				offset: { value: this.params.offset },
				vibration: { value: this.params.vibration },
			},
			vertexShader: vertex,
			fragmentShader: fragment,
		});
	}

	setMesh(): void {
		if (this.mesh && this.mesh.children.length > 0) {
			disposeMeshes(this.mesh);
			this.scene.remove(this.mesh);
		}

		this.mesh = new THREE.Group();

		let { num } = this.params;
		for (let i = 0; i < num; i++) {
			const geometry = this.geometry?.clone();
			let y = [];
			const len = geometry.attributes.position.array.length;
			for (let j = 0; j < len / 3; j++) {
				y.push(i / num);
			}

			geometry?.setAttribute('y', new THREE.BufferAttribute(new Float32Array(y), 1));

			let stripe = new THREE.Mesh(geometry, this.material);
			stripe.position.x = this.params.stripePosition.x;
			stripe.position.y = this.params.stripePosition.y;
			stripe.position[this.params.stripeIntervalProp] =
				((i - num / 2) / num) * this.params.stripeGap;
			stripe.rotation.x = this.params.stripeRotation.x;
			stripe.rotation.y = this.params.stripeRotation.y;
			stripe.rotation.z = this.params.stripeRotation.z;
			// mesh.rotation.y = Math.PI / 2;

			this.mesh.add(stripe);
		}

		// for (let i = 0; i < num; i++) {
		// 	const geometry = new THREE.PlaneGeometry(0.04, 6, 100, 1);

		// 	let y = [];
		// 	const len = geometry.attributes.position.array.length;
		// 	for (let j = 0; j < len / 3; j++) {
		// 		y.push(1 - i / num);
		// 	}

		// 	geometry.setAttribute('y', new THREE.BufferAttribute(new Float32Array(y), 1));

		// 	let stripe = new THREE.Mesh(geometry, this.material);
		// 	// let mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
		// 	stripe.position.x = ((i - num / 2) / num) * 4.5;
		// 	stripe.position.y = 3;
		// 	stripe.rotation.x = -Math.PI / 2;
		// 	// stripe.rotation.y = Math.PI / 2;

		// 	this.mesh.add(stripe);
		// }

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
			this.material.uniforms.uTime.value = this.time.elapsed;
			this.material.uniforms.uMouse.value.set(
				(this.cursor.x + 0.5) * 2048,
				(this.cursor.y + 0.5) * 2048
			);
		}
	}
}
