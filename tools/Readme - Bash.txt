Bash implementation of the Warframe log interpreter at https://semlar.com/deathlog. 
The command line output will match what's seen on the web app - that is, who got damaged, by how much, by whom, and when.
Usage:
	./deathlog.sh [file]
	
[file] is optional. If it is set, the logger will try to open the specified file.
If it is unset, the logger will first try looking for EE.log in %LOCALAPPDATA%\Warframe. If the LOCALAPPDATA environment variable is not set, or the file does not exist, it'll then look for it in the folder the script was launched from.
	
On Windows, the script requires a Bash environment such as Cygwin, MinGW or MSYS2, as well as the PATH environment variable pointing to the "bin" directory.

Cygwin: https://www.cygwin.com/
MinGW:  http://www.mingw.org/
MSYS2:  https://www.msys2.org/
