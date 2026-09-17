param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$Root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$Prefix = "http://127.0.0.1:$Port/"

$Mime = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".vqeaf" = "text/plain; charset=utf-8"
    ".md"    = "text/markdown; charset=utf-8"
    ".svg"   = "image/svg+xml"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".webp"  = "image/webp"
    ".gif"   = "image/gif"
    ".ico"   = "image/x-icon"
    ".zip"   = "application/zip"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
}

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add($Prefix)

try {
    $Listener.Start()
    Write-Host "[SERVER] VQEAF Theme Studio" -ForegroundColor Cyan
    Write-Host "[SERVER] $Prefix" -ForegroundColor Green
    Write-Host "[SERVER] Nhan Ctrl+C de dung." -ForegroundColor DarkGray

    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        try {
            $RequestPath = [Uri]::UnescapeDataString($Context.Request.Url.AbsolutePath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($RequestPath)) {
                $RequestPath = "index.html"
            }

            $Relative = $RequestPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $Candidate = [System.IO.Path]::GetFullPath((Join-Path $Root $Relative))

            if (-not $Candidate.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
                $Context.Response.StatusCode = 403
                $Bytes = [Text.Encoding]::UTF8.GetBytes("403 Forbidden")
                $Context.Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
                continue
            }

            if (Test-Path $Candidate -PathType Container) {
                $Candidate = Join-Path $Candidate "index.html"
            }

            if (-not (Test-Path $Candidate -PathType Leaf)) {
                $Context.Response.StatusCode = 404
                $Bytes = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $Context.Response.ContentType = "text/plain; charset=utf-8"
                $Context.Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
                continue
            }

            $Extension = [System.IO.Path]::GetExtension($Candidate).ToLowerInvariant()
            if ($Mime.ContainsKey($Extension)) {
                $Context.Response.ContentType = $Mime[$Extension]
            } else {
                $Context.Response.ContentType = "application/octet-stream"
            }

            $Bytes = [System.IO.File]::ReadAllBytes($Candidate)
            $Context.Response.StatusCode = 200
            $Context.Response.ContentLength64 = $Bytes.LongLength
            $Context.Response.Headers["Cache-Control"] = "no-cache"
            $Context.Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        }
        catch {
            try {
                $Context.Response.StatusCode = 500
                $Bytes = [Text.Encoding]::UTF8.GetBytes("500 Internal Server Error")
                $Context.Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
            } catch {}
        }
        finally {
            try { $Context.Response.OutputStream.Close() } catch {}
        }
    }
}
finally {
    if ($Listener.IsListening) {
        $Listener.Stop()
    }
    $Listener.Close()
}
