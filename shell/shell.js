'use strict';

const exec = require('child_process');
const path = require('path');
const fs = require('fs');

const installData = `#!/bin/bash
echo Configuring your autorresponder...
sudo chmod +x autorresponder
sudo cp autorresponder /usr/local/bin
sudo chmod +x /usr/local/bin *

cat << MERU >> ~/.bashrc
export PATH=/usr/local/bin/autorresponder:$PATH
MERU

source ~/.bashrc

echo Stopping service in case it was enabled...
sudo systemctl stop autorresponder.service
echo Disabling service in case it was enabled...
sudo systemctl disable autorresponder.service
echo Removing files from past installations...
sudo rm /lib/systemd/system/autorresponder.service

sudo bash -c 'cat << MERU >> /lib/systemd/system/autorresponder.service
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

echo Enabling service...
sudo systemctl enable autorresponder.service
echo Starting service...
sudo systemctl start autorresponder.service
echo Done, your autorresponder is now running`;

const uninstallData = `#!/bin/bash
echo Are you sure you want to uninstall the autorresponder? [y/N]
read RESPONSE

if [ $RESPONSE = 'y' ] || [ $RESPONSE = 'Y' ]; then
   echo Response y
else
   echo Response not Y
   exit
fi

echo Uninstalling your autorresponder...

# Delete instalation files
sudo rm /usr/local/bin/autorresponder ~/.bashrc

# Remake the .bashrc file
sudo cp /etc/skel/.bashrc ~/
source ~/.bashrc

echo Stopping service...
sudo systemctl stop autorresponder.service
echo Disabling service...
sudo systemctl disable autorresponder.service

echo Removing /etc/systemd/system/autorresponder.service...
sudo rm /etc/systemd/system/autorresponder.service
echo Removing /lib/systemd/system/autorresponder.service...
sudo rm /lib/systemd/system/autorresponder.service
echo Removing /etc/systemd/system/multi-user.target.wants/autorresponder.service...
sudo rm /etc/systemd/system/multi-user.target.wants/autorresponder.service

echo Done, your autorresponder is now gone.`;

module.exports = {
   checkArguments: function (cb){

   //    let argumentIndex = process.argv.findIndex(e => {
   //       return e.toLowerCase().includes('server');
   //    }) + 1;
   //
   //    if(process.argv[argumentIndex]){
   //       switch (process.argv[argumentIndex]) {
   //          case 'configure':
   //             require('./../config/configure.js').checkConfigUser(true, err => {
   //                if(err) return cb(err);
   //                cb(null);
   //             });
   //          break;
   //
   //          case 'install':
   //             fs.writeFile('install.sh', installData, err => {
   //                if(err) console.log('Error writing the install file.');
   //                else console.log('Ok creating the install.sh file');
   //
   //                exec.exec('sudo chmod +x install.sh', (err, stdout, stderr) => {
   //                   if(err || stderr)
   //                      console.log('Error giving execution permission for the install file');
   //                   else
   //                      console.log('Ok giving execution permission to the install.sh file');
   //
   //                   exec.exec('sudo ./install.sh', (err, stdout, stderr) => {
   //                      console.log('ERR:');
   //                      console.log(err);
   //                      console.log('STDERR:');
   //                      console.log(stderr);
   //                      console.log('STDOUT:');
   //                      console.log(stdout);
   //
   //                      cb(null);
   //                   });
   //                });
   //             });
   //          break;
   //
   //          case 'uninstall':
   //             fs.writeFile('uninstall.sh', uninstallData, err => {
   //                if(err) console.log('Error writing the uninstall file.');
   //
   //                exec.exec('sudo chmod +x uninstall.sh', (err, stdout, stderr) => {
   //                   if(err || stderr) console.log('Error giving execution permission for the install file');
   //                   else console.log('Ok giving execution permission to the install.sh file');
   //
   //                   exec.exec('sudo ./uninstall.sh', (err, stdout, stderr) => {
   //                      console.log('ERR:');
   //                      console.log(err);
   //                      console.log('STDERR:');
   //                      console.log(stderr);
   //                      console.log('STDOUT:');
   //                      console.log(stdout);
   //
   //                      cb(null);
   //                   });
   //                });
   //             });
   //          break;
   //
   //          default:
   //             require('./../config/configure.js').checkConfigUser(false, err => {
   //                if(err) return cb(err);
   //                cb(null);
   //             });
   //          break;
   //       }
   //    }else{
   //       cb(null);
   //    }
   }
};
