Add-Type -AssemblyName System.Drawing

$iconPath = Join-Path $PSScriptRoot 'demo.ico'
$shortcutPath = Join-Path $PSScriptRoot 'START DEMO APP.lnk'

$bitmap = [System.Drawing.Bitmap]::new(256, 256)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::FromArgb(15, 23, 42))

$circle = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(79, 70, 229))
$graphics.FillEllipse($circle, 12, 12, 232, 232)

$font = [System.Drawing.Font]::new('Segoe UI', 154, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$textBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$format = [System.Drawing.StringFormat]::new()
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$graphics.DrawString('D', $font, $textBrush, [System.Drawing.RectangleF]::new(0, -8, 256, 256), $format)

$icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
$stream = [System.IO.File]::Create($iconPath)
$icon.Save($stream)
$stream.Close()

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $PSScriptRoot 'Start DEMO.vbs'
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.IconLocation = "$iconPath,0"
$shortcut.Description = 'Open Demo Shop Retail POS'
$shortcut.Save()

$icon.Dispose()
$format.Dispose()
$textBrush.Dispose()
$font.Dispose()
$circle.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
