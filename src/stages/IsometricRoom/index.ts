import * as THREE from 'three';
import Stage from '../Stage';
import Room from './Room';
import sources from './sources';
import Environment from './Environment';

export default class IsometricRoomStage extends Stage {
	environment: Environment | null = null;
	room: Room | null = null;

	constructor() {
		super();

		this.on('setup', () => {
			// Camera
			this.experience?.camera.instance.position.set(4, 12, 12);
			this.experience?.camera.instance.rotation.set(0, 0, 0);
			this.experience?.camera.instance.lookAt(new THREE.Vector3(0, 0, 0));
			// Setup
			this.environment = new Environment();
			this.room = new Room();
		});

		this.on('update', () => {
			this.room?.update();
		});

		this.on('destroy', () => {
			this.room?.destroy();
			this.environment?.destroy();
		});

		this.resources.load(sources);
	}
}
