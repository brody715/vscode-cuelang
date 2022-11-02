import * as fs from 'fs';
import * as path from 'path';
import * as vscode from "vscode";
import { CommandFactory } from "./commands";
import { isCueNotFoundError } from "./error";
import * as utils from "./utils";

// Handler for command `cue.lint.*`
export function createCommandCueLint(
  diagnosticCollection: vscode.DiagnosticCollection
): CommandFactory {
  return (ctx) => async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(
        "No active editor, open a cue file first"
      );
      return;
    }
    if (editor.document.languageId !== "cue") {
      vscode.window.showInformationMessage("Active editor is not a cue file");
      return;
    }

    const document = editor.document;
    const lintFlags: string[] =
      utils.getCueConfig(document.uri).get("lintFlags") || [];
    await cueLint(document, diagnosticCollection, lintFlags);
  };
}

export async function cueLint(
  document: vscode.TextDocument,
  diagCollection: vscode.DiagnosticCollection,
  lintFlags: string[]
) {
  try {
    const {stderr} = await utils.runCue(
      ["vet", ...readFiles(path.dirname(document.uri.fsPath)), ...lintFlags],
      {cwd: utils.getConfigModuleRoot()}
    );
    const diagnostics = handleDiagnosticMessages(vscode.workspace.asRelativePath(document.uri.fsPath), stderr);
    diagCollection.set(document.uri, diagnostics);
  } catch (e) {
    if (isCueNotFoundError(e)) {
      throw e;
    }
    vscode.window.showErrorMessage(
      `Failed to lint file, error: ${(e as Error).message}`
    );
  }
}

function readFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).filter(file => file.isFile()).map(file => `${dir}\\${file.name}`);
}

export function handleDiagnosticMessages(file: string, content: string): vscode.Diagnostic[] {
  // we also ignore empty lines
  const lines = content.split(/[\r?\n]+/);
  if (lines.length === 0) {
    return [];
  }

  // Valid Error Message is Like
  // expected operand, found 'EOF':
  //     ./examples/simple1.cue:7:3

  // <error-message>:
  //     <file-path>:<line-number>:<column-number>
  //     <file-path>:<line-number>:<column-number>
  //     ...
  const diagnostics: vscode.Diagnostic[] = [];

  let errorMsg = "";
  const re = /(^.+):(\d+):(\d+)$/;
  const isFile = (file: string, expected: string) => file.replace(/\\/g, "/").endsWith(expected);

  for (const line of lines) {
    // type: error location
    if (line.startsWith("  ")) {
      // '    <file-path>:<line-number>:<column-number>'
      const m = re.exec(line);
      if (m && isFile(m[1], file)) {
        const lineNo = parseInt(m[2]) - 1;
        const columnNo = parseInt(m[3]);
        const range = new vscode.Range(
          new vscode.Position(lineNo, columnNo),
          new vscode.Position(lineNo, columnNo)
        );
        diagnostics.push({
          message: errorMsg,
          range,
          severity: vscode.DiagnosticSeverity.Error,
        });
      }
      continue;
    }

    // type: error message
    const msg = line.trim();
    // not empty line
    if (msg.length !== 0) {
      // remove last colon `xxx:` -> `xxx`
      errorMsg = msg.substring(0, msg.length - 1);
    }
  }

  return diagnostics;
}
