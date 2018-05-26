/*
	WARFRAME death log
	Original JavaScript and regex patterns by semlar, C implementation by Wampa842
*/

//#define DEBUG

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <time.h>

#define MAX_LENGTH 1000

/*
2579.924 Game [Info]: CARRIER PRIME was killed by 227 / 226 damage from a level 91 NOX using a GrnChemstrikeNoxRifle
line ends with CR+LF
*/

/* Trim whitespaces from the beginning and end of the string */
char * trim(char * str)
{
	/* Trim from the end - replace first whitespace after the last non-whitespace char with \0 */
	char * end = str + strlen(str) - 1;
	while(end > str && isspace((unsigned char)*end))
		--end;
	*(end+1) = '\0';

	/* Trim from the beginning - move pointer before the first non-whitespace character */
	char * start = str;
	while(isspace((unsigned char)*start))
		++start;
	return start;
}

int monthToInt(char * s)
{
	if(!strcmp(s, "Jan"))
		return 0;
	else if(!strcmp(s, "Feb"))
		return 1;
	else if(!strcmp(s, "Mar"))
		return 2;
	else if(!strcmp(s, "Apr"))
		return 3;
	else if(!strcmp(s, "May"))
		return 4;
	else if(!strcmp(s, "Jun"))
		return 5;
	else if(!strcmp(s, "Jul"))
		return 6;
	else if(!strcmp(s, "Aug"))
		return 7;
	else if(!strcmp(s, "Sep"))
		return 8;
	else if(!strcmp(s, "Oct"))
		return 9;
	else if(!strcmp(s, "Nov"))
		return 10;
	else if(!strcmp(s, "Dec"))
		return 11;
}

/* Return seconds since epoch until EE.log's "current time" entry */
time_t getStartTime(char * line)
{
	/*
0.153 Sys [Diag]: Current time: Sat May 12 20:36:33 2018 [UTC: Sat May 12 18:36:33 2018]
	*/

	/* Extract UTC time from string */
	char * s = strstr(line, "[UTC: ") + 10;

	//May 12 18:36:33 2018]
	/* Tokenize and parse the string */
	struct tm t = {.tm_mon = monthToInt(strtok(s, " "))};
	t.tm_mday = atoi(strtok(NULL, " "));
	t.tm_hour = atoi(strtok(NULL, ":"));
	t.tm_min  = atoi(strtok(NULL, ":"));
	t.tm_sec  = atoi(strtok(NULL, " "));
	t.tm_year = atoi(strtok(NULL, "]")) - 1900;
	return mktime(&t);
}

FILE * file;
char * url;
time_t starttime = 0;

int main(int argc, char ** argv)
{
	/* If the program receives a command line argument, use that as a path. */
	if(argc > 1)
	{
		url = argv[1];
		if((file = fopen(url, "r")) == NULL)
		{
			fprintf(stderr, "(1) Could not open file at %s\n", url);
		}
	}
	/* Else, first look for %LOCALAPPDATA%/Warframe/EE.log, or if not found or the envvar is unset, ./EE.log */
	else
	{
		char * appdata;
		if((appdata = getenv("LOCALAPPDATA")) != NULL)
		{
			url = strcat(appdata, "/Warframe/EE.log");
		}
		else
		{
			url = "./EE.log";
		}

		if((file = fopen(url, "r")) == NULL)
		{
			fprintf(stderr, "(2) Could not open file at %s\n", url);
		}
	}

	printf("Opening file at %s\n", url);
	puts("Depending on your system and time zone, daylight saving time might not be reflected correctly in the time stamps.\n");
	puts("--- BEGIN LOG ---");

	char line[MAX_LENGTH];
	int counter = 0;

	while(fgets(line, MAX_LENGTH, file) != NULL)
	{
		//printf("line %d\n", ++counter);
		/* Skip empty lines */
		if(!strlen(line))
			continue;

		/* Find and process starttime string */
		if(!starttime && strstr(line, "Sys [Diag]: Current time") != NULL)
		{
			starttime = getStartTime(line);
		}

		/* Extract strings */
		char * actor_begin = strstr(line, " Game [Info]: ") + 14;
		char * actor_end = strstr(line, " was killed by ");			/* If this string can't be found in the line, it's not what I'm looking for. */
		if(actor_end == NULL)
			continue;
		char * damage_begin = actor_end + 15;
		char * damage_end = strstr(damage_begin, "damage ");
		char * source_begin = damage_end + 7;
		size_t actor_length = actor_end - actor_begin;
		size_t damage_length = damage_end - damage_begin;

		/* Split damage string and handle missing values */
		char * health = strtok(damage_begin, "/d");
		char * damage = strtok(NULL, "d");
		if(damage[0] == 'a')
		{
			char * temp = damage;
			damage = health;
			health = temp;
			strcpy(health, "???");
		}

		/* Process timestamp */
		struct tm time = *localtime(&starttime);
		time.tm_sec += atoi(strtok(line, "."));
		mktime(&time);

		#ifdef DEBUG
		printf("Time %02d:%02d:%02d - %d\n", time.tm_hour, time.tm_min, time.tm_sec, time.tm_isdst);
		printf("Actor %.*s\n", actor_length, actor_begin);
		printf("Damage %s\n", trim(damage));
		printf("Health %s\n", trim(health));
		printf("Source %s\n--\n", trim(source_begin));
		#else
		printf("%d:%02d:%02d %.*s took %s damage at %s health %s\n", time.tm_hour, time.tm_min, time.tm_sec, actor_length, actor_begin, trim(damage), trim(health), trim(source_begin));
		#endif
	}

	puts("---  END LOG  ---");
	fclose(file);
	return 0;
}