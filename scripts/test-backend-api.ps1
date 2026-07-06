# Full backend API smoke test - run while dev server is on http://localhost:3000
$ErrorActionPreference = "Continue"
$base = "http://localhost:3000"
$script:results = @()
$apiTimeout = 120

function Record-Test {
  param([string]$Name, [bool]$Ok, [string]$Detail = "")
  $script:results += [PSCustomObject]@{
    Test   = $Name
    Status = if ($Ok) { "PASS" } else { "FAIL" }
    Detail = $Detail
  }
  if (-not $Ok) { Write-Host "FAIL: $Name - $Detail" -ForegroundColor Red }
}

function Wait-Server {
  param([int]$MaxSeconds = 120)
  for ($i = 0; $i -lt $MaxSeconds; $i += 3) {
    try {
      $r = Invoke-WebRequest -Uri "$base/api/auth/session" -UseBasicParsing -TimeoutSec 5
      return $true
    } catch {
      Start-Sleep -Seconds 3
    }
  }
  return $false
}

if (-not (Wait-Server)) {
  Write-Host "Server not reachable at $base" -ForegroundColor Red
  exit 1
}

Record-Test "Server reachable" $true

# --- Auth ---
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
try {
  $loginBody = @{ email = "recruiter@credicus.com"; password = "Recruiter@123" } | ConvertTo-Json
  $login = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout
  $redirect = ($login.Content | ConvertFrom-Json).redirectTo
  Record-Test "Login API" ($redirect -eq "/dashboard/recruiter") "redirect=$redirect"
} catch {
  Record-Test "Login API" $false $_.Exception.Message
}

try {
  $sess = Invoke-WebRequest -Uri "$base/api/auth/session" -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout
  $auth = ($sess.Content | ConvertFrom-Json).authenticated
  Record-Test "Session API" ($auth -eq $true) ""
} catch {
  Record-Test "Session API" $false $_.Exception.Message
}

# --- Candidates list ---
try {
  $list = Invoke-WebRequest -Uri "$base/api/candidates" -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout
  $count = (($list.Content | ConvertFrom-Json).data | Measure-Object).Count
  Record-Test "GET /api/candidates" ($count -ge 1) "$count candidates"
} catch {
  Record-Test "GET /api/candidates" $false $_.Exception.Message
}

# --- Create candidate (save to backend) ---
$newId = $null
try {
  $createBody = @{
    first_name = "Test"
    last_name  = "Candidate"
    name       = "Test Candidate"
    mobile     = "9999887766"
    experience = 0
    source     = "other"
  } | ConvertTo-Json
  $created = Invoke-WebRequest -Uri "$base/api/candidates" -Method POST -ContentType "application/json" -Body $createBody -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout
  $newId = ($created.Content | ConvertFrom-Json).data.id
  Record-Test "POST /api/candidates (save)" ($null -ne $newId) "id=$newId"
} catch {
  Record-Test "POST /api/candidates (save)" $false $_.Exception.Message
}

# --- Search ---
try {
  $search = Invoke-WebRequest -Uri "$base/api/candidates?search=Test" -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout
  $found = (($search.Content | ConvertFrom-Json).data | Measure-Object).Count -ge 1
  Record-Test "GET /api/candidates?search=" $found ""
} catch {
  Record-Test "GET /api/candidates?search=" $false $_.Exception.Message
}

  if ($newId) {
    Start-Sleep -Seconds 1
    # --- PATCH status ---
  try {
    $patchBody = @{ status = "shortlisted" } | ConvertTo-Json
    $patched = Invoke-WebRequest -Uri "$base/api/candidates/$newId" -Method PATCH -ContentType "application/json" -Body $patchBody -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout
    $status = ($patched.Content | ConvertFrom-Json).data.status
    Record-Test "PATCH /api/candidates/[id]" ($status -eq "shortlisted") "status=$status"
  } catch {
    Record-Test "PATCH /api/candidates/[id]" $false $_.Exception.Message
  }

  # --- Comment ---
  try {
    $commentBody = @{ content = "Backend test comment" } | ConvertTo-Json
    $comment = Invoke-WebRequest -Uri "$base/api/candidates/$newId/comments" -Method POST -ContentType "application/json" -Body $commentBody -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout
    $cid = ($comment.Content | ConvertFrom-Json).data.id
    Record-Test "POST /api/candidates/[id]/comments" ($null -ne $cid) ""
  } catch {
    Record-Test "POST /api/candidates/[id]/comments" $false $_.Exception.Message
  }

  # --- GET single ---
  try {
    $one = Invoke-WebRequest -Uri "$base/api/candidates/$newId" -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout
    $payload = $one.Content | ConvertFrom-Json
    $name = $payload.data.name
    Record-Test "GET /api/candidates/[id]" ($null -ne $payload.data -and $name -eq "Test Candidate") "name=$name"
  } catch {
    Record-Test "GET /api/candidates/[id]" $false $_.Exception.Message
  }
}

