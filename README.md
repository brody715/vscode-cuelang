# vscode-cuelang README

Language Support for CUE

## Features

- Syntax Highlighting
- Formatting (based on `cue fmt`)
- Naive Lint (based on `cue vet`)
- Evaluation Preview (based on `cue eval`)

## Prerequisite

- Install CUE SDK, see https://cuelang.org/docs/install/

## Usage

To use VSCode command quickly, press `cmd + shift + p` to open `Command Palette`. Search the command name and then press enter.

### Format

Same as other formatters, for instance, use VSCode command `Format Document`.

### Lint

Use command `Cue: Lint Current File` to lint.

Or configure `{"cue.lintOnSave": "file"}` to lint automatically when file saved (default on).

### Evaluation Preview

same as `cue eval -e xxx`

Use command `Cue: Evaluate ...`. It will open an preview panel to show the evaluation result.

You can input expressions, or select different output types that CUE supported.

## Configuration

```json
{
  "cue.lintOnSave": "file", // or "off"
  "cue.lintFlags": [] // e.g. ["-c"]
}
```

## Dev

See [DEV.md](./DEV.md)

## Credits

| Project                                                  | LICENSE    |
| -------------------------------------------------------- | ---------- |
| [shikijs/shiki](https://github.com/shikijs/shiki)        | MIT        |
| [golang/vscode-go](https://github.com/golang/vscode-go/) | MIT        |
| [cue-lang/cue](https://github.com/cue-lang/cue)          | Apache-2.0 |
