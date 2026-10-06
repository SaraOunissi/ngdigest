"""Audit locked dependencies without upgrading packages or modifying lockfiles."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
from datetime import datetime, timezone

root = Path.cwd()
config = json.loads((root / '.engineering/quality.json').read_text(encoding='utf-8'))
out = root / '.engineering/artifacts/security'
out.mkdir(parents=True, exist_ok=True)
checks = []
targets = [('frontend', config['frontend'])]
if (root / '.engineering/package-lock.json').is_file(): targets.append(('tooling', '.engineering'))
if config.get('backend_node'): targets.append(('backend', config['backend_node']))
for identifier, directory in targets:
    folder = root / directory
    pnpm = (folder / 'pnpm-lock.yaml').exists()
    manager = 'pnpm' if pnpm else 'npm'
    lock = folder / ('pnpm-lock.yaml' if pnpm else 'package-lock.json')
    checks.append((identifier, folder, lock, [shutil.which(manager) or manager, 'audit', '--audit-level=high', '--json']))
if config.get('backend'):
    folder = root / config['backend']
    lock = folder / ('requirements.lock' if (folder / 'requirements.lock').exists() else 'requirements.txt')
    checks.append(('python', folder, lock, [sys.executable, '-m', 'pip_audit', '-r', lock.name, '--format=json', '--progress-spinner=off']))

def pnpm_status(stdout):
    """pnpm audit --json exits 1 while GHSAs ignored via auditConfig.ignoreGhsas are still
    counted in its metadata. Only the advisories it actually lists count; anything we cannot
    read stays failed."""
    try:
        advisories = json.loads(stdout)['advisories']
    except (ValueError, KeyError, TypeError):
        return 'failed'
    if not isinstance(advisories, dict):
        return 'failed'
    blocking = [a for a in advisories.values() if a.get('severity') in ('high', 'critical')]
    return 'failed' if blocking else 'passed'


report = {'checked_at': datetime.now(timezone.utc).isoformat(), 'project': config['project'], 'checks': [],
          'scope': 'npm high/critical, all known Python severities; no automatic fix'}
for identifier, folder, lock, command in checks:
    before = lock.read_bytes()
    try:
        result = subprocess.run(command, cwd=folder, capture_output=True, timeout=180)
        (out / (identifier + '.json')).write_bytes(result.stdout)
        (out / (identifier + '.log')).write_bytes(result.stderr)
        status = 'passed' if result.returncode == 0 else 'failed'
        if status == 'failed' and command[1:2] == ['audit'] and lock.name == 'pnpm-lock.yaml':
            status = pnpm_status(result.stdout)
    except (OSError, subprocess.TimeoutExpired):
        status = 'blocked'
    if lock.read_bytes() != before: raise RuntimeError('Audit modified lockfile: ' + str(lock))
    report['checks'].append({'id': identifier, 'status': status, 'lock_sha256': hashlib.sha256(before).hexdigest()})
report['status'] = 'passed' if all(c['status'] == 'passed' for c in report['checks']) else 'failed'
(out / 'report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report))
raise SystemExit(0 if report['status'] == 'passed' else 1)
