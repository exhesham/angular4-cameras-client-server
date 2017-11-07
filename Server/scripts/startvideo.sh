#!/bin/bash

export LD_LIBRARY_PATH=/opt/mjpg_streamer/mjpg-streamer/mjpg-streamer/:$LD_LIBRARY_PATH
export PATH=/opt/mjpg_streamer/mjpg-streamer/mjpg-streamer/:$PATH

PARENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RECORD_DIR="$PARENT_DIR/records"
VIDEO_ID=$1

if [ ! -d $RECORD_DIR ]; then
	mkdir -p "$RECORD_DIR"
fi

if [ -z $1 ]; then
		echo "Will default recording device to 0"
        VIDEO_ID=0
fi

VIDEO_DIR=/dev/video$VIDEO_ID
echo "will record on video VIDEO_DIR=$VIDEO_DIR"
nohup mjpg_streamer -i "input_uvc.so  -d $VIDEO_DIR -y YUYV -n -f 15 -r 640x480" -o "output_http.so -w /opt/mjpg_streamer/mjpg-streamer/mjpg-streamer/www -p 777$VIDEO_ID" &
until pids=$(pidof /opt/mjpg_streamer/mjpg-streamer/mjpg-streamer/mjpg_streamer)

do
    sleep 1
done
pidof /opt/mjpg_streamer/mjpg-streamer/mjpg-streamer/mjpg_streamer
SHOULD_STOP=
while [ -z SHOULD_STOP ]; do
        mp4outputfile="$RECORD_DIR/mp4outputfile.$VIDEO_ID.`date +%s`.mp4"
        mjpegbufferfile="$RECORD_DIR/uncompressedmjpec.$VIDEO_ID.`date +%s`.mjpeg"
        netstat -tlpn
        echo "mjpeg goes to file $mjpegbufferfile"
        echo "mp4 goes to file $mp4outputfile"
        nohup wget  -O "$mjpegbufferfile"  http://127.0.0.1:777$VIDEO_ID/?action=stream &
        while ! [ -e "$mjpegbufferfile" ];
        do
            echo "#"
            sleep 1
        done

        WGET_PID=$!
        echo WGET_PID=$WGET_PID
        #sleep 3s
		echo "Recording the video"
        avconv -i "$mjpegbufferfile" -t 600 "$mp4outputfile"
		
        MP4_PID=$!
        sleep 600s
		echo "======================================================================================="
		echo "Delete old record"
		echo "======================================================================================="
		rm -f  $mjpegbufferfile
        echo "The MP4 Finished"
        kill -9 $WGET_PID
        kill $MP4_PID
        rm -f $mp4outputfile
		
done
