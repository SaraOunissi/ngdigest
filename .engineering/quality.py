"""Portable quality runner. No deployment, credentials or production mutation."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys
import time
from datetime import datetime, timezone

VERSION = 1
SECRET_PATTERNS = [r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
                   r'\bAKIA[A-Z0-9]{16}\b', r'\bgh[pousr]_[A-Za-z0-9]{36,}\b',
                   r'\bgithub_pat_[A-Za-z0-9_]{60,}\b']
COLOR = re.compile(r'(?<![\w-])#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(')


def git(root: Path, *args: str) -> str:
    result = subprocess.run(['git', '-c', f'safe.directory={root.as_posix()}', '-C', str(root), *args],
                            text=True, encoding='utf-8', errors='replace', capture_output=True)
    if result.returncode:
        raise RuntimeError('Git inspection unavailable: ' + result.stderr[:300])
    return result.stdout.strip()


def policy(root: Path, config: dict, base: str | None) -> list[str]:
    failures = []
    trusted_styles = list(config['design_tokens'])
    for generated, source in config.get('generated_styles', {}).items():
        if not (root / generated).is_file() or not (root / source).is_file():
            failures.append('Generated palette or source missing: ' + generated)
            continue
        content = (root / generated).read_text(encoding='utf-8')
        literals = set(COLOR.findall(content))
        source_literals = set(COLOR.findall((root / source).read_text(encoding='utf-8')))
        # Generated standalone resources may repeat exact hex tokens, but no new palette.
        if any(not value.startswith('#') for value in literals) or not literals.issubset(source_literals):
            failures.append('Generated palette diverges from tokens: ' + generated)
        else:
            trusted_styles.append(generated)
    for path in config['design_tokens']:
        if not (root / path).is_file():
            failures.append(f'Design source missing: {path}')
    for path in ['PLAN.md', 'AGENTS.md']:
        if not (root / path).is_file():
            failures.append(f'Entry point missing: {path}')
    names = git(root, 'ls-files', '--cached', '--others', '--exclude-standard').splitlines()
    for name in names:
        path = root / name
        if not path.is_file() or path.stat().st_size > 2_000_000:
            continue
        if path.name.startswith('.env') and path.name not in ['.env.example', '.env.sample']:
            failures.append(f'Environment file in Git input: {name}')
        if path.suffix not in ['.py', '.ts', '.js', '.mjs', '.json', '.yaml', '.yml', '.toml', '.env']:
            continue
        for index, line in enumerate(path.read_text(encoding='utf-8', errors='replace').splitlines(), 1):
            if any(re.search(pattern, line) for pattern in SECRET_PATTERNS):
                failures.append(f'Potential secret (value hidden): {name}:{index}')
    diff = git(root, 'diff', '--no-ext-diff', '--unified=0', base or 'HEAD', '--', '*.scss', '*.css', '*.html')
    current = ''
    for line in diff.splitlines():
        if line.startswith('+++ b/'):
            current = line[6:]
        elif line.startswith('+') and not line.startswith('+++'):
            if current not in trusted_styles and COLOR.search(line[1:]):
                failures.append(f'New literal colour outside design tokens: {current}')
    # New, untracked styles also count; git diff alone does not include them.
    for name in git(root, 'ls-files', '--others', '--exclude-standard').splitlines():
        path = root / name
        if path.suffix in ['.scss', '.css'] and name not in trusted_styles:
            if COLOR.search(path.read_text(encoding='utf-8', errors='replace')):
                failures.append(f'New style file has literal colours: {name}')
    for pair in config.get('translations', []):
        def keys(value: object, prefix: str = '') -> set[str]:
            if isinstance(value, dict):
                return {key for name, child in value.items() for key in keys(child, prefix + '.' + name)}
            return {prefix}
        try:
            left, right = [keys(json.loads((root / name).read_text(encoding='utf-8-sig'))) for name in pair]
        except (OSError, ValueError):
            failures.append('Translation source missing or malformed: ' + ' / '.join(pair))
            continue
        if left != right:
            failures.append(f'Translation keys differ: {pair[0]} / {pair[1]} ({len(left ^ right)} keys)')
    return sorted(set(failures))


def resolve_command(command: list[str], root: Path, config: dict) -> list[str]:
    tooling = os.environ.get('QUALITY_TOOLING') or str(root / '.engineering')
    command = [part.replace('{tooling}', tooling) for part in command]
    if command[0] == '{python}':
        local = root / config.get('local_python', 'nonexistent')
        command[0] = os.environ.get('QUALITY_PYTHON') or (str(local) if local.exists() and os.name == 'nt' else sys.executable)
    if command[0] in ['npm', 'pnpm']:
        command[0] = shutil.which(command[0]) or command[0]
    return command


def run_bounded(command: list[str], cwd: Path, env: dict, timeout: int):
    process = subprocess.Popen(command, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                               start_new_session=os.name != 'nt')
    try:
        stdout, stderr = process.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        # Stop only this command's process tree; do not leave Angular workers running.
        if os.name == 'nt':
            subprocess.run(['taskkill', '/PID', str(process.pid), '/T', '/F'], capture_output=True, timeout=10)
        else:
            os.killpg(process.pid, signal.SIGKILL)
        if process.poll() is None: process.kill()
        stdout, stderr = process.communicate(timeout=5)
        raise subprocess.TimeoutExpired(command, timeout, output=stdout, stderr=stderr)
    return subprocess.CompletedProcess(command, process.returncode, stdout, stderr)


def execute(root: Path, config: dict, mode: str, base: str | None) -> dict:
    out = root / '.engineering/artifacts'
    out.mkdir(parents=True, exist_ok=True)
    report = {'schema': VERSION, 'project': config['project'], 'checked_at': datetime.now(timezone.utc).isoformat(),
              'head': git(root, 'rev-parse', 'HEAD'), 'dirty': bool(git(root, 'status', '--porcelain')),
              'mode': mode, 'production_verified': False, 'status': 'running', 'automated_gate_passed': False, 'checks': []}
    def checkpoint():
        temporary = out / (mode + '.json.tmp')
        temporary.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
        temporary.replace(out / (mode + '.json'))
    checkpoint()
    start = time.monotonic()
    if base and set(base) == {'0'}:
        base = 'HEAD'
    errors = policy(root, config, base)
    groups = {item['group'] for item in config.get('commands', [])}
    if mode == 'all' and {'lint', 'test', 'build', 'browser'} - groups:
        errors.append('Incomplete gate: missing command groups ' + ', '.join(sorted({'lint', 'test', 'build', 'browser'} - groups)))
    lock = root / '.engineering/tooling-lock.json'
    if not lock.is_file():
        errors.append('Common tooling manifest missing; run the canonical sync.py')
    else:
        for name, expected in json.loads(lock.read_text(encoding='utf-8'))['sha256'].items():
            path = root / '.engineering' / name
            if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
                errors.append('Common tooling modified outside canonical source: ' + name)
    if base and base != 'HEAD':
        changed = git(root, 'diff', '--name-only', base, '--').splitlines()
        if any(name.endswith(('.ts', '.py', '.scss', '.html')) and not name.startswith('.engineering/') for name in changed) and 'PLAN.md' not in changed:
            errors.append('Product change without an updated PLAN.md evidence reference')
    report['checks'].append({'id': 'policy', 'status': 'failed' if errors else 'passed', 'findings': errors})
    selected = [] if mode == 'policy' else [item for item in config['commands'] if mode == 'all' or item['group'] == mode]
    for item in selected:
        before = time.monotonic()
        if item['group'] == 'browser' and any(check['status'] != 'passed' for check in report['checks'] if check['id'] in [step['id'] for step in selected if step['group'] == 'build']):
            report['checks'].append({'id': item['id'], 'status': 'blocked', 'reason': 'Build failed; refusing stale browser assets'})
            checkpoint()
            continue
        env = os.environ.copy()
        env.update({'CI': 'true', 'NG_CLI_ANALYTICS': 'false', 'MONGO_URI': '', 'MONGODB_URI': '',
                    'MONGO_URL': '', 'SERPAPI_API_KEY': '', 'SERP_API_KEY': '', 'QUALITY_CONFIG': str(root / '.engineering/quality.json')})
        env.setdefault('NG_BUILD_MAX_WORKERS', '2')
        env.setdefault('NODE_OPTIONS', '--max-old-space-size=3072')
        env.update(item.get('env', {}))
        try:
            result = run_bounded(resolve_command(item['command'], root, config), root / item.get('cwd', '.'),
                                 env, item.get('timeout', 300))
            output = (result.stdout + result.stderr).decode('utf-8', errors='replace')
            # Suppress credentials if a dependency prints a connection string.
            output = re.sub(r'(mongodb(?:\+srv)?|https?)://[^\s/@:]+:[^\s/@]+@', r'\1://[REDACTED]@', output)
            for pattern in SECRET_PATTERNS[1:]:
                output = re.sub(pattern, '[REDACTED]', output)
            (out / (item['id'] + '.log')).write_text(output, encoding='utf-8')
            status = 'passed' if result.returncode == 0 else 'failed'
            detail = {'exit_code': result.returncode, 'log': item['id'] + '.log'}
        except (OSError, subprocess.TimeoutExpired) as error:
            status, detail = 'blocked', {'reason': type(error).__name__}
            (out / (item['id'] + '.log')).write_text('Control blocked: ' + type(error).__name__ + '. Previous logs do not apply.\n', encoding='utf-8')
        check = {'id': item['id'], 'status': status, 'seconds': round(time.monotonic() - before, 2), **detail}
        report['checks'].append(check)
        checkpoint()
        print(f'{config["project"]}: {item["id"]}: {status}', flush=True)
    final_head = git(root, 'rev-parse', 'HEAD')
    report['finished_head'] = final_head
    if final_head != report['head']:
        report['checks'].append({'id': 'concurrent-change', 'status': 'failed', 'reason': 'HEAD changed during verification; results do not attest the new revision'})
    report['status'] = 'passed' if all(item['status'] == 'passed' for item in report['checks']) else 'failed'
    report['duration_seconds'] = round(time.monotonic() - start, 2)
    report['config_sha256'] = hashlib.sha256((root / '.engineering/quality.json').read_bytes()).hexdigest()
    # A partial run must never be labelled a full release gate.
    report['automated_gate_passed'] = report['status'] == 'passed' and mode == 'all'
    report['manual_visual_review'] = 'not_attested_by_this_runner'
    report['finished_at'] = datetime.now(timezone.utc).isoformat()
    checkpoint()
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path.cwd())
    parser.add_argument('--mode', choices=['all', 'policy', 'test', 'build', 'lint', 'browser'], default='all')
    parser.add_argument('--base', default=os.environ.get('QUALITY_BASE_REF'))
    args = parser.parse_args()
    root = args.root.resolve()
    config = json.loads((root / '.engineering/quality.json').read_text(encoding='utf-8'))
    result = execute(root, config, args.mode, args.base)
    print(json.dumps({'project': config['project'], 'status': result['status'], 'report': str(root / '.engineering/artifacts' / (args.mode + '.json'))}))
    sys.exit(0 if result['status'] == 'passed' else 1)
