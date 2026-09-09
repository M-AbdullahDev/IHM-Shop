# Lightweight local web server for Demo Shop. Started by Start DEMO.vbs.
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://127.0.0.1:8765/')

$contentTypes = @{
    '.css'  = 'text/css; charset=utf-8'
    '.html' = 'text/html; charset=utf-8'
    '.ico'  = 'image/x-icon'
    '.jpeg' = 'image/jpeg'
    '.jpg'  = 'image/jpeg'
    '.js'   = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.svg'  = 'image/svg+xml'
    '.webp' = 'image/webp'
}

try {
    $listener.Start()

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $requestPath = [uri]::UnescapeDataString($context.Request.Url.AbsolutePath)
        if ($requestPath -eq '/') { $requestPath = '/index.html' }

        $relativePath = $requestPath.TrimStart('/', '\')
        $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))

        if ($relativePath -match '(^|[\\/])\.\.([\\/]|$)' -or -not $filePath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
            $context.Response.StatusCode = 404
            $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not found')
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            $context.Response.Close()
            continue
        }

        $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
        $context.Response.ContentType = if ($contentTypes.ContainsKey($extension)) { $contentTypes[$extension] } else { 'application/octet-stream' }
        $context.Response.Headers['Cache-Control'] = 'no-store'
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $context.Response.Close()
    }
}
catch {
    # If an earlier launcher is already serving the app, the browser will still open normally.
}
finally {
    if ($listener.IsListening) { $listener.Stop() }
    $listener.Close()
}
