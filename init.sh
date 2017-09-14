#!/bin/bash
echo "Slack Notification Configure"

sudo apt-get update
sudo apt-get install -y npm
sudo npm install -g n
sudo n 8.4.0
sudo ln -sf /usr/local/n/versions/node/8.4.0/bin/node /usr/bin/node
echo 'npm update'
npm update > init.log
npm install selenium-webdriver > init.log


MACHINE_TYPE=$(uname -m)
if [ ${MACHINE_TYPE} == 'x_86_64' ]; then
    echo 'MACHINE_TYPE is x_86_64'
    echo 'Download chromedriver'
    wget https://chromedriver.storage.googleapis.com/2.31/chromedriver_linux64.zip
    unzip chromedriver_linux64.zip
    rm chromedriver_linux64.zip
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    sudo sh -c 'echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
    sudo apt-get update
    sudo apt-get install -y google-chrome-stable
    sudo apt-get install -y default-jdk
else
    if [ ${MACHINE_TYPE} == 'armv7l' ]; then
        echo 'MACHINE_TYPE is armv7l'
        echo 'chrome webdriver download'
        wget https://github.com/electron/electron/releases/download/v1.6.0/chromedriver-v2.21-linux-armv7l.zip
        unzip chromedriver-v2.21-linux-arm7l.zip
        rm chromedriver-v2.21-linux-arm7l.zip
    else
        echo 'Error'
    fi
fi
