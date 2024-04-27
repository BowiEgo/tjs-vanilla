import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/Addons.js';
import BaseObject from '../../core/Object/BaseObject';
import vertex from '../../shaders/airflow.vert';
import fragment from '../../shaders/airflow.frag';

export default class Airflow extends BaseObject {
	target: THREE.WebGLRenderTarget | undefined;
	postMesh: THREE.Mesh | THREE.Group;
	perlinTexture: THREE.Texture;
	params: {
		count: number;
		lineFrequency: number;
		lineAmplitude: number;
		overallSpeed: number;
		turbulentSpeed: number;
		offsetSpeed: number;
		flowSpeed: number;
	};

	constructor() {
		super();
		// Debug
		if (this.debug.active) {
			this.debugFolder = this.debug.ui?.addFolder('Airflow');
		}

		// Setup
		this.postMesh = (this.resources.items.AirflowMesh as GLTF).scene;
		this.perlinTexture = this.resources.items.PerlinTexture as THREE.Texture;

		this.params = {
			count: 8,
			lineFrequency: 10,
			lineAmplitude: 0.5,
			overallSpeed: 0.2,
			turbulentSpeed: 5,
			offsetSpeed: 5,
			flowSpeed: 4,
		};

		this.debugFolder
			?.add(this.params, 'count')
			.name('count')
			.min(1)
			.max(20)
			.step(1)
			.onChange((val: number) => {
				if (this.material && this.material instanceof THREE.ShaderMaterial) {
					this.material.uniforms.u_linesPerGroup.value = val;
				}
			});

		this.debugFolder
			?.add(this.params, 'lineFrequency')
			.name('lineFrequency')
			.min(0)
			.max(100)
			.onChange((val: number) => {
				(this.material as THREE.ShaderMaterial).uniforms.u_lineFrequency.value = val;
			});

		this.debugFolder
			?.add(this.params, 'lineAmplitude')
			.name('lineAmplitude')
			.min(0)
			.max(10)
			.onChange((val: number) => {
				(this.material as THREE.ShaderMaterial).uniforms.u_lineAmplitude.value = val;
			});

		this.debugFolder
			?.add(this.params, 'overallSpeed')
			.name('overallSpeed')
			.min(0)
			.max(10)
			.onChange((val: number) => {
				(this.material as THREE.ShaderMaterial).uniforms.u_turbulentSpeed.value =
					val * this.params.turbulentSpeed;
				(this.material as THREE.ShaderMaterial).uniforms.u_offsetSpeed.value =
					val * this.params.offsetSpeed;
				(this.material as THREE.ShaderMaterial).uniforms.u_flowSpeed.value =
					val * this.params.flowSpeed;
			});

		this.debugFolder
			?.add(this.params, 'turbulentSpeed')
			.name('turbulentSpeed')
			.min(0)
			.max(100)
			.onChange((val: number) => {
				(this.material as THREE.ShaderMaterial).uniforms.u_turbulentSpeed.value =
					val * this.params.overallSpeed;
			});

		this.debugFolder
			?.add(this.params, 'offsetSpeed')
			.name('offsetSpeed')
			.min(0)
			.max(100)
			.onChange((val: number) => {
				(this.material as THREE.ShaderMaterial).uniforms.u_offsetSpeed.value =
					val * this.params.overallSpeed;
			});

		this.debugFolder
			?.add(this.params, 'flowSpeed')
			.name('flowSpeed')
			.min(0)
			.max(10)
			.onChange((val: number) => {
				(this.material as THREE.ShaderMaterial).uniforms.u_flowSpeed.value =
					val * this.params.overallSpeed;
			});

		this.setGeometry();
		this.setMaterial();
		this.setMesh();
	}

	setGeometry(): void {
		// this.geometry = new THREE.PlaneGeometry(2, 16);
		// this.geometry.translate(0, 0, -1);
		// this.geometry.rotateX(Math.PI / 2);
		this.geometry = (this.postMesh.children[0] as THREE.Mesh).geometry.clone();
	}

	setMaterial(): void {
		this.material = new THREE.ShaderMaterial({
			side: THREE.DoubleSide,
			uniforms: {
				u_resolution: new THREE.Uniform(
					new THREE.Vector4(this.sizes.width, this.sizes.height)
				),
				u_time: new THREE.Uniform(0),
				u_perlinTexture: new THREE.Uniform(this.perlinTexture),
				u_linesPerGroup: new THREE.Uniform(this.params.count),
				u_lineFrequency: new THREE.Uniform(this.params.lineFrequency),
				u_lineAmplitude: new THREE.Uniform(this.params.lineAmplitude),
				u_turbulentSpeed: new THREE.Uniform(
					this.params.turbulentSpeed * this.params.overallSpeed
				),
				u_offsetSpeed: new THREE.Uniform(
					this.params.offsetSpeed * this.params.overallSpeed
				),
				u_flowSpeed: new THREE.Uniform(this.params.flowSpeed * this.params.overallSpeed),
			},
			transparent: true,
			depthWrite: false,
			vertexShader: vertex,
			fragmentShader: fragment,
		});
	}

	setMesh(): void {
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.y = 0.1;
	}

	beforeUpdate(): void {}

	update(): void {
		if (this.material instanceof THREE.ShaderMaterial) {
			this.material.uniforms.u_time.value = this.time.elapsed;
		}
	}
}
