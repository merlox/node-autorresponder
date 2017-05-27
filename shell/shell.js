const exec = require('child_process');
const path = require('path');
const fs = require('fs');

const installData = `echo Configuring your autorresponder...
sudo chmod +x autorresponder
sudo cp autorresponder /usr/local/bin

cat << MERU >> ~/.bashrc
export PATH=/usr/local/bin/autorresponder:$PATH
MERU

source ~/.bashrc

sudo bash -c 'cat << MERU >> /etc/systemd/system/autorresponder.service
[Unit]
Description=A powerful and simple autorresponders server

[Service]
ExecStart=/usr/local/bin/autorresponder
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=autorresponder
User=root
Group=root

[Install]
WantedBy=multi-user.target
MERU'

sudo systemctl enable autorresponder.service
sudo systemctl start autorresponder.service
echo Done, your autorresponder is now running`;

const uninstallData = `echo Are you sure you want to uninstall the autorresponder? [y/N]
read RESPONSE

if [ $RESPONSE = 'y' ] || [ $RESPONSE = 'Y' ]; then
else
   exit
fi

echo Uninstalling your autorresponder...

# Delete instalation files
sudo rm /usr/local/bin/autorresponder ~/.bashrc

# Remake the .bashrc file
sudo cp /etc/skel/.bashrc ~/
source ~/.bashrc

sudo systemctl disable autorresponder.service

sudo rm /etc/systemd/system/autorresponder.service
sudo rm $(ls -l /etc/systemd/system/multi-user.target.wants/ | cut -d ' ' -f 11 | grep autorresponder.service)

echo Done, your autorresponder is now gone.`;

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
               fs.writeFile('install.sh', installData, err => {
                  if(err) console.log('Error writing the install file.');

                  exec.exec('sudo chmod +x install.sh', (err, stdout, stderr) => {
                     if(err || stderr)
                        console.log('Error giving execution permission for the install file');
                     exec.execFile('./install.sh', (err, stdout, stderr) => {
                        if(err || stderr){
                           console.log('');
                           console.log('There was an error installing the app, try again with sudo');
                           console.log('');
                           console.log(stderr);
                        }

                        cb(null);
                     });
                  });
               });
            break;

            case 'uninstall':
               fs.writeFile('uninstall.sh', uninstallData, err => {
                  if(err) console.log('Error writing the uninstall file.');

                  exec.exec('sudo chmod +x uninstall.sh', (err, stdout, stderr) => {
                     if(err || stderr)
                        console.log('Error giving execution permission for the uninstall file');
                     exec.execFile('./uninstall.sh', (err, stdout, stderr) => {
                        if(err || stderr){
                           console.log('');
                           console.log('There was an error uninstalling the app, try again with sudo');
                           console.log('');
                           console.log(stderr);
                        }

                        cb(null);
                     });
                  });
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
