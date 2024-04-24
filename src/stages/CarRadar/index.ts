import * as THREE from 'three';
import Stage from '../Stage';
import sources from './sources';
import Car from './Car';
import Environment from './Environment';
import RadarWave from './RadarWave';
import Object from '../../core/Object';
import Airflow from './Airflow';

export default class CarRadar extends Stage {
	environment: Environment | undefined;
	car: Object | undefined;
	radarWave: Object | undefined;

	constructor() {
		super();

		this.on('setup', () => {
			// Camera
			this.scene.background = new THREE.Color('#222');
			this.engine?.camera.instance.position.set(0, 0, 8);
			this.engine?.camera.instance.rotation.set(0, 0, 0);
			this.engine?.camera.instance.lookAt(new THREE.Vector3(0, 0, 0));
			// Setup
			this.environment = new Environment();

			const car = new Car();

			this.addObject(car);
			// this.addObject(new RadarWave());
			this.addObject(new Airflow());
		});

		this.on('animate', () => {});

		this.on('destroy', () => {
			this.environment?.destroy();
		});

		this.resources.load(sources);
	}
}
