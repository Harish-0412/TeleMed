@echo off
echo Creating clean repository without API keys...

REM Delete .git folder to remove all history
rmdir /s /q .git

REM Remove API keys from all files
powershell -Command "(Get-Content 'client\src\pages\AIHealthAssistant.tsx') -replace 'gsk_[a-zA-Z0-9_-]*', 'import.meta.env.VITE_GROQ_API_KEY' | Set-Content 'client\src\pages\AIHealthAssistant.tsx'"
powershell -Command "(Get-Content 'client\src\pages\PrescriptionPage.tsx') -replace 'gsk_[a-zA-Z0-9_-]*', 'import.meta.env.VITE_GROQ_API_KEY' | Set-Content 'client\src\pages\PrescriptionPage.tsx'"
powershell -Command "(Get-Content 'client\src\pages\AIPrescriptionPage.tsx') -replace 'gsk_[a-zA-Z0-9_-]*', 'import.meta.env.VITE_GROQ_API_KEY' | Set-Content 'client\src\pages\AIPrescriptionPage.tsx'"

REM Update authorization headers
powershell -Command "(Get-Content 'client\src\pages\AIHealthAssistant.tsx') -replace \"'Authorization': 'Bearer import.meta.env.VITE_GROQ_API_KEY',\", \"'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,\" | Set-Content 'client\src\pages\AIHealthAssistant.tsx'"
powershell -Command "(Get-Content 'client\src\pages\PrescriptionPage.tsx') -replace \"'Authorization': 'Bearer import.meta.env.VITE_GROQ_API_KEY',\", \"'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,\" | Set-Content 'client\src\pages\PrescriptionPage.tsx'"
powershell -Command "(Get-Content 'client\src\pages\AIPrescriptionPage.tsx') -replace \"'Authorization': 'Bearer import.meta.env.VITE_GROQ_API_KEY',\", \"'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,\" | Set-Content 'client\src\pages\AIPrescriptionPage.tsx'"

REM Initialize new git repository
git init
git add .
git commit -m "Initial commit: TeleMed rural healthcare platform with secure API configuration"

echo Clean repository created successfully!
echo Now add your GitHub remote and push:
echo git remote add origin https://github.com/Harish-0412/TeleMed.git
echo git branch -M main
echo git push -u origin main
pause