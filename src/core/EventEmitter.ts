/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */

export default class EventEmitter {
	callbacks: {
		[key: string]: {
			[key: string]: ((...args: any[]) => void)[];
		};
	};
	/**
	 * Constructor
	 */
	constructor() {
		this.callbacks = {
			base: {},
		};
	}

	/**
	 * On
	 */
	on(_names: string | undefined, callback: (...args: any[]) => void | undefined) {
		const self = this;

		// Errors
		if (typeof _names === 'undefined' || _names === '') {
			console.warn('wrong names');
			return false;
		}

		if (typeof callback === 'undefined') {
			console.warn('wrong callback');
			return false;
		}

		// Resolve names
		const names = this.resolveNames(_names);

		// Each name
		names.forEach(function (_name: string) {
			// Resolve name
			const name = self.resolveName(_name);

			// Create namespace if not exist
			if (!(self.callbacks[name.namespace] instanceof Object))
				self.callbacks[name.namespace] = {};

			// Create callback if not exist
			if (!(self.callbacks[name.namespace][name.value] instanceof Array))
				self.callbacks[name.namespace][name.value] = [];

			// Add callback
			self.callbacks[name.namespace][name.value].push(callback);
		});

		return this;
	}

	/**
	 * Off
	 */
	off(_names: string | undefined) {
		const self = this;

		// Errors
		if (typeof _names === 'undefined' || _names === '') {
			console.warn('wrong name');
			return false;
		}

		// Resolve names
		const names = this.resolveNames(_names);

		// Each name
		names.forEach(function (_name) {
			// Resolve name
			const name = self.resolveName(_name);

			// Remove namespace
			if (name.namespace !== 'base' && name.value === '') {
				delete self.callbacks[name.namespace];
			}

			// Remove specific callback in namespace
			else {
				// Default
				if (name.namespace === 'base') {
					// Try to remove from each namespace
					for (const namespace in self.callbacks) {
						if (
							self.callbacks[namespace] instanceof Object &&
							self.callbacks[namespace][name.value] instanceof Array
						) {
							delete self.callbacks[namespace][name.value];

							// Remove namespace if empty
							if (Object.keys(self.callbacks[namespace]).length === 0)
								delete self.callbacks[namespace];
						}
					}
				}

				// Specified namespace
				else if (
					self.callbacks[name.namespace] instanceof Object &&
					self.callbacks[name.namespace][name.value] instanceof Array
				) {
					delete self.callbacks[name.namespace][name.value];

					// Remove namespace if empty
					if (Object.keys(self.callbacks[name.namespace]).length === 0)
						delete self.callbacks[name.namespace];
				}
			}
		});

		return this;
	}

	/**
	 * Trigger
	 */
	trigger(_name?: string, _args?: any) {
		// Errors
		if (typeof _name === 'undefined' || _name === '') {
			console.warn('wrong name');
			return false;
		}

		const self = this;
		let finalResult: any = null;
		let result = null;

		// Default args
		const args = !(_args instanceof Array) ? [] : _args;

		// Resolve names (should on have one event)
		let name: any = this.resolveNames(_name);

		// Resolve name
		name = this.resolveName(name[0]);

		// Default namespace
		if (name.namespace === 'base') {
			// Try to find callback in each namespace
			for (const namespace in self.callbacks) {
				if (
					self.callbacks[namespace] instanceof Object &&
					self.callbacks[namespace][name.value] instanceof Array
				) {
					self.callbacks[namespace][name.value].forEach(function (callback) {
						result = callback.apply(self, args);

						if (typeof finalResult === 'undefined') {
							finalResult = result;
						}
					});
				}
			}
		}

		// Specified namespace
		else if (this.callbacks[name.namespace] instanceof Object) {
			if (name.value === '') {
				console.warn('wrong name');
				return this;
			}

			self.callbacks[name.namespace][name.value].forEach(function (callback) {
				result = callback.apply(self, args);

				if (typeof finalResult === 'undefined') finalResult = result;
			});
		}

		return finalResult;
	}

	/**
	 * Resolve names
	 */
	resolveNames(_names: string) {
		let names: string | string[] = _names;
		names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '');
		names = names.replace(/[,/]+/g, ' ');
		names = names.split(' ');

		return names;
	}

	/**
	 * Resolve name
	 */
	resolveName(name: string) {
		const newName: { [key: string]: string } = {};
		const parts = name.split('.');

		newName.original = name;
		newName.value = parts[0];
		newName.namespace = 'base'; // Base namespace

		// Specified namespace
		if (parts.length > 1 && parts[1] !== '') {
			newName.namespace = parts[1];
		}

		return newName;
	}
}
