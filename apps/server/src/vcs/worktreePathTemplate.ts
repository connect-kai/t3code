import type * as Path from "effect/Path";

import { sanitizeBranchFragment } from "@t3tools/shared/git";

export const DEFAULT_WORKTREE_PATH_TEMPLATE = "{worktreesDir}/{repoName}/{branch}";

/** Expand T3's path variables. Relative templates resolve from the repository root. */
export function resolveWorktreePathTemplate(
  path: Path.Path,
  input: {
    readonly template: string | null | undefined;
    readonly cwd: string;
    readonly worktreesDir: string;
    readonly repoRoot?: string;
    readonly branch: string;
  },
): string {
  const configuredTemplate = input.template?.trim();
  const template = configuredTemplate || DEFAULT_WORKTREE_PATH_TEMPLATE;
  const repoRoot = path.resolve(input.repoRoot ?? input.cwd);
  const sanitizedBranch = sanitizeBranchFragment(input.branch).replaceAll("/", "-");
  const values = {
    worktreesDir: path.resolve(input.worktreesDir),
    repoRoot,
    repoName: path.basename(configuredTemplate ? repoRoot : input.cwd),
    branch: configuredTemplate ? sanitizedBranch : input.branch.replaceAll("/", "-"),
  } as const;
  const rendered = template
    .replaceAll("{{ repo }}", values.repoName)
    .replaceAll("{{repo}}", values.repoName)
    .replaceAll("{{ branch }}", configuredTemplate ? input.branch : values.branch)
    .replaceAll("{{branch}}", input.branch)
    .replaceAll("{{ branch | sanitize }}", sanitizedBranch)
    .replaceAll("{{branch | sanitize}}", sanitizedBranch)
    .replace(
      /\{(worktreesDir|repoRoot|repoName|branch)\}/g,
      (_, key: keyof typeof values) => values[key],
    );
  return path.resolve(repoRoot, rendered);
}
