import * as THREE from 'three';
import { SSREffect } from 'screen-space-reflections';
import * as POSTPROCESSING from 'postprocessing';
import { Engine, createEngine } from '../../core/Engine';
import Resources from '../../core/Resources';
import { disposeMeshes } from '../../core/Utils';
import { GLTF } from 'three/examples/jsm/Addons.js';
import { Textures } from '../type';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const ssrOpts = {
	intensity: 1,
	exponent: 1,
	distance: 10,
	fade: 0,
	roughnessFade: 1,
	thickness: 10,
	ior: 1.45,
	maxRoughness: 1,
	maxDepthDifference: 10,
	blend: 0.9,
	correction: 1,
	correctionRadius: 1,
	blur: 0.5,
	blurKernel: 1,
	blurSharpness: 10,
	jitter: 0,
	jitterRoughness: 0,
	steps: 20,
	refineSteps: 5,
	missedRays: true,
	useNormalMap: true,
	useRoughnessMap: true,
	resolutionScale: 1,
	velocityResolutionScale: 1,
};

export default class Room {
	engine: Engine;
	scene: THREE.Scene;
	resources: Resources;
	gltfModel: GLTF;
	textures: Textures;
	mesh: THREE.Mesh | THREE.Group;

	constructor() {
		this.engine = createEngine();
		this.scene = this.engine.scene;
		this.resources = this.engine.resources;

		// Setup
		this.scene.background = new THREE.Color('rgb(239, 213, 213)');
		this.gltfModel = this.resources.items.roomModel as GLTF;
		this.textures = this.setTextures();
		this.mesh = this.setMesh();
		this.setPostProcessing();
	}

	setTextures() {
		const bakedTexture = this.resources.items.bakedTexture as THREE.Texture;
		bakedTexture.flipY = false;
		bakedTexture.colorSpace = THREE.SRGBColorSpace;

		const textures = {
			color: bakedTexture,
		};

		return textures;
	}

	setMesh() {
		const bakedMaterial = new THREE.MeshBasicMaterial({ map: this.textures.color });
		const lightMaterial = new THREE.MeshStandardMaterial({
			color: '#ffd6d6',
			emissive: '#fff',
		});
		const screenMaterial = new THREE.MeshStandardMaterial({
			color: '#222',
			metalness: 1,
			roughness: 0.3,
		});
		const mirrorMaterial = new THREE.MeshStandardMaterial({
			color: '#fff',
			metalness: 1,
			roughness: 0,
		});
		const translucentMaterial = new THREE.MeshStandardMaterial({
			color: '#ffd6d6',
			emissive: '#dedede',
			transparent: true,
			opacity: 0.8,
		});

		this.gltfModel.scene.traverse((child: THREE.Object3D) => {
			console.log(child.name);

			if (child.name.indexOf('baked') > -1) {
				(child as THREE.Mesh).material = bakedMaterial;
			}

			if (child.name.indexOf('candle') > -1 || child.name.indexOf('light') > -1) {
				(child as THREE.Mesh).material = lightMaterial;
			}

			if (child.name.indexOf('mirror') > -1) {
				(child as THREE.Mesh).material = mirrorMaterial;
			}

			if (child.name.indexOf('screen') > -1) {
				(child as THREE.Mesh).material = screenMaterial;
			}

			if (child.name.indexOf('curtain') > -1) {
				(child as THREE.Mesh).material = translucentMaterial;
			}
		});

		const mesh = this.gltfModel.scene;
		mesh.castShadow = true;

		this.mesh = mesh;
		this.scene.add(mesh);
		return mesh;
	}

	setPostProcessing() {
		const composer = new POSTPROCESSING.EffectComposer(this.engine.renderer.instance);

		const ssrEffect = new SSREffect(this.scene, this.engine.camera.instance, ssrOpts);

		const ssrPass = new POSTPROCESSING.EffectPass(this.engine.camera.instance, ssrEffect);

		composer.addPass(ssrPass);
	}

	update() {}

	destroy() {
		disposeMeshes(this.mesh);
		this.scene.remove(this.mesh);
	}
}
