#!/usr/bin/env pwsh
Get-ChildItem *.jpg | Move-Item -Destination { $_.Name -replace '.jpg', '.jpeg'}