#!/bin/bash

COMBINED_FILE=$1
MINIFIED_FILE=`echo $COMBINED_FILE | sed -e 's/.js/-min.js/g'`

if [ -f $COMBINED_FILE ]
then
	mv $COMBINED_FILE $COMBINED_FILE.old
fi
if [ -f $MINIFIED_FILE ]
then
	mv $MINIFIED_FILE $MINIFIED_FILE.old
fi

# setup file
touch $COMBINED_FILE.tmp

# add all files
find . -name "*.js"
find . -name "*.js" | xargs cat $1 >> $COMBINED_FILE.tmp

mv $COMBINED_FILE.tmp $COMBINED_FILE
echo "Combined files into $COMBINED_FILE"

yui-compressor -o $MINIFIED_FILE $COMBINED_FILE
echo "Minified file into $MINIFIED_FILE"