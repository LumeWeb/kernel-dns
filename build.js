import esbuild from "esbuild"

esbuild.buildSync({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    format: 'esm',
      inject: ["./polyfill.js"],
    bundle: true,
    legalComments: 'external',
    //  minify: true
    define: {
        'global': 'self'
    },
    external: ["libkernel"]
})
