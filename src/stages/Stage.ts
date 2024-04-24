import { Scene } from 'three';
import EventEmitter from '../core/EventEmitter';
import { Engine, createEngine } from '../core/Engine';
import Resources from '../core/Resources';
import Object from '../core/Object';

export default class Stage extends EventEmitter {
	engine: Engine | null;
	scene: Scene;
	resources: Resources;
	objects: Object[];

	constructor() {
		super();
		this.engine = createEngine();
		this.scene = this.engine.scene;
		this.resources = this.engine.resources;
		this.objects = [];

		// Wait for resources
		this.resources.on('ready', () => {
			this.trigger('setup');
		});

		this.on('animate', () => {
			this.objects.forEach((object) => {
				object.animate();
			});
		});

		this.on('destroy', () => {
			this.objects.forEach((object) => {
				object.destroy();
			});
		});
	}

	addObject(object: Object) {
		this.objects.push(object);
	}

	animate() {
		this.trigger('animate');
	}

	destroy() {
		this.resources.off('ready');
		this.trigger('destroy');
	}
}
