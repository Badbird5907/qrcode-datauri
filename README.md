# QRCode DataURI generator

This CLI tool creates a datauri and qr code from an input html file.

# Usage:
```
Usage: qrcode-datauri --mode [mode] --input [file] --outdir [directory]

Options:
  -m, --mode     Compression mode
                             [required] [choices: "gzip", "urlencode", "base64"]
  -i, --input    Input HTML file path                        [string] [required]
  -o, --outdir   Output directory path                 [string] [default: "out"]
      --help     Show help                                             [boolean]

Missing required arguments: mode, input
```

Example:
`npx qrcode-datauri@latest -m gzip -i .\index.html -o out`
