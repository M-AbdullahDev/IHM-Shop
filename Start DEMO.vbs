Option Explicit

Dim shell, files, folder, server
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")

folder = files.GetParentFolderName(WScript.ScriptFullName)
server = files.BuildPath(folder, "demo-server.ps1")

If Not files.FileExists(server) Then
    MsgBox "Demo Shop server file is missing. Keep Start DEMO.vbs and demo-server.ps1 in the same folder.", vbCritical, "Demo Shop"
    WScript.Quit 1
End If

' Starts the small local server without showing PowerShell to the user.
shell.Run "powershell.exe -NoProfile -WindowStyle Hidden -File " & Chr(34) & server & Chr(34), 0, False
WScript.Sleep 800
shell.Run "http://127.0.0.1:8765/", 1, False
