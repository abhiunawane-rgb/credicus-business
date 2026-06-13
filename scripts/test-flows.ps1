$base = "http://localhost:3000"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$results = @()

function Test-Route {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Method = "GET",
    [object]$Body = $null,
    [int[]]$ExpectStatus = @(200),
    [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession = $session
  )

  try {
    $params = @{
      Uri = $Url
      Method = $Method
      WebSession = $WebSession
      UseBasicParsing = $true
    }
    if ($Body) {
      $params.ContentType = "application/json"
      $params.Body = ($Body | ConvertTo-Json -Compress)
    }
    $response = Invoke-WebRequest @params
    $ok = $ExpectStatus -contains $response.StatusCode
    $results += [PSCustomObject]@{ Test = $Name; Status = if ($ok) { "PASS" } else { "FAIL" }; Code = $response.StatusCode; Detail = "" }
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    $ok = $ExpectStatus -contains $code
    $results += [PSCustomObject]@{ Test = $Name; Status = if ($ok) { "PASS" } else { "FAIL" }; Code = $code; Detail = $_.Exception.Message }
  }
}

function Login-As {
  param([string]$Role, [string]$Email, [string]$Password)
  $loginSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $body = @{ email = $Email; password = $Password }
  $response = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -ContentType "application/json" -Body ($body | ConvertTo-Json -Compress) -WebSession $loginSession -UseBasicParsing
  return [PSCustomObject]@{ Role = $Role; Session = $loginSession; Response = $response.Content }
}

# Website pages
Test-Route "Home page" "$base/"
Test-Route "About page" "$base/about"
Test-Route "Services page" "$base/services"
Test-Route "Clients page" "$base/clients"
Test-Route "Contact page" "$base/contact"
Test-Route "Sign-in page" "$base/sign-in"

$homeHtml = (Invoke-WebRequest -Uri "$base/" -UseBasicParsing).Content
if ($homeHtml -match "Breadcrumb") {
  $results += [PSCustomObject]@{ Test = "Website has no breadcrumbs"; Status = "FAIL"; Code = ""; Detail = "Breadcrumb found on home" }
} else {
  $results += [PSCustomObject]@{ Test = "Website has no breadcrumbs"; Status = "PASS"; Code = ""; Detail = "" }
}

$accounts = @(
  @{ Role = "recruiter"; Email = "recruiter@credicus.com"; Password = "Recruiter@123"; Dashboard = "/dashboard/recruiter"; Denied = "/dashboard/admin" },
  @{ Role = "team_leader"; Email = "teamleader@credicus.com"; Password = "TeamLeader@123"; Dashboard = "/dashboard/team-leader"; Denied = "/dashboard/recruiter" },
  @{ Role = "admin"; Email = "admin@credicus.com"; Password = "Admin@123"; Dashboard = "/dashboard/admin"; Denied = "/dashboard/recruiter" }
)

foreach ($account in $accounts) {
  $login = Login-As -Role $account.Role -Email $account.Email -Password $account.Password
  $redirect = ($login.Response | ConvertFrom-Json).redirectTo
  if ($redirect -eq $account.Dashboard) {
    $results += [PSCustomObject]@{ Test = "$($account.Role) login redirect"; Status = "PASS"; Code = 200; Detail = $redirect }
  } else {
    $results += [PSCustomObject]@{ Test = "$($account.Role) login redirect"; Status = "FAIL"; Code = ""; Detail = "Expected $($account.Dashboard), got $redirect" }
  }

  Test-Route "$($account.Role) dashboard" "$base$($account.Dashboard)" -WebSession $login.Session
  Test-Route "$($account.Role) settings" "$base/dashboard/settings" -WebSession $login.Session
  Test-Route "$($account.Role) denied route" "$base$($account.Denied)" -WebSession $login.Session -ExpectStatus @(200)

  $deniedFinal = ""
  try {
    $deniedResponse = Invoke-WebRequest -Uri "$base$($account.Denied)" -WebSession $login.Session -MaximumRedirection 0 -UseBasicParsing
    $deniedFinal = $deniedResponse.BaseResponse.ResponseUri.AbsolutePath
  } catch {
    if ($_.Exception.Response.Headers.Location) {
      $deniedFinal = $_.Exception.Response.Headers.Location
    }
  }
  if ($deniedFinal -match "/dashboard($|/)") {
    $results += [PSCustomObject]@{ Test = "$($account.Role) role guard"; Status = "PASS"; Code = ""; Detail = "Redirected away from denied route" }
  } else {
    $results += [PSCustomObject]@{ Test = "$($account.Role) role guard"; Status = "FAIL"; Code = ""; Detail = "Could access $($account.Denied)" }
  }

  if ($account.Role -eq "admin") {
    try {
      $users = Invoke-WebRequest -Uri "$base/api/admin/users" -WebSession $login.Session -UseBasicParsing
      $count = (($users.Content | ConvertFrom-Json).data | Measure-Object).Count
      $results += [PSCustomObject]@{ Test = "Admin users API"; Status = if ($count -ge 3) { "PASS" } else { "FAIL" }; Code = 200; Detail = "$count users" }
    } catch {
      $results += [PSCustomObject]@{ Test = "Admin users API"; Status = "FAIL"; Code = ""; Detail = $_.Exception.Message }
    }
  }

  if ($account.Role -eq "recruiter") {
    try {
      Invoke-WebRequest -Uri "$base/api/candidates/upload" -Method POST -WebSession (New-Object Microsoft.PowerShell.Commands.WebRequestSession) -UseBasicParsing | Out-Null
      $results += [PSCustomObject]@{ Test = "Upload API without auth blocked"; Status = "FAIL"; Code = 200; Detail = "" }
    } catch {
      $code = $_.Exception.Response.StatusCode.value__
      $results += [PSCustomObject]@{ Test = "Upload API without auth blocked"; Status = if ($code -eq 401) { "PASS" } else { "FAIL" }; Code = $code; Detail = "" }
    }
  }

  Invoke-WebRequest -Uri "$base/api/auth/logout" -Method POST -WebSession $login.Session -UseBasicParsing | Out-Null
}

$results | Format-Table -AutoSize
$failed = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
Write-Output "TOTAL: $($results.Count) | PASSED: $($results.Count - $failed) | FAILED: $failed"
if ($failed -gt 0) { exit 1 }
