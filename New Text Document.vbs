' OpenPS1AsAdmin.vbs
Dim objShell, currentFolder, filePath

Set objShell = CreateObject("Shell.Application")
currentFolder = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
filePath = currentFolder & "\2.ps1"

' Run PowerShell as administrator
objShell.ShellExecute "powershell.exe", "-ExecutionPolicy Bypass -File """ & filePath & """", "", "runas", 0
