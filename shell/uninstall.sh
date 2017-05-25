echo Are you sure you want to uninstall the autorresponder? [y/N]
read RESPONSE

if [ ${RESPONSE,,} != 'y' ]; then
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
sudo rm `ls -l /etc/systemd/system/multi-user.target.wants/ | cut -d ' ' -f 11 | grep autorresponder.service`

echo Done, your autorresponder is now gone.
