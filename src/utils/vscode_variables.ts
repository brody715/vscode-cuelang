/**
 * Forked from https://github.com/DominicVonk/vscode-variables to fix undefined issues
 */

import * as vscode from "vscode";
import process = require("process");
import path = require("path");

export function vscodeVariables(string: string, recursive = false) {
  let workspaces = vscode.workspace.workspaceFolders || [];
  let workspace = workspaces.length ? workspaces[0] : null;

  if (workspace) {
    string = string.replace(
      /\${workspaceFolder}/g,
      workspace?.uri.fsPath || ""
    );
    string = string.replace(
      /\${workspaceFolderBasename}/g,
      workspace?.name || ""
    );
  }

  let activeFile = vscode.window.activeTextEditor?.document;
  if (activeFile) {
    let absoluteFilePath = activeFile?.uri.fsPath;
    string = string.replace(/\${file}/g, absoluteFilePath);
    let activeWorkspace = workspace;
    let relativeFilePath = absoluteFilePath;
    for (let workspace of workspaces) {
      if (
        absoluteFilePath.replace(workspace.uri.fsPath, "") !== absoluteFilePath
      ) {
        activeWorkspace = workspace;
        relativeFilePath = absoluteFilePath
          .replace(workspace.uri.fsPath, "")
          .substr(path.sep.length);
        break;
      }
    }
    let parsedPath = path.parse(absoluteFilePath);
    string = string.replace(
      /\${fileWorkspaceFolder}/g,
      activeWorkspace?.uri.fsPath || ""
    );
    string = string.replace(/\${relativeFile}/g, relativeFilePath);
    string = string.replace(
      /\${relativeFileDirname}/g,
      relativeFilePath.substr(0, relativeFilePath.lastIndexOf(path.sep))
    );
    string = string.replace(/\${fileBasename}/g, parsedPath.base);
    string = string.replace(/\${fileBasenameNoExtension}/g, parsedPath.name);
    string = string.replace(/\${fileExtname}/g, parsedPath.ext);
    string = string.replace(
      /\${fileDirname}/g,
      parsedPath.dir.substr(parsedPath.dir.lastIndexOf(path.sep) + 1)
    );
    string = string.replace(/\${cwd}/g, parsedPath.dir);
  }

  const activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    string = string.replace(
      /\${lineNumber}/g,
      (activeTextEditor.selection.start.line + 1).toString()
    );
    string = string.replace(
      /\${selectedText}/g,
      activeTextEditor.document.getText(
        new vscode.Range(
          activeTextEditor.selection.start,
          activeTextEditor.selection.end
        )
      )
    );
  }

  string = string.replace(/\${pathSeparator}/g, path.sep);
  string = string.replace(/\${env:(.*?)}/g, function (variable) {
    const envName = variable.match(/\${env:(.*?)}/)?.[1];
    return (envName && process.env[envName]) || "";
  });

  string = string.replace(/\${config:(.*?)}/g, function (variable) {
    const configName = variable.match(/\${config:(.*?)}/)?.[1];
    return (
      (configName && vscode.workspace.getConfiguration().get(configName, "")) ||
      ""
    );
  });

  if (
    recursive &&
    string.match(
      /\${(workspaceFolder|workspaceFolderBasename|fileWorkspaceFolder|relativeFile|fileBasename|fileBasenameNoExtension|fileExtname|fileDirname|cwd|pathSeparator|lineNumber|selectedText|env:(.*?)|config:(.*?))}/
    )
  ) {
    string = vscodeVariables(string, recursive);
  }
  return string;
}
