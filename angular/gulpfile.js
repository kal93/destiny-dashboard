let clean = require('gulp-clean');
let fs = require("fs");
let gulp = require('gulp');
let replace = require('gulp-replace');
let runSequence = require('run-sequence');
let shell = require('gulp-shell');
let run = require('gulp-run');

let BUILD_APP = true;
let BUILD_CORDOVA = true;

// This is main task for production use
gulp.task('build', function (done) {
    if (BUILD_APP) {
        runSequence('version-app', 'clean-app', 'build-app', 'service-worker', 'publish-app', function () {
            if (BUILD_CORDOVA)
                buildCordova(done);
            else
                done();
        });
    }
    else if (BUILD_CORDOVA)
        buildCordova(done);
});

// Increment version of app
gulp.task('version-app', shell.task([
    'npm version patch'
]));

// Clean all build directories
gulp.task('clean-app', function (done) {
    // Clean Java dir
    gulp.src('../java/src/main/webapp/*.js').pipe(clean({ force: true }));
    gulp.src('../java/src/main/webapp/*.png').pipe(clean({ force: true }));
    gulp.src('../java/src/main/webapp/*.css').pipe(clean({ force: true }));
    gulp.src('../java/src/main/webapp/*.zip').pipe(clean({ force: true }));
    gulp.src('../java/src/main/webapp/favicon.ico').pipe(clean({ force: true }));
    gulp.src('../java/src/main/webapp/manifest.json').pipe(clean({ force: true }));
    gulp.src('../java/src/main/webapp/index.html').pipe(clean({ force: true }));

    done();
});

// AoT Compile Angular
gulp.task('build-app', shell.task([
    // 'ng build --prod --aot --build-optimizer --no-sourcemap --base-href ./'
    'ng build --prod --aot --no-sourcemap --base-href ./'
]));

// Add in our server worker after we AoT compile
gulp.task('service-worker', shell.task([
    'npm run precache'
]));

// Push latest Angular build to Java
gulp.task('publish-app', function (done) {
    //Copy files to Java directory
    gulp.src('./build/*.js').pipe(gulp.dest('../java/src/main/webapp'));
    gulp.src('./build/*.png').pipe(gulp.dest('../java/src/main/webapp'));
    gulp.src('./build/*.css').pipe(gulp.dest('../java/src/main/webapp'));
    gulp.src('./build/*.zip').pipe(gulp.dest('../java/src/main/webapp'));
    gulp.src('./build/favicon.ico').pipe(gulp.dest('../java/src/main/webapp'));
    gulp.src('./build/manifest.json').pipe(gulp.dest('../java/src/main/webapp'));
    //Defer js
    gulp.src('./build/index.html').pipe(replace('src=', 'defer src=')).pipe(gulp.dest('../java/src/main/webapp'));

    done();
});



//
// Build Cordova
//

function buildCordova(done) {
    runSequence('version-cordova', 'clean-cordova', 'publish-cordova', 'build-cordova', function () {
        done();
    });
}

// Set version in cordova config.xml
gulp.task('version-cordova', function (done) {
    let packageJson = JSON.parse(fs.readFileSync('./package.json'));
    let cordovaConfig = fs.readFileSync('../cordova/config.xml', 'utf8');

    // Concat config version in to cordova config.xml string
    let cordovaConfigStart = cordovaConfig.substr(0, cordovaConfig.indexOf('version="') + 9);
    let cordovaConfigEnd = cordovaConfig.substr(cordovaConfig.indexOf('" xmlns="'));
    cordovaConfig = cordovaConfigStart + packageJson.version + cordovaConfigEnd;

    // Save cordova.xml stringcordovaConfig
    require('fs').writeFileSync('../cordova/config.xml', cordovaConfig);

    done();
});


// Clean all build directories
gulp.task('clean-cordova', function (done) {
    // Clean cordova dir
    gulp.src('../cordova/www/*').pipe(clean({ force: true }));
    setTimeout(() => {
        done();
    }, 500);
});

// Push latest Angular build to Cordova
gulp.task('publish-cordova', function (done) {
    //Copy files to Cordova directory
    gulp.src('./build/*.js').pipe(gulp.dest('../cordova/www'));
    gulp.src('./build/*.png').pipe(gulp.dest('../cordova/www'));
    gulp.src('./build/*.css').pipe(gulp.dest('../cordova/www'));
    gulp.src('./build/*.zip').pipe(gulp.dest('../cordova/www'));
    gulp.src('./build/favicon.ico').pipe(gulp.dest('../cordova/www'));
    gulp.src('./build/manifest.json').pipe(gulp.dest('../cordova/www'));

    //Add cordova js in to head
    gulp.src('./build/index.html').pipe(replace('</head>', '<script type="text/javascript" src="cordova.js"></script></head>')).pipe(gulp.dest('../cordova/www/'));

    done();
});


// Clean all build directoriess
gulp.task('build-cordova', function (done) {
    process.chdir('../cordova');

    return gulp.src('./')
        .pipe(run('cordova build android'));
});
