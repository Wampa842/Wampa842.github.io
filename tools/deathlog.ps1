# WARFRAME death log
# Original JavaScript and regex patterns by semlar, PowerShell implementation by Wampa842

param
(
    [parameter(position=0)][string] $File = ""
)
if($File.Length -le 0)
{
    $File = "$($env:LOCALAPPDATA)\Warframe\EE.log"
    if( ! $(test-path -path $File))
    {
        $File = ".\EE.log"
    }
}
echo "Opening file at ""$File"""

$StartTimeRegex="^([0-9\.]+).*Sys \[Diag\]: Current time.*\[UTC: (.*)\]$"
$DamageRegex="^([0-9\.]+) Game \[Info\]: ([^\r\n]+.*) was killed by ([^\r\n]+.*) damage ?([^\r\n].*$)"

try
{
    $StartTime = (get-itemproperty -path $File -erroraction stop).creationtime
    $StartTimeFound = $false

    echo ""
    echo "--- BEGIN LOG ---"
    $count = 0
    foreach ($line in get-content $File)
    {
        if((!$StartTimeFound) -and ($line -match $StartTimeRegex))
        {
            $StartTime = [DateTime]::ParseExact($Matches[2], "ddd MMM d H:mm:ss yyyy", [Globalization.CultureInfo]::InvariantCulture).AddSeconds([float]$Matches[1])
            #echo $(New-TimeSpan -start $(Get-Date -date "01/01/1970") -end $($StartTime)).totalseconds
            $StartTimeFound = $true
        }

        if($line -match $DamageRegex)
        {
            $Damage = $Matches[3].Split("/")
            if($Damage[1] -eq $null)
            {
                $Damage = ("???", $Damage[0])
            }
            echo "$($StartTime.AddSeconds($Matches[1]).ToString("H:mm:ss")) $($Matches[2]) took $($Damage[1].Trim()) damage at $($Damage[0].Trim()) health $($Matches[4])"
        }
    }
}
catch
{
    $ex = $_.Exception
    Write-Host -ForegroundColor red $ex.Message
    exit
}
echo "---  END LOG  ---"
echo ""
echo "Press a key to exit..."
[void][System.Console]::ReadKey($true)