# --- Dashboard stats ---
try {
  $stats = Invoke-WebRequest -Uri "$base/api/dashboard/stats" -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout
  $total = ($stats.Content | ConvertFrom-Json).data.totalCandidates
  Record-Test "GET /api/dashboard/stats" ($total -ge 1) "total=$total"
} catch {
  Record-Test "GET /api/dashboard/stats" $false $_.Exception.Message
}

# --- Contact form (public) ---
try {
  $contactBody = @{
    name    = "Site Visitor"
    email   = "visitor@test.com"
    message = "Backend contact test"
  } | ConvertTo-Json
  $contact = Invoke-WebRequest -Uri "$base/api/contact" -Method POST -ContentType "application/json" -Body $contactBody -UseBasicParsing -TimeoutSec $apiTimeout
  $code = $contact.StatusCode
  Record-Test "POST /api/contact" ($code -eq 201) "status=$code"
} catch {
  Record-Test "POST /api/contact" $false $_.Exception.Message
}

# --- Unauthenticated blocked ---
try {
  Invoke-WebRequest -Uri "$base/api/candidates" -Method POST -ContentType "application/json" -Body "{}" -UseBasicParsing -TimeoutSec $apiTimeout | Out-Null
  Record-Test "POST without auth blocked" $false "got 200"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  Record-Test "POST without auth blocked" ($code -eq 401) "status=$code"
}

# --- Logout ---
try {
  Invoke-WebRequest -Uri "$base/api/auth/logout" -Method POST -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout | Out-Null
  $after = Invoke-WebRequest -Uri "$base/api/auth/session" -WebSession $session -UseBasicParsing -TimeoutSec $apiTimeout
  $auth = ($after.Content | ConvertFrom-Json).authenticated
  Record-Test "Logout API" ($auth -eq $false) ""
} catch {
  Record-Test "Logout API" $false $_.Exception.Message
}

# --- Pages ---
$pages = @("/", "/sign-in", "/dashboard/recruiter", "/dashboard/recruiter/candidates", "/dashboard/recruiter/vendor-jobs")
foreach ($page in $pages) {
  try {
    if ($page -match "^/dashboard") {
      $r = Invoke-WebRequest -Uri "$base$page" -MaximumRedirection 0 -UseBasicParsing -TimeoutSec $apiTimeout -ErrorAction Stop
    } else {
      $r = Invoke-WebRequest -Uri "$base$page" -UseBasicParsing -TimeoutSec $apiTimeout
    }
    $ok = $r.StatusCode -eq 200 -or $r.StatusCode -eq 307
    Record-Test "Page $page" $ok "status=$($r.StatusCode)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    $ok = ($code -eq 307 -or $code -eq 302) -and ($page -match "dashboard")
    Record-Test "Page $page" $ok "status=$code"
  }
}

$script:results | Format-Table -AutoSize
$failed = ($script:results | Where-Object { $_.Status -eq "FAIL" }).Count
Write-Host ""
Write-Host "TOTAL: $($script:results.Count) | PASSED: $($script:results.Count - $failed) | FAILED: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
if ($failed -gt 0) { exit 1 }
