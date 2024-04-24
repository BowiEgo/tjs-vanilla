import EventEmitter from './EventEmitter';
import { Engine, createEngine } from './Engine';
import Sizes from './Sizes';

export default class Cursor extends EventEmitter {
	engine: Engine;
	sizes: Sizes;
	x: number = 0;
	y: number = 0;
	mouse = {
		x: 0,
		y: 0,
	};

	constructor() {
		super();

		this.engine = createEngine();
		this.sizes = this.engine.sizes;

		window.addEventListener('mousemove', (event) => {
			this.x = event.clientX / this.sizes.width - 0.5;
			this.y = -(event.clientY / this.sizes.height - 0.5);
			this.mouse.x = (event.clientX / this.sizes.width) * 2 - 1;
			this.mouse.y = -(event.clientY / this.sizes.height) * 2 + 1;
		});

		window.addEventListener('click', this.handleClick.bind(this));
	}

	handleClick() {
		this.trigger('click');
	}

	destroy() {
		window.addEventListener('mousemove', (event) => {
			this.x = event.clientX / this.sizes.width - 0.5;
			this.y = -(event.clientY / this.sizes.height - 0.5);
		});

		window.removeEventListener('click', this.handleClick.bind(this));
	}
}
