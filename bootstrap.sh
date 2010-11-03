#!/bin/bash

if [ -d server/socket.io ]; then
	pushd server/socket.io
	git pull origin master
	popd
else
	git clone git://github.com/LearnBoost/Socket.IO-node.git server/socket.io
fi
