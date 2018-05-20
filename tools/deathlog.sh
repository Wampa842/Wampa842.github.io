#!/bin/bash
# WARFRAME death log
# Original JavaScript and regex patterns by semlar, Bash implementation by Wampa842

if [[ ! -n "$1" ]]
then
	echo "No argument supplied - looking for EE.log in the default location"
	FILE="${LOCALAPPDATA}/Warframe/EE.log"
	if [[ ! -f "$FILE" ]]
	then
		echo "File not found - trying ./EE.log"
		FILE="./EE.log"
	fi
else
	FILE=$1
fi
if [[ ! -e $FILE ]]; then
	echo "ERROR: File not found:"
	echo "$FILE"
	read -p "Press a key to exit..."
	exit 1
fi

REGEX_STARTTIME=".*\[UTC: (.*)\]$"
REGEX_DAMAGE="^([0-9\.]+) Game \[Info\]: ([^\r\n]+.*) was killed by ([^\r\n]+.*) damage ?([^\r\n].*$)"

STARTTIME_S=`cat $FILE | grep "Sys \[Diag\]: Current time"`

[[ $STARTTIME_S =~ $REGEX_STARTTIME ]]
let STARTTIME=`date --date="${BASH_REMATCH[1]}" +%s`

echo "Opening file at $FILE"

echo ""
echo "--- BEGIN LOG ---"

while IFS='' read -r LINE
do
	if [[ $LINE =~ $REGEX_DAMAGE ]]
	then
		IFS='/ '
		#read -r -a DAMAGE <<< `echo ${BASH_REMATCH[2]} | sed "s/,//g"`
		read -r -a DAMAGE <<< ${BASH_REMATCH[3]}
		if [[ ! -n ${DAMAGE[0]} ]]
		then
			DAMAGE[0]=${DAMAGE[1]}
			DAMAGE[1]="???"
		fi
		let TIME=STARTTIME+`printf %.0f ${BASH_REMATCH[1]}`
		TIME=`date --date=@$TIME +%T`
		echo "$TIME ${BASH_REMATCH[2]} took ${DAMAGE[1]} damage at ${DAMAGE[0]} health ${BASH_REMATCH[4]}"
	fi
done < $FILE

echo "---  END LOG  ---"
echo ""
read -p "Press a key to exit..."