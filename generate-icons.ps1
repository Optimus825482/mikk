Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("d:\RASYON\public\logo.jpg")

$bmp192 = New-Object System.Drawing.Bitmap 192, 192
$g192 = [System.Drawing.Graphics]::FromImage($bmp192)
$g192.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g192.DrawImage($img, 0, 0, 192, 192)
$bmp192.Save("d:\RASYON\public\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g192.Dispose()
$bmp192.Dispose()

$bmp512 = New-Object System.Drawing.Bitmap 512, 512
$g512 = [System.Drawing.Graphics]::FromImage($bmp512)
$g512.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g512.DrawImage($img, 0, 0, 512, 512)
$bmp512.Save("d:\RASYON\public\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Save("d:\RASYON\public\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g512.Dispose()
$bmp512.Dispose()

$img.Dispose()
Write-Host "PWA PNG Icons Generated Successfully!"
