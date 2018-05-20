PowerShell implementation of the Warframe log interpreter at https://semlar.com/deathlog. 
The command line output will match what's seen on the web app - that is, who got damaged, by how much, by whom, and when.

Usage:
If you have Windows PowerShell:
	powershell deathlog.ps1 [file]
	
If you have PowerShell Core:
	pwsh deathlog.ps1 [file]

[file] is optional. If it is set, the logger will try to open the specified file. If it is unset, the logger will first try looking for EE.log in %LOCALAPPDATA%\Warframe, then in the folder the script was launched from.

Windows releases past Windows 7/Server 2008 R2 SP1 should have PowerShell installed by default. If not, follow the instructions below:
Windows PowerShell: https://docs.microsoft.com/en-us/powershell/scripting/setup/installing-windows-powershell
PowerShell Core: https://docs.microsoft.com/en-us/powershell/scripting/setup/installing-powershell-core-on-windows
