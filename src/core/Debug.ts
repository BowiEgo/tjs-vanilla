import GUI from 'lil-gui';

export default class Debug {
	active: boolean;
	ui: GUI | null = null;

	constructor() {
		this.active = window.location.hash === '#debug';

		if (this.active) {
			this.ui = new GUI();
		}
	}
}
