// @effect-diagnostics nodeBuiltinImport:off - the test supplies a deterministic path implementation.
import * as NodePath from "node:path";
import { describe, expect, it } from "@effect/vitest";
import type * as Path from "effect/Path";

import { resolveWorktreePathTemplate } from "./worktreePathTemplate.ts";

const path = NodePath as unknown as Path.Path;

describe("resolveWorktreePathTemplate", () => {
  it("keeps the default layout when no template is configured", () => {
    expect(
      resolveWorktreePathTemplate(path, {
        template: null,
        cwd: "/workspace/app",
        worktreesDir: "/tmp/t3/worktrees",
        branch: "Feature/Login",
      }),
    ).toBe("/tmp/t3/worktrees/app/Feature-Login");
  });

  it("expands repo and sanitized branch variables", () => {
    expect(
      resolveWorktreePathTemplate(path, {
        template: "{{ repo }}/{{ branch | sanitize }}",
        cwd: "/workspace/app",
        worktreesDir: "/tmp/t3/worktrees",
        branch: "Feature/Login",
      }),
    ).toBe("/workspace/app/app/feature-login");
  });

  it("supports absolute and repository-relative layouts", () => {
    expect(
      resolveWorktreePathTemplate(path, {
        template: "{repoRoot}/.worktrees/{branch}",
        cwd: "/workspace/app",
        worktreesDir: "/tmp/t3/worktrees",
        branch: "feature/login",
      }),
    ).toBe("/workspace/app/.worktrees/feature-login");
    expect(
      resolveWorktreePathTemplate(path, {
        template: "/srv/worktrees/{repoName}/{branch}",
        cwd: "/workspace/app",
        worktreesDir: "/tmp/t3/worktrees",
        branch: "feature/login",
      }),
    ).toBe("/srv/worktrees/app/feature-login");
  });
});
