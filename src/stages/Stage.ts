import { Scene } from 'three';
import EventEmitter from '../core/EventEmitter';
import { Engine, createEngine } from '../core/Engine';
import Resources from '../core/Resources';
import BaseObject from '../core/Object/BaseObject';

export default class Stage extends EventEmitter {
	engine: Engine | null;
	scene: Scene;
	resources: Resources;
	objects: BaseObject[];

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

		this.on('update', () => {
			this.objects.forEach((object) => {
				object.update();
			});
		});

		this.on('destroy', () => {
			this.objects.forEach((object) => {
				object.destroy();
			});
		});
	}

	addObject(object: BaseObject) {
		this.objects.push(object);
		if (object.mesh) {
			this.scene.add(object.mesh);
		}
	}

	update() {
		this.trigger('update');
	}

	destroy() {
		this.resources.off('ready');
		this.trigger('destroy');
	}
}
