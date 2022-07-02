import * as vscode from "vscode";
import * as util from "./util";

import cp = require("child_process");
import os = require("os");
import fsp = require("fs/promises");
import path = require("path");

export class CueDocumentFormattingEditProvider
  implements vscode.DocumentFormattingEditProvider
{
  provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    // Promise to thenable
    const fn = async (): Promise<vscode.TextEdit[]> => {
      if (!util.isVisibleDocument(document)) {
        return [];
      }

      const tmpDir = util.makeTempDir();
      try {
        const tmpFile = path.join(
          tmpDir.path,
          path.basename(document.fileName)
        );
        await fsp.writeFile(tmpFile, document.getText());

        // run cue fmt
        await util.runCue(["fmt", tmpFile]);

        // read the output file
        const output = await fsp.readFile(tmpFile, "utf8");
        const fileStart = new vscode.Position(0, 0);
        const fileEnd = document.lineAt(document.lineCount - 1).range.end;

        return [
          new vscode.TextEdit(new vscode.Range(fileStart, fileEnd), output),
        ];
      } finally {
        tmpDir.dispose();
      }
    };
    return fn();
  }
}
