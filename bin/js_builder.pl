#!/usr/bin/perl

use File::Basename;
use File::Copy;
use File::Slurp;

my $combined_file = 'all.js';
my $minified_file = $combined_file;
$minified_file =~ s/\.js/\-min.js/g;
my $log_file = "$combined_file.log";

if ( -f $combined_file )
{
	move($combined_file, "$combined_file.old");
}
if ( -f $minified_file )
{
	move($minified_file, "$minified_file.old");
}
if ( -f $log_file )
{
	move($log_file, "$log_file.old");
}

open my $log, '>', $log_file;

# main js dir
my $js_dir = 'js';
die "Can't find JS dir $js_dir" unless -d $js_dir;

# recurse through files and folders
my @to_visit = glob "$js_dir\/*";
my @in_dirs = ();
my $packages = '';
my $file_contents = '';
my %files_seen = ();
my %wait_for = ();
while ( my $f = pop(@to_visit) )
{

	# check if we've left a dir
	my $name = basename($f);
	while ( @in_dirs && ! -e "$in_dirs[$#in_dirs]->{path}/$name" )
	{
		my $dir = pop(@in_dirs);
		print $log "Leaving Directory: $dir->{path}\n";
	}

	# for each dir setup 'packages'
	if ( -d $f )
	{
		# add package for dir
		push(@in_dirs, { path => $f, name => $name });
		print $log "Entering Directory: $name\n";
		push(@to_visit, glob "$f\/*");
		
		# first package needs var, rest are within it
		if (@in_dirs==1 && $packages eq '') {
			$packages .= 'var '.join('.', map { $_->{name} } @in_dirs)." = {};\n";
		}
		else
		{
			$packages .= join('.', map { $_->{name} } @in_dirs)." = {};\n";
		}
	}
	elsif (-f $f)
	{
		print $log "Processing File: $f\n";
		my $combine = 1;
			
		# check for dependencies
		my $dependencies = `grep -P "DEPENDENCY:\s*(.*?)\s*" $f`;
		if ($dependencies) {
			chomp($dependencies);
			my @dependencies = map { $_ =~ /DEPENDENCY:\s*([^\s]*)\s*/; $1; } split(/\n/, $dependencies);
			my @missing = grep {!$files_seen{$_} } @dependencies;
			
			# found some, postpone dealing with this file
			if (@missing) {
				print $log "Dependent on: ".join(',', @missing)."\n";
				map { push(@{$wait_for{$_}}, $f)} @missing;
				$combine = 0;
			}
		}
		
		if ($combine) {
			
			# combine file
			$file_contents .= "\n\/* File: $f *\/\n\n";
			$file_contents .= read_file($f) or die $1;
			$file_contents .= "\n\n\/* End of File: $f *\/\n";
			
			$files_seen{$name} = 1;
			
			if ($wait_for{$name}) {
				push(@to_visit, @{$wait_for{$name}});
				delete $wait_for{$name};
			}
		}
	}
}

while ( my $dir = pop(@in_dirs) )
{
	print $log "Leaving Directory: $dir->{path}\n";
}


# write combined file
open my $fh, '>', $combined_file or die $!;

my $time = localtime();
print $fh <<JS_FILE_END;
/* Combined on: $time */
"use strict";

/* Packages */
$packages
$file_contents
JS_FILE_END

close $fh or die $!;
close $log or die $!;

print "Combined files into $combined_file\n";

#`yui-compressor -o $minified_file $combined_file`;
#print "Minified file into $minified_file\n";
