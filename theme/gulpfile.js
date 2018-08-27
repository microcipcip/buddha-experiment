'use strict';


//===============================================================/
//  =initialization
//===============================================================/

// include plugins
var gulp = require('gulp'),
    argv          = require('yargs').argv,
    cmq           = require('gulp-merge-media-queries'),
    concat        = require('gulp-concat'),
    changed       = require('gulp-changed'),
    del           = require('del'),
    gulpif        = require('gulp-if'),
    gutil         = require('gulp-util'), // this is used by 'del'
    header        = require('gulp-header'),
    jeditor       = require('gulp-json-editor'),
    jshint        = require('gulp-jshint'),
    minifyCSS     = require('gulp-minify-css'),
    prefix        = require('gulp-autoprefixer'),
    plumber       = require('gulp-plumber'),
    rename        = require('gulp-rename'),
    replace       = require('gulp-replace'),
    sass          = require('gulp-sass'),
    stylish       = require('jshint-stylish-ex'),
    uglify        = require('gulp-uglify');

// set date, useful for checking latest change made
var currentdate = new Date();
var datetime = ("0" + currentdate.getDate()).slice(-2) + "/" +
    ("0" + (currentdate.getMonth() + 1)).slice(-2) + "/" +
    currentdate.getFullYear() + " @ " +
    currentdate.getHours() + ":" +
    currentdate.getMinutes();

// set project details here
var project = {
        shortname:  "buddha-experiment", // do not add spaces or special chars (used on json)
        name:       "buddha-experiment",
        descr:      "The responsive theme for buddha-experiment",
        url:        "https://microcipcip.digital",
        author:     "https://microcipcip.digital"
    },
    projectInfo =   '/*!' + ' \n' +
        '   *Name:          <%= pkg.name %>' + ' \n' +
        '   *Description:   <%= pkg.descr %>' + ' \n' +
        '   *Website:       <%= pkg.url %>' + ' \n' +
        '   *Last update:   ' + datetime + ' \n' +
        '*/' + ' \n';

// set variables for local/deployment/live
var isDev         = argv.type === 'dev',
    isDeployment  = argv.type === 'depl',
    isLive        = argv.type === 'live';

// configure the path of each task
var basePath = {
        src       : 'src/',
        dist      : 'dist/',
        root      : ''
    },
    imgExt   = '.{jpeg,jpg,png,gif,svg,cur,ico}',
    fontExt  = '.{eot,ttf,otf,woff,woff2,svg}',
    audioExt = '.{wav,mp3}',
    path = {
        src : {
            scss       : basePath.src + 'scss/',
            scssFiles  : basePath.src + 'scss/**/*.scss',
            css        : basePath.src + 'css/',
            cssFiles   : basePath.src + 'css/**/*.css',
            font       : basePath.src + 'fonts/',
            fontFiles  : basePath.src + 'fonts/**/*' + fontExt,
            js         : basePath.src + 'js/',
            jsFiles    : basePath.src + 'js/**/*.js',
            img        : basePath.src + 'img/',
            imgFiles   : basePath.src + 'img/**/*' + imgExt,
            audio      : basePath.src + 'audio/',
            audioFiles : basePath.src + 'audio/**/*' + audioExt,
            php        : basePath.src + 'php/',
            phpFiles   : basePath.src + 'php/**/*.php'
        },
        dist : {
            css        : basePath.dist + 'css/',
            cssFiles   : basePath.dist + 'css/**/*.css',
            font       : basePath.dist + 'fonts/',
            fontFiles  : basePath.dist + 'fonts/**/*' + fontExt,
            js         : basePath.dist + 'js/',
            jsFiles    : basePath.dist + 'js/**/*.js',
            img        : basePath.dist + 'img/',
            imgFiles   : basePath.dist + 'img/**/*' + imgExt,
            audio      : basePath.dist + 'audio/',
            audioFiles : basePath.dist + 'audio/**/*' + audioExt,
            php        : basePath.dist + 'php/',
            phpFiles   : basePath.dist + 'php/**/*.php'
        },
        json : 'package.json',
        proxy : {
            localhost: 'http://silverstripe3-air.dev03/',
            staging  : '',
            deployed : '',
            startPath: ''
        }
    };



//===============================================================/
//  =tasks
//===============================================================/

// clean
gulp.task('clean', function(cb) {
    del([basePath.dist], cb);
});

// sass and css
gulp.task('css', function() {
    gulp.src(path.src.scssFiles)
        .pipe(plumber())
        // compile sass, combine media queries, autoprefix and minify
        .pipe(sass({ imagePath: '../img', sourceComments: null}))
        .pipe(cmq())
        .pipe(prefix('last 2 version', '> 1%', 'ie 8', 'ie 9'))
        .pipe(gulpif(!isDev, minifyCSS({keepBreaks: false})))
        .pipe(header(projectInfo, { pkg : project }))
        .pipe(gulp.dest(path.dist.css));
});

// scripts
gulp.task('js', function() {
    // detect errors in custom.js
    gulp.src(path.src.js + 'custom.js')
        .pipe(plumber())
        .pipe(gulpif(isDev, jshint()))
        .pipe(gulpif(isDev, jshint.reporter(stylish)))
    // concatenate and minify files
    gulp.src([
        path.src.js + 'plugins/*.js',
        path.src.js + 'custom.js'
    ])
        .pipe(plumber())
        .pipe(changed(path.dist.js))
        .pipe(concat('./scripts.js'))
        .pipe(gulpif(!isDev, uglify({ preserveComments: 'some' })))
        .pipe(header(projectInfo, { pkg : project }))
        .pipe(gulp.dest(path.dist.js));
    // move vendors and polyfill files in the dist folder
    gulp.src([
        path.src.js + 'vendor/*.js',
        path.src.js + 'polyfill/*.js'
    ])
        .pipe(plumber())
        .pipe(changed(path.dist.js))
        .pipe(gulp.dest(path.dist.js));
});

// fonts
gulp.task('font', function(){
    gulp.src(path.src.fontFiles)
        .pipe(plumber())
        .pipe(changed(path.dist.font))
        .pipe(gulp.dest(path.dist.font));
});

// imgs
gulp.task('img', function(){
    gulp.src(path.src.imgFiles)
        .pipe(plumber())
        .pipe(changed(path.dist.img))
        .pipe(gulp.dest(path.dist.img));
});

// audio
gulp.task('audio', function(){
    gulp.src(path.src.audioFiles)
        .pipe(plumber())
        .pipe(gulp.dest(path.dist.audio));
});

// php
gulp.task('php', function(){
    gulp.src(path.src.phpFiles)
        .pipe(plumber())
        .pipe(changed(path.dist.php))
        .pipe(gulp.dest(path.dist.php));
});

// json package editor
gulp.task('json', function(){
    gulp.src(path.json)
        .pipe(plumber())
        .pipe(jeditor({
            'version':      '1.0.0', // make sure this is a supported npm version
            'name':         project.shortname,
            'description':  project.descr,
            'author':       project.author
        }))
        .pipe(gulp.dest('./'));
});

// watch files
gulp.task('watch', function() {
    gulp.watch(path.src.scssFiles,  ['css']);
    gulp.watch(path.src.jsFiles,    ['js']);
    gulp.watch(path.src.fontFiles,  ['font']);
    gulp.watch(path.src.imgFiles,   ['img']);
    gulp.watch(path.src.audioFiles, ['audio']);
    gulp.watch(path.src.phpFiles,   ['php']);
});

// default task
gulp.task('default', ['css', 'js', 'font', 'img', 'audio', 'php', 'json', 'watch']);