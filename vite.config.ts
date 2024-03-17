export default {
	base: './',
	server: {
		host: true,
	},
	build: {
		rollupOptions: {
			output: {
				assetFileNames: '[hash].[name].[ext]',
			},
		},
	},
};
