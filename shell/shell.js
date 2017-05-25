const execFile = require('child_process').execFile;
const path = require('path');

module.exports = {
   checkArguments: function (cb){

      let argumentIndex = process.argv.findIndex(e => {
         return e.toLowerCase().includes('server');
      }) + 1;

      if(process.argv[argumentIndex]){
         switch (process.argv[argumentIndex]) {
            case 'configure':
               require('./../config/configure.js').checkConfigUser(true, err => {
                  if(err) return cb(err);
                  cb(null);
               });
            break;

            case 'install':
               execFile(path.join(__dirname, './install.sh'), (err, stdout, stderr) => {
                  if(err){
                     console.log('');
                     console.log('There was an error installing the app, try again with sudo');
                     console.log('');
                  }
                  if(stderr){
                     console.log('');
                     console.log('There was an error installing the app, try again with sudo');
                     console.log('');
                  }

                  cb(null);
               });
            break;

            case 'uninstall':
               execFile(path.join(__dirname, './uninstall.sh'), (err, stdout, stderr) => {
                  if(err) {
                     console.log('');
                     console.log('There was an error uninstalling the app, try again with sudo');
                     console.log('');
                  }
                  if(stderr){
                     console.log('');
                     console.log('There was an error uninstalling the app, try again with sudo');
                     console.log('');
                  }
                  
                  cb(null);
               });
            break;

            default:
               require('./../config/configure.js').checkConfigUser(false, err => {
                  if(err) return cb(err);
                  cb(null);
               });
            break;
         }
      }else{
         cb(null);
      }
   }
};
