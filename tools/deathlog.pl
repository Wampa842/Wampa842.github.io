#!/usr/bin/perl
# WARFRAME death log
# Original JavaScript and regex patterns by semlar, Perl implementation by Wampa842

use strict;
use warnings;
use Time::Piece;

sub trim
{
	my $out = shift;
	$out =~ s/^\s+|\s+$//g;
	return $out;
}

my $url = $ARGV[0];
if (!defined($url) || !(-e $url))
{
	$url = $ENV{'LOCALAPPDATA'} . "/Warframe/EE.log";
}
if(!(-e $url))
{
	print "File not found\n";
}

print "Opening file at $url\n";
open(my $file, '<', $url) or die "can't open $url\n";

my $startTimeRegex = '^([0-9\.]+).*Sys \[Diag\]: Current time.*\[UTC: (.*)\]$';
my $damageRegex = '^([0-9\.]+) Game \[Info\]: ([^\r\n]+.*) was killed by ([^\r\n]+.*) damage ?([^\r\n].*$)';

my $startTime;
my $startTimeFound = 0;

print "\n--- BEGIN LOG ---\n";

while(<$file>)
{
	if(!$startTimeFound && $_ =~ $startTimeRegex)
	{
		$startTime = Time::Piece->strptime($2, '%a %b %d %H:%M:%S %Y') + $1;
		$startTimeFound = 1;
	}
	if($_ =~ $damageRegex)
	{
		my $time = ($startTime + $1)->strftime('%H:%M:%S');
		my @damage = split(/\//, $3);
		if(scalar @damage <= 1)
		{
			@damage = ('???', $damage[0]);
		}
		print "$time $2 took @{[trim($damage[1])]} damage at @{[trim($damage[0])]} health $4\n";
	}
}

print "---  END LOG  ---\n\n";
system("pause");