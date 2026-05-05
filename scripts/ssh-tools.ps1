$ssh = "C:\Windows\System32\OpenSSH\ssh.exe"
$scp = "C:\Windows\System32\OpenSSH\scp.exe"
if (!(Test-Path $ssh)) {
	$sshCommand = Get-Command ssh -ErrorAction SilentlyContinue
	if ($sshCommand) {
		$ssh = $sshCommand.Source
	}
}
if (!(Test-Path $scp)) {
	$scpCommand = Get-Command scp -ErrorAction SilentlyContinue
	if ($scpCommand) {
		$scp = $scpCommand.Source
	}
}
if (!(Test-Path $ssh)) {
	throw "ssh was not found. Install OpenSSH Client or add ssh.exe to PATH."
}
if (!(Test-Path $scp)) {
	throw "scp was not found. Install OpenSSH Client or add scp.exe to PATH."
}
