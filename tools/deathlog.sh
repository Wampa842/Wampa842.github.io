#!/bin/bash
# WARFRAME death log
# Original JavaScript and regex patterns by semlar, Bash implementation by Wampa842

if [[ -z "$1" ]]
then
	echo "No argument supplied - looking for EE.log in the default location"
	file="${LOCALAPPDATA}/Warframe/EE.log"
	if [[ ! -e "${file}" ]]
	then
		echo "File not found - trying ./EE.log"
		file="./EE.log"
	fi
else
	file="$1"
fi
if [[ ! -e $file ]]; then
	echo "ERROR: File not found: ${file}" >&2
	#read -p "Press a key to exit..."
	exit 1
fi

starttime_regex=".*\[UTC: (.*)\]$"
damage_regex="^([0-9\.]+) Game \[Info\]: ([^\r\n]+.*) was killed by ([^\r\n]+.*) damage ?([^\r\n].*$)"

starttime_s=`cat ${file} | grep -m 1 "Sys \[Diag\]: Current time"`

[[ $starttime_s =~ $starttime_regex ]]
let starttime=`date --date="${BASH_REMATCH[1]} UTC" +%s`

echo "Opening file at ${file}"

echo ""
echo "--- BEGIN LOG ---"

while IFS='' read -r line
do
	if [[ $line =~ $damage_regex ]]
	then
		IFS='/ '
		read -r -a damage <<< ${BASH_REMATCH[3]}
		if [[ ! -n ${damage[0]} ]]
		then
			damage[0]=${damage[1]}
			damage[1]="???"
		fi
		let time=starttime+`printf %.0f ${BASH_REMATCH[1]}`
		time=`date --date=@${time} +%T`
		echo "${time} ${BASH_REMATCH[2]} took ${damage[1]} damage at ${damage[0]} health ${BASH_REMATCH[4]}"
	fi
done < "${file}"

echo "---  END LOG  ---"
#echo ""
#read -p "Press a key to exit..."