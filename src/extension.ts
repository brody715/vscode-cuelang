// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {createRegisterCommand} from "./commands";
import {createCommandCueEval} from "./cueEval";
import {CueDocumentFormattingEditProvider} from "./cueFmt";
import {createCommandCueLint, cueLint} from "./cueLint";
import * as util from "./util";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  let diagnosticCollection = vscode.languages.createDiagnosticCollection("cue");
  context.subscriptions.push(diagnosticCollection);

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      "cue",
      new CueDocumentFormattingEditProvider()
    )
  );

  // Lint
  const registerCommand = createRegisterCommand(context);
  registerCommand("cue.lint.file", createCommandCueLint(diagnosticCollection));

  // == related lint on save ==
  const lintOnSave = async (document: vscode.TextDocument) => {
    if (document.languageId === "cue") {
      const cueConfig = util.getCueConfig(document.uri);
      const lintOnSave = cueConfig.get("lintOnSave");
      const lintFlags: string[] = cueConfig.get("lintFlags") || [];

      if (lintOnSave && lintOnSave !== "off") {
        cueLint(document, diagnosticCollection, lintFlags);
      }
    }
  };
  // when first open and save file
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(lintOnSave),
    vscode.workspace.onDidSaveTextDocument(lintOnSave)
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(async (document) => {
      if (document.languageId === "cue") {
        diagnosticCollection.delete(document.uri);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      // if change lintOnSave, remove all diagnostic
      if (
        ["cue.lintOnSave", "cue.lintFlags"].some((s) =>
          e.affectsConfiguration(s)
        )
      ) {
        diagnosticCollection.clear();
      }
    })
  );
  // == end lint on save ==

  // == Start Evaluation ==
  registerCommand(
    "cue.eval.file.cue",
    createCommandCueEval({
      useExpression: false,
      outType: "cue",
    })
  );

  registerCommand(
    "cue.eval.file.expression.cue",
    createCommandCueEval({
      useExpression: true,
      outType: "cue",
    })
  );

  registerCommand(
    "cue.eval.file",
    createCommandCueEval({
      useExpression: false,
      outType: "select",
    })
  );

  registerCommand(
    "cue.eval.file.expression",
    createCommandCueEval({
      useExpression: true,
      outType: "select",
    })
  );
  // == End Evaluation ==
}

// this method is called when your extension is deactivated
export function deactivate() {
  util.cleanupTempDir();
}
