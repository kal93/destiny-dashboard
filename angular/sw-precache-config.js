module.exports = {
    maximumFileSizeToCacheInBytes: 3000000,
    staticFileGlobs: [
        'build/**.js',
        'build/**.css',
        'build/**.png',
        'build/**.ico',
        'build/**.json',
    ],
    root: 'build/',
    stripPrefix: 'build'
};