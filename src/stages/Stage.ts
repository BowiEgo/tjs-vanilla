import { Scene } from 'three';
import EventEmitter from '../core/EventEmitter';
import { Experience, createExperience } from '../core/Experience';
import Resources from '../core/Resources';

export default class Stage extends EventEmitter {
	experience: Experience | null;
	scene: Scene;
	resources: Resources;

	constructor() {
		super();
		this.experience = createExperience();
		this.scene = this.experience.scene;
		this.resources = this.experience.resources;

		// Wait for resources
		this.resources.on('ready', () => {
			this.trigger('setup');
		});
	}

	update() {
		this.trigger('update');
	}

	destroy() {
		this.resources.off('ready');
		this.trigger('destroy');
	}
}
