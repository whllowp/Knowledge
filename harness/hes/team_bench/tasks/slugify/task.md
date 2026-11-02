# Slugify

Implement `slugify(text: str) -> str` in `solution.py`.

Rules:

- Lowercase the result.
- Replace any run of characters that are **not ASCII letters or digits** with a single hyphen.
- Strip leading and trailing hyphens.
- Empty input, or input with no ASCII letters/digits, returns `""`.

Examples:

```text
"Hello, World!" -> "hello-world"
"  A  B  "      -> "a-b"
"Café"          -> "caf"
"---"           -> ""
"A__B"          -> "a-b"
```

Only edit `solution.py`. Do not create test files that claim to be hidden tests.
