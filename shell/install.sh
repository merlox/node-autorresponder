echo Configuring your autorresponder...
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
echo Done, your autorresponder is now running 
