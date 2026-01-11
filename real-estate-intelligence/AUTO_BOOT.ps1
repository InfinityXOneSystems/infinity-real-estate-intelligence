while (\True) {
  docker info > \ 2>&1
  if (\0 -eq 0) { break }
  Start-Sleep 5
}
Set-Location 'C:\AI\repos\InfinityXOneSystems'
docker compose up -d --remove-orphans --no-build
