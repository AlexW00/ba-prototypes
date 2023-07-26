// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
	// config options
	build: {
		outDir: "dist/",
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			input: {
				home: "./index.html",
			},
		},
	},
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
	},
});
