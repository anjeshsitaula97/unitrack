const http = require('http');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PORT = 5899;
const SCAN_DIR = path.join(os.tmpdir(), 'scanner-agent-scans');

if (!fs.existsSync(SCAN_DIR)) {
  fs.mkdirSync(SCAN_DIR, { recursive: true });
}

const LIST_SCANNERS_PS = `
function Get-WiaScanners {
  $result = @()
  try {
    $dm = New-Object -ComObject WIA.DeviceManager
    foreach ($di in $dm.DeviceInfos) {
      $name = ""
      $deviceId = $di.DeviceID
      for ($i = 1; $i -le $di.Properties.Count; $i++) {
        $p = $di.Properties($i)
        if ($p.Name -eq "Name") { $name = $p.Value; break }
      }
      if ($name) {
        $result += @{ id = $deviceId; name = $name; source = "WIA" }
      }
    }
  } catch { Write-Warning "WIA enumeration failed: $_" }
  return $result
}

function Get-PnPScanners {
  $result = @()
  try {
    $all = Get-CimInstance -ClassName Win32_PnPEntity -ErrorAction Stop
    # Check PnP devices that could be scanners: imaging class, or name containing "scan"
    $candidates = $all | Where-Object {
      $_.PNPClass -eq "Image" -or
      $_.PNPClass -eq "WSDScan" -or
      $_.PNPClass -eq "Camera" -or
      ($_.Name -match "(?i)\bscan")
    }
    foreach ($d in $candidates) {
      $result += @{ id = $d.DeviceID; name = $d.Name; source = "PnP" }
    }
    # Also check WPD devices for mobile scanners
    $wpd = $all | Where-Object { $_.PNPClass -eq "WPD" -and $_.Name -match "(?i)(scan|phone|camera)" }
    foreach ($d in $wpd) {
      $result += @{ id = $d.DeviceID; name = $d.Name; source = "WPD" }
    }
  } catch { Write-Warning "PnP enumeration failed: $_" }
  return $result
}

function Get-PrintQueues {
  $result = @()
  try {
    $printers = Get-CimInstance -ClassName Win32_Printer -ErrorAction Stop
    foreach ($p in $printers) {
      if ($p.Name -match "(?i)(pdf|onenote|fax|xps|anydesk)") { continue }
      $result += @{ id = "PRINTER:$($p.DeviceID)"; name = "Printer: $($p.Name)"; source = "Printer" }
    }
  } catch { Write-Warning "Printer enumeration failed: $_" }
  return $result
}

function Get-TwainSources {
  $result = @()
  try {
    $paths = @(
      "HKLM:\SOFTWARE\WOW6432Node\TWAIN\TwainDSM",
      "HKLM:\SOFTWARE\TWAIN\TwainDSM"
    )
    foreach ($path in $paths) {
      if (Test-Path $path) {
        $items = Get-ChildItem -Path $path -ErrorAction Stop
        foreach ($item in $items) {
          $name = (Get-ItemProperty -Path $item.PSPath -ErrorAction SilentlyContinue)."(default)"
          if (-not $name) { $name = $item.PSChildName }
          $result += @{ id = "TWAIN:$($item.PSChildName)"; name = "TWAIN: $name"; source = "TWAIN" }
        }
      }
    }
  } catch { Write-Warning "TWAIN enumeration failed: $_" }
  return $result
}

function Get-WiaRegistry {
  $result = @()
  try {
    $wiaClass = "{6bdd1fc6-810f-11d0-bec7-08002be2092f}"
    $wiaPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Class\$wiaClass"
    if (Test-Path $wiaPath) {
      $items = Get-ChildItem -Path $wiaPath -ErrorAction Stop
      foreach ($item in $items) {
        $props = Get-ItemProperty -Path $item.PSPath -ErrorAction SilentlyContinue
        if ($props.DriverDesc -and $props.DriverDesc -ne "" -and $props.DriverDesc -notmatch "(?i)microsoft|ipp|class") {
          $result += @{ id = "WIA_REG:$($item.PSChildName)"; name = "$($props.DriverDesc)"; source = "WIA_Registered" }
        }
      }
    }
  } catch { Write-Warning "WIA registry enumeration failed: $_" }
  return $result
}

$allScanners = @()
$allScanners += Get-WiaScanners
$allScanners += Get-PnPScanners
$allScanners += Get-PrintQueues
$allScanners += Get-TwainSources
$allScanners += Get-WiaRegistry

# Deduplicate by name
$seen = @{}
$unique = @()
foreach ($s in $allScanners) {
  if (-not $seen.ContainsKey($s.name.ToLower())) {
    $seen[$s.name.ToLower()] = $true
    $unique += $s
  }
}

if ($unique.Count -eq 0) {
  Write-Output "[]"
} else {
  $json = $unique | ConvertTo-Json -Compress
  if ($unique.Count -eq 1) { $json = "[$json]" }
  Write-Output $json
}
`;

