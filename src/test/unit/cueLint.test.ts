import assert = require("assert");
import {cueLint, handleDiagnosticMessages} from "../../cueLint";

import {Uri, workspace} from "vscode";
import * as vscode from "vscode";
import path = require("path");

suite("handleDiagnosticMessages Tests", () => {
  test("ignore single line", () => {
    const content =
      "some instances are incomplete; use the -c flag to show errors or suppress this message";
    const diagnostics = handleDiagnosticMessages(content);
    assert.equal(diagnostics.length, 0);
  });

  test("multi location", () => {
    const content =
      "expected operand, found 'EOF':\r\n" +
      "    ./examples/simple1.cue:7:3\n" +
      "    ./examples/simple1.cue:12:5";

    const diagnostics = handleDiagnosticMessages(content);
    assert.equal(diagnostics.length, 2);
    assert.equal(diagnostics[0].message, "expected operand, found 'EOF'");
    assert.equal(diagnostics[0].range.start.line, 6);
    assert.equal(diagnostics[0].range.start.character, 3);
    assert.equal(diagnostics[1].message, "expected operand, found 'EOF'");
    assert.equal(diagnostics[1].range.end.line, 11);
    assert.equal(diagnostics[1].range.end.character, 5);
  });
});

suite("cueLint Tests", () => {
  test("should not error on import", async () => {
    const fixtureDir = path.join(__dirname, "../testdata/module1");
    // TODO: add tests
  });
});
