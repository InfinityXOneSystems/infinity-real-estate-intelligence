function Validate-DockerPaths {
    if (Test-Path services/gateway-ts) {
        throw 'LEGACY gateway-ts DETECTED — REMOVE'
    }
}
Validate-DockerPaths
