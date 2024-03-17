import {
	CameraHelper,
	CubeTexture,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial,
	Scene,
} from 'three';
import Resources from '../../core/Resources';
import Debug from '../../core/Debug';
import GUI from 'lil-gui';
import { Experience, createExperience } from '../../core/Experience';

type EnvironmentMap = {
	intensity: number;
	texture: CubeTexture;
	updateMaterial: () => void;
};

export default class Environment {
	experience: Experience;
	scene: Scene;
	debug: Debug;
	debugFolder: GUI | undefined;
	resources: Resources;
	sunLight: DirectionalLight;
	environmentMap: EnvironmentMap;

	constructor() {
		this.experience = createExperience();
		this.scene = this.experience.scene;
		this.resources = this.experience.resources;
		this.debug = this.experience.debug;

		// Debug
		if (this.debug.active) {
			this.debugFolder = this.debug.ui?.addFolder('Environment');
		}

		// Setup
		this.sunLight = this.setSunLight();
		this.environmentMap = this.setEnvironmentMap();
	}

	setSunLight() {
		const directionalLight = new DirectionalLight(0xffffff, 4);
		directionalLight.position.set(3.5, 2, -1.25);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(1024, 1024);
		directionalLight.shadow.normalBias = 0.05;
		// directionalLight.shadow.camera.top = 2
		// directionalLight.shadow.camera.right = 2
		// directionalLight.shadow.camera.bottom = -2
		// directionalLight.shadow.camera.left = -2
		// directionalLight.shadow.camera.near = 1
		directionalLight.shadow.camera.far = 15;
		// directionalLight.shadow.radius = 10
		this.sunLight = directionalLight;
		this.scene.add(directionalLight);

		const directionalLightCameraHelper = new CameraHelper(directionalLight.shadow.camera);
		directionalLightCameraHelper.visible = false;
		this.scene.add(directionalLightCameraHelper);

		// Debug
		if (this.debug.active) {
			this.debugFolder
				?.add(this.sunLight, 'intensity')
				.name('sunLightIntensity')
				.min(0)
				.max(10)
				.step(0.001);

			this.debugFolder
				?.add(this.sunLight.position, 'x')
				.name('sunLightX')
				.min(-5)
				.max(5)
				.step(0.001);

			this.debugFolder
				?.add(this.sunLight.position, 'y')
				.name('sunLightY')
				.min(-5)
				.max(5)
				.step(0.001);

			this.debugFolder
				?.add(this.sunLight.position, 'z')
				.name('sunLightZ')
				.min(-5)
				.max(5)
				.step(0.001);
		}

		return directionalLight;
	}

	setEnvironmentMap() {
		const environmentMap = {} as EnvironmentMap;
		environmentMap.intensity = 2.4;
		environmentMap.texture = this.resources.items.environmentMapTexture as CubeTexture;

		this.environmentMap = environmentMap;
		this.scene.environment = environmentMap.texture;

		this.environmentMap.updateMaterial = () => {
			this.scene.traverse((child) => {
				if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
					child.material.envMap = this.environmentMap.texture;
					child.material.envMapIntensity = this.environmentMap.intensity;
					child.material.needsUpdate = true;
				}
			});
		};

		this.environmentMap.updateMaterial();

		// Debug
		if (this.debug.active) {
			this.debugFolder
				?.add(this.environmentMap, 'intensity')
				.name('envMapIntensity')
				.min(0)
				.max(4)
				.step(0.001)
				.onChange(this.environmentMap.updateMaterial);
		}

		return environmentMap;
	}

	destroy() {
		this.sunLight.dispose();
		this.scene.remove(this.sunLight);
		this.scene.environment = null;
	}
}
