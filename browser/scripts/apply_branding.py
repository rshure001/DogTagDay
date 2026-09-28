#!/usr/bin/env python3
from pathlib import Path
import re
import sys

PRODUCT = 'Dog Tag Day Browser'
SHORT = 'Dog Tag Day'

src = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
strings = src / 'chrome/app/chromium_strings.grd'
if not strings.exists():
    raise SystemExit(f'Chromium strings file not found: {strings}')

text = strings.read_text(encoding='utf-8')

def replace_message(source: str, name: str, value: str) -> str:
    pattern = re.compile(
        rf'(<message\s+name="{re.escape(name)}"[^>]*>)(.*?)(</message>)',
        flags=re.DOTALL,
    )
    matches = list(pattern.finditer(source))
    if not matches:
        raise SystemExit(f'Missing expected Chromium string: {name}')

    def repl(match: re.Match[str]) -> str:
        body = match.group(2)
        indent_match = re.search(r'\n([ \t]*)\S', body)
        indent = indent_match.group(1) if indent_match else '            '
        return f'{match.group(1)}\n{indent}{value}\n{indent[:-2] if len(indent) >= 2 else ""}{match.group(3)}'

    return pattern.sub(repl, source)

text = replace_message(text, 'IDS_PRODUCT_NAME', PRODUCT)
text = replace_message(text, 'IDS_SHORT_PRODUCT_NAME', SHORT)
strings.write_text(text, encoding='utf-8')

print(f'Applied Dog Tag Day branding to {strings}')
print(f'Product name: {PRODUCT}')
print(f'Short name: {SHORT}')
