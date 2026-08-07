$log = "D:\Coding\Softwares\Autocad_2025_English\Softwares\unitrack\unitrack\server.log"
$work = "D:\Coding\Softwares\Autocad_2025_English\Softwares\unitrack\unitrack"
Start-Process -WindowStyle Hidden -FilePath "cmd.exe" -ArgumentList "/c cd /d $work && npm run dev" -RedirectStandardOutput $log -RedirectStandardError $log
Start-Sleep -Seconds 5
Get-Content $log -Tail 5
