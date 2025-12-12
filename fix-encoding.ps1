# Script PowerShell pour convertir application.properties en UTF-8

$filePath = "backend\PaymentService\src\main\resources\application.properties"

Write-Host "Converting $filePath to UTF-8..." -ForegroundColor Yellow

# Lire le contenu avec l'encodage actuel
$content = Get-Content -Path $filePath -Raw -Encoding Default

# Écrire avec UTF-8 sans BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($filePath, $content, $utf8NoBom)

Write-Host "✅ Conversion terminée!" -ForegroundColor Green
Write-Host "Le fichier est maintenant encodé en UTF-8" -ForegroundColor Green