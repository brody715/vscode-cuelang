// Some codes are derived from https://github.com/golang/vscode-go/blob/master/src/config.ts

import * as vscode from "vscode";
import hasbin = require("hasbin");
import cp = require("child_process");
import fs = require("fs");
import path = require("path");
import os = require("os");

export function getCueConfig(uri?: vscode.Uri): vscode.WorkspaceConfiguration {
  return getConfig("cue", uri);
}

export function getConfig(
  section: string,
  uri?: vscode.Uri | null
): vscode.WorkspaceConfiguration {
  if (!uri) {
    if (vscode.window.activeTextEditor) {
      uri = vscode.window.activeTextEditor.document.uri;
    } else {
      uri = null;
    }
  }
  return vscode.workspace.getConfiguration(section, uri);
}

export function hasBinCue(): Promise<boolean> {
  return new Promise((resolve) => {
    hasbin("cue", (res) => resolve(res));
  });
}

export function isVisibleDocument(document: vscode.TextDocument) {
  return vscode.window.visibleTextEditors.some(
    (e) => e.document.fileName === document.fileName
  );
}

export function promptNoCue() {
  vscode.window.showInformationMessage(
    `CUE is not installed. Please make sure 'cue' is in your PATH. Check [https://cuelang.org/docs/install/](https://cuelang.org/docs/install/) to install CUE.`
  );
}

export function runCue(
  args: string[],
  options?: cp.SpawnOptionsWithoutStdio
): Promise<{
  stdout: string;
  stderr: string;
  code: number;
}> {
  return new Promise((resolve, reject) => {
    let child = cp.spawn("cue", args, options);

    const output = {
      stdout: "",
      stderr: "",
      code: 0,
    };

    child.stdout.on("data", (data) => {
      output.stdout += data;
    });
    child.stderr.on("data", (data) => {
      output.stderr += data;
    });
    child.on("error", (err) => {
      if (err && (err as any).code === "ENOENT") {
        promptNoCue();
        reject(err);
      }
    });
    child.on("close", (code) => {
      output.code = code || 0;
      resolve(output);
    });
  });
}

let tmpDir: string | undefined;

// makeTempDir make temp dir under vscode-cue temp dir
export function makeTempDir(prefix?: string): {
  path: string;
  // dispose clean temp file
  dispose: () => void;
} {
  if (!tmpDir) {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vscode-cue-"));
  }

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  // create temp file in /tmp/vscode-cue-<random>/<random>/<name>
  const dirPath = fs.mkdtempSync(tmpDir + path.sep + (prefix || ""));

  return {
    path: dirPath,
    dispose: () => {
      fs.rmSync(dirPath, {recursive: true, force: true});
    },
  };
}

export function cleanupTempDir() {
  if (tmpDir) {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, {recursive: true});
    }
  }
  tmpDir = undefined;
}
