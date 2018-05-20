Perl implementation of the Warframe log interpreter at https://semlar.com/deathlog. 
The command line output will match what's seen on the web app - that is, who got damaged, by how much, by whom, and when.

Usage:
	deathlog.sh [file]
OR
	perl deathlog.sh [file]

[file] is optional. If it is set, the logger will try to open the specified file. If it is unset, the logger will first try looking for EE.log in %LOCALAPPDATA%\Warframe, then in the folder the script was launched from.

If you do not have Perl installed, you can download it from https://www.perl.org/.