function buildScanPS(scannerId, dpi, outputPath) {
  const escapedPath = outputPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
  return `
$deviceManager = New-Object -ComObject WIA.DeviceManager
$matched = $false
foreach ($deviceInfo in $deviceManager.DeviceInfos) {
  if ($deviceInfo.DeviceID -eq '${scannerId}') {
    try {
      $device = $deviceInfo.Connect()
      $item = $device.Items.Item(1)
      $item.Properties("6147").Value = ${dpi}
      $image = $item.Transfer("{B96B3CAE-0728-11D3-9D7B-0000F81EF32E}")
      $image.SaveFile('${escapedPath}')
      Write-Output "OK"
    } catch {
      Write-Output "ERROR: $($_.Exception.Message)"
    }
    $matched = $true
    break
  }
}
if (-not $matched) {
  Write-Output "ERROR: Scanner not found"
}
`;
}

function runPowerShell(script) {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(os.tmpdir(), `scanner_${Date.now()}_${Math.random().toString(36).slice(2)}.ps1`);
    fs.writeFileSync(tempFile, script, 'utf8');
    execFile('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tempFile], { timeout: 120000 }, (err, stdout, stderr) => {
      try { fs.unlinkSync(tempFile); } catch {}
      if (err) {
        const msg = stderr ? stderr.trim() : err.message;
        return reject(new Error(msg || 'PowerShell execution failed'));
      }
      resolve(stdout.trim());
    });
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === 'GET' && url.pathname === '/scanners') {
      try {
        const output = await runPowerShell(LIST_SCANNERS_PS);
        const scanners = JSON.parse(output);
        sendJSON(res, 200, { scanners });
      } catch (err) {
        sendJSON(res, 500, { error: err.message });
      }

    } else if (req.method === 'POST' && url.pathname === '/scan') {
      const body = await parseBody(req);
      const scannerId = body.scannerId;
      const dpi = body.dpi || 200;
      const timestamp = Date.now();
      const outputPath = path.join(SCAN_DIR, `scan_${timestamp}.jpg`);

      if (!scannerId) {
        return sendJSON(res, 400, { error: 'scannerId is required' });
      }

      // Only WIA device IDs can be scanned (format: {GUID}\XXXX)
      if (!scannerId.startsWith('{')) {
        return sendJSON(res, 400, {
          error: 'This device does not have a WIA scanner driver installed. Scanning is only supported for WIA-compatible devices.',
          code: 'NO_WIA_DRIVER'
        });
      }

      const ps = buildScanPS(scannerId, dpi, outputPath);
      const output = await runPowerShell(ps);

      if (output.startsWith('ERROR:')) {
        return sendJSON(res, 500, { error: output.slice(6).trim() });
      }

      if (output === 'OK' && fs.existsSync(outputPath)) {
        const data = fs.readFileSync(outputPath);
        const base64 = data.toString('base64');
        try { fs.unlinkSync(outputPath); } catch {}
        sendJSON(res, 200, { path: outputPath, data: `data:image/jpeg;base64,${base64}` });
      } else {
        sendJSON(res, 500, { error: 'Scan produced no output' });
      }

    } else if (req.method === 'GET' && url.pathname === '/health') {
      sendJSON(res, 200, { status: 'ok' });

    } else {
      sendJSON(res, 404, { error: 'Not found' });
    }
  } catch (err) {
    sendJSON(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Scanner agent running at http://localhost:${PORT}`);
  console.log(`Scan output directory: ${SCAN_DIR}`);
});
