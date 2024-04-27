import * as THREE from 'three';
import Stage from '../Stage';
import sources from './sources';
import Car from './Car';
import Environment from './Environment';
import Object from '../../core/Object/BaseObject';
import Airflow from './Airflow';

export default class CarRadar extends Stage {
	environment: Environment | undefined;
	car: Object | undefined;
	radarWave: Object | undefined;

	constructor() {
		super();

		this.on('setup', () => {
			// Camera
			this.scene.background = new THREE.Color('#1b3440');
			this.engine?.camera.instance.position.set(0, 0, 8);
			this.engine?.camera.instance.rotation.set(0, 0, 0);
			this.engine?.camera.instance.lookAt(new THREE.Vector3(0, 0, 0));
			// Setup
			this.environment = new Environment();

			const car = new Car();
			const airflow = new Airflow();
			if (airflow.mesh) {
				airflow.mesh.position.y += 0.8;
				airflow.mesh.rotation.y = Math.PI / 2;
			}

			this.addObject(car);
			// car.destroy();

			// this.addObject(new RadarWave());
			this.addObject(airflow);
		});

		this.on('update', () => {});

		this.on('destroy', () => {
			this.environment?.destroy();
		});

		this.resources.load(sources);
	}
}
