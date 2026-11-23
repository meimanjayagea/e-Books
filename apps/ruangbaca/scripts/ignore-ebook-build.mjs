import { spawnSync } from "node:child_process";

const { VERCEL_GIT_PREVIOUS_SHA: previous, VERCEL_GIT_COMMIT_SHA: current } = process.env;
const isSha = (value) => /^[a-f0-9]{40}$/.test(value ?? "");

// Build if Vercel has no previous deployment to compare or the Git comparison fails.
if (!isSha(previous) || !isSha(current) || previous === current) process.exit(1);
const result = spawnSync("git", ["diff", "--quiet", previous, current, "--", "."], { stdio: "inherit" });
process.exit(result.status === 0 ? 0 : 1);
