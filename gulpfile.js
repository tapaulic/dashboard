/*
 The gulpfile for WCM-embedded WRP web apps using the core library combined with bower and gulp.
 You shouldn't have to change this file much, but you could if you wanted.
 Note that this file uses es6 syntax.
 http://gulpjs.com/
 */

const gulp = require('gulp');
const core = require('./bower_components/core/gulp_helper');
const pkg = require('./package.json');

//You should pass options to the createTasks method below
let options = {
  //What is the name of this app? This is used to create build and distribution folders.
  //This is REQUIRED
  appName: pkg['name'],
  //The core configuration options (see gulp_helper for docs), should be a javascript object of key value pairs
  config: pkg['coreConfig'],
  //How this app should be embedded in the simulator. Options are: 'full', 'left', or 'right'
  //This is optional, and the default value is 'full'
  embedArea: 'full',

  //If you want to add vars to the preprocessor context, include this option
  //You can add environment-specific vars or general vars
  preprocessorContext: {
    local: {
      JSON_MEASURES: '/data/ssha/dashboard/dashboard.json',
      //JSON_MEASURES: 'http://137.15.134.133:8081/sshaDashBoard/data/ssha/dashboard/dashboard.json',
      JSON_NARRATIVES: '/data/ssha/dashboard/narratives.json',
      //JSON_NARRATIVES: 'http://137.15.134.133:8081/sshaDashBoard/data/ssha/dashboard/narratives.json',
      JSON_SSHA_LiveData: '/data/ssha/dashboard/live/live.json',
      //JSON_SSHA_LiveData: 'http://137.15.134.133:8081/sshaDashBoard/data/ssha/dashboard/live/live.json',
      //JSON_SSHA_HistoricalDemandTrafficLightData: 'http://137.15.134.133:8081/sshaDashBoard/data/ssha/dashboard/historical/trafficlight_historicaldemand.json',
      JSON_SSHA_HistoricalDemandTrafficLightData: '/data/ssha/dashboard/historical/trafficlight_historicaldemand.json',
      JSON_SSHA_NightlySummaryTrafficLightData: '/data/ssha/dashboard/historical/trafficlight_nightlysummary.json',
      //JSON_SSHA_NightlySummaryTrafficLightData: 'http://137.15.134.133:8081/sshaDashBoard/data/ssha/dashboard/historical/trafficlight_nightlysummary.json',
      HTML_MEASURES: '/resources/progressportal/html/progressportal.html'
    },
    dev: {
      JSON_MEASURES: '/app_content/dashboard_measures/',
      JSON_NARRATIVES: '/app_content/dashboard_narratives/',
      HTML_MEASURES: '/app_content/dashboard_html/'
    },
    qa: {
      JSON_MEASURES: '/app_content/dashboard_measures/',
      JSON_NARRATIVES: '/app_content/dashboard_narratives/',
      HTML_MEASURES: '/app_content/dashboard_html/'
    },
    prod: {
      JSON_MEASURES: '/app_content/dashboard_measures/',
      JSON_NARRATIVES: '/app_content/dashboard_narratives/',
      HTML_MEASURES: '/app_content/dashboard_html/'
    },
    SOME_OTHER_ENV: 'this var will be in the context of any environment'
  },

  //If you want to override the environment that the build process uses, specify it here
  //Valid values are: 'local', 'dev', 'qa', 'prod'
  //If you omit this (which you probably should), then the environment will be:
  //'local' when running or building on your machine
  //'dev' when calling gulp deploy:dev
  //'qa' when calling gulp deploy:qa
  //'prod' when calling gulp deploy:prod
 // environmentOverride: null
 environmentOverride: null
};

//This creates several gulp tasks to use during development:
//default, clean, build, build_with_simulator, run, deploy:dev, deploy:qa, deploy:prod
core.embeddedApp.createTasks(gulp, options);

//Note that you can override any task that createTasks added, by redefining it after the call to createTasks
//ex:
// gulp.task('deploy:dev', ['_deploy_prep'], () => {
//   ...do some custom deploy code...
// });

//FAKING DATA AND CONFIG FILES:
//Some apps will load data and configurations from 'data' files, usually JSON.
//The location of these files in Dev, QA, and Prod may vary:
//- Could be in the S3 data bucket
//- Could be in a custom Wordpress post
//To 'fake' this when running your app locally, do the following:
// 1. Put some sample data/config files into /src/data folder in the project
// 2. Overwrite the _data gulp task here to copy your data files into a file path that mimics the one on your web server:
 gulp.task('_data', () => {
   let myDataPath = '/data/ssha/dashboard'; //On S3, this will be something like /data/division/my_app
                             //On WP, this will be something different

   //return gulp.src(['src/data/**/*']).pipe(gulp.dest('dist' + myDataPath));
   gulp.src(['src/data/**/*']).pipe(gulp.dest('dist' + myDataPath));
   let myJsPath = '/resources/dashboard/scripts'; //On S3, this will be something like /data/division/my_app
   //On WP, this will be something different
    return gulp.src(['src/scripts/**/*']).pipe(gulp.dest('dist' + myJsPath));
 });


