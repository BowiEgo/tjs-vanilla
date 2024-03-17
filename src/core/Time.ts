import EventEmitter from './EventEmitter';

export default class Time extends EventEmitter {
	start: number;
	current: number;
	elapsed: number;
	delta: number;
	constructor() {
		super();

		// Setup
		this.start = Date.now();
		this.current = this.start;
		this.elapsed = 0;
		this.delta = 16;

		this.tick();
	}

	tick() {
		const currentTime = Date.now();
		this.delta = (currentTime - this.current) / 1000;
		this.current = currentTime;
		this.elapsed = (this.current - this.start) / 1000;
		this.trigger('tick');

		window.requestAnimationFrame(() => {
			this.tick();
		});
	}
}
