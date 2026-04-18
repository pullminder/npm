# @pullminder/cli

> npm wrapper for the Pullminder CLI — installs the correct binary for your platform.

[![npm](https://img.shields.io/npm/v/@pullminder/cli)](https://www.npmjs.com/package/@pullminder/cli)
[![License](https://img.shields.io/github/license/pullminder/npm)](LICENSE)

## Installation

```bash
npm install -g @pullminder/cli
# or
npx @pullminder/cli check
```

The Pullminder CLI runs on macOS, Linux, and Windows. Choose whichever installation method fits your workflow. All methods produce the same `pullminder` binary.

## Quick install (curl)

The install script detects your OS and architecture, downloads the correct binary, and places it on your `PATH`.

```bash
curl -fsSL https://get.pullminder.com | sh
```

On macOS and Linux this installs to `/usr/local/bin`. You can set a custom location with the `INSTALL_DIR` environment variable:

```bash
curl -fsSL https://get.pullminder.com | INSTALL_DIR=$HOME/.local/bin sh
```

## Homebrew (macOS and Linux)

```bash
brew install pullminder/tap/pullminder
```

Upgrade to the latest version at any time:

```bash
brew upgrade pullminder
```

## npm

If you already have Node.js installed, you can install the CLI as a global npm package:

```bash
npm install -g @pullminder/cli
```

Or run it without installing via `npx`:

```bash
npx @pullminder/cli check
```

This is especially useful in CI environments where you want to pin a version in `package.json` rather than manage a standalone binary.

## Manual binary download

Pre-built binaries are published on the [GitHub releases page](https://github.com/pullminder/cli/releases) for every supported platform.

| Platform             | Architecture  | Filename                            |
|----------------------|---------------|-------------------------------------|
| Linux                | x86_64        | `pullminder-linux-amd64`            |
| Linux                | ARM64         | `pullminder-linux-arm64`            |
| macOS                | Intel (x86_64)| `pullminder-darwin-amd64`           |
| macOS                | Apple Silicon  | `pullminder-darwin-arm64`           |
| Windows              | x86_64        | `pullminder-windows-amd64.exe`      |

After downloading, make the binary executable (macOS/Linux) and move it to a directory on your `PATH`:

```bash
chmod +x pullminder-darwin-arm64
sudo mv pullminder-darwin-arm64 /usr/local/bin/pullminder
```

On Windows, rename the file to `pullminder.exe` and add the containing folder to your system `PATH`.

## Verify the installation

Run the following command to confirm the CLI is installed and working:

```bash
pullminder --version
```

You should see output like:

```
pullminder v1.2.0 (abc1234)
```

## Shell completions

Generate completion scripts for your shell:

```bash
# Bash
pullminder completion bash > /etc/bash_completion.d/pullminder

# Zsh
pullminder completion zsh > "${fpath[1]}/_pullminder"

# Fish
pullminder completion fish > ~/.config/fish/completions/pullminder.fish

# PowerShell
pullminder completion powershell > pullminder.ps1
```

After generating the script, restart your shell or source the file to enable tab completions for all commands and flags.

## Next steps

- [Command reference](/cli/commands/) -- full list of every command and flag.
- [CI integration](/cli/ci-integration/) -- run Pullminder in GitHub Actions, GitLab CI, and other pipelines.

## Commands

This page documents every command, subcommand, and flag in the Pullminder CLI.

## Global flags

The following flag is available on every command:

| Flag | Description |
|------|-------------|
| `--agent` | Emit JSON output optimized for AI coding agents. When set, all commands produce machine-readable JSON instead of human-friendly text. |

---

## Local analysis

These commands run entirely offline. They do not require authentication or network access.

### `pullminder init`

Create a `.pullminder.yml` configuration file in the current directory. The file defines which rule packs are enabled and how they are configured.

See [Configuration reference](./config) for every field, default, and example.

```bash
pullminder init
```

Running `init` interactively walks you through pack selection and threshold configuration. To accept all defaults and skip prompts, pass `--yes`:

```bash
pullminder init --yes
```

**Flags**

| Flag | Description |
|------|-------------|
| `--yes` | Accept all defaults without prompting. |

---

### `pullminder check`

Run rule packs against the current branch diff and report findings. This is the primary command for local analysis.

```bash
# Analyze the diff between the current branch and main
pullminder check

# Analyze against a specific base branch
pullminder check --base develop

# Analyze a diff file instead of the Git working tree
pullminder check --diff changes.patch

# Analyze specific files only
pullminder check --files src/auth/login.go src/auth/session.go

# Fail the command on any finding (useful for pre-push hooks)
pullminder check --strict

# Output results as JSON
pullminder check --json

# Output results as SARIF
pullminder check --sarif
```

**Flags**

| Flag | Description |
|------|-------------|
| `--base <branch>` | Base branch or commit to diff against. Defaults to `main`. |
| `--diff <file>` | Path to a unified diff file to analyze instead of the Git working tree. |
| `--files <paths...>` | Analyze only the specified file paths. |
| `--strict` | Exit with a non-zero code if any findings are reported, regardless of severity. |
| `--json` | Output results as JSON. |
| `--sarif` | Output results as SARIF (Static Analysis Results Interchange Format). |

---

### `pullminder ci`

CI-optimized analysis. Behaves like `check` but automatically detects the CI environment and adjusts defaults accordingly. Supported CI systems:

- GitHub Actions
- GitLab CI
- CircleCI
- Jenkins
- Bitbucket Pipelines

In a detected CI environment, `pullminder ci` automatically resolves the base branch from the CI provider's environment variables. Outside of CI it falls back to the same behavior as `check`.

```bash
# Basic CI run
pullminder ci

# Output JUnit XML for test reporting
pullminder ci --junit

# Post inline annotations on GitHub Actions
pullminder ci --github-annotations

# Fail only on critical or high severity findings
pullminder ci --fail-on high

# Combine multiple output formats
pullminder ci --sarif --junit --github-annotations --fail-on critical
```

**Flags**

| Flag | Description |
|------|-------------|
| `--base <branch>` | Override the auto-detected base branch. |
| `--strict` | Exit with a non-zero code on any finding. |
| `--json` | Output results as JSON. |
| `--sarif` | Output results as SARIF. |
| `--junit` | Output results as JUnit XML. |
| `--github-annotations` | Emit `::warning` and `::error` annotations for GitHub Actions. Findings appear inline on the Files Changed tab. |
| `--fail-on <severity>` | Set the minimum severity that causes a non-zero exit code. Valid values: `critical`, `high`, `medium`, `low`. For example, `--fail-on high` fails the build on `high` or `critical` findings but allows `medium` and `low` to pass. |

---

## Platform commands

These commands interact with the Pullminder platform API. They require a `GITHUB_TOKEN` or `GH_TOKEN` environment variable (or an active `pullminder auth login` session).

### `pullminder diff <pr-url>`

Run rule packs against a remote pull request. The PR URL must be a full GitHub pull request URL.

```bash
pullminder diff https://github.com/acme/repo/pull/42

# Run only a specific pack
pullminder diff https://github.com/acme/repo/pull/42 --pack security

# Strict mode
pullminder diff https://github.com/acme/repo/pull/42 --strict

# SARIF output
pullminder diff https://github.com/acme/repo/pull/42 --sarif
```

**Flags**

| Flag | Description |
|------|-------------|
| `--pack <name>` | Run only the specified rule pack. |
| `--strict` | Exit with a non-zero code on any finding. |
| `--json` | Output results as JSON. |
| `--sarif` | Output results as SARIF. |

---

### `pullminder score <pr-url>`

Fetch the risk score for a pull request. Returns a number from 0 to 100.

```bash
pullminder score https://github.com/acme/repo/pull/42

# JSON output for scripting
pullminder score https://github.com/acme/repo/pull/42 --json
```

**Flags**

| Flag | Description |
|------|-------------|
| `--json` | Output the score as a JSON object. |

---

### `pullminder brief <pr-url>`

Fetch the AI reviewer brief for a pull request. The brief is the structured summary that Pullminder generates for reviewers.

```bash
pullminder brief https://github.com/acme/repo/pull/42

# Output as JSON
pullminder brief https://github.com/acme/repo/pull/42 --json

# Output as Markdown (useful for piping into other tools)
pullminder brief https://github.com/acme/repo/pull/42 --markdown
```

**Flags**

| Flag | Description |
|------|-------------|
| `--json` | Output the brief as a JSON object. |
| `--markdown` | Output the brief as Markdown. |

---

## Auth

Manage authentication with the Pullminder platform.

### `pullminder auth login`

Authenticate with the Pullminder platform. Opens a browser-based OAuth flow by default.

```bash
# Interactive login (opens browser)
pullminder auth login

# Token-based login (for CI or headless environments)
pullminder auth login --token $PULLMINDER_TOKEN

# Login to a self-hosted instance
pullminder auth login --api-host https://pullminder.internal.example.com
```

**Flags**

| Flag | Description |
|------|-------------|
| `--token <token>` | Authenticate with a personal access token instead of the browser flow. |
| `--api-host <url>` | Override the default API host for self-hosted or enterprise deployments. |

### `pullminder auth logout`

Log out and remove stored credentials.

```bash
pullminder auth logout
```

### `pullminder auth status`

Show the current authentication state, including the logged-in user and active organization.

```bash
pullminder auth status
```

### `pullminder auth switch-org`

Switch the active organization context.

```bash
pullminder auth switch-org --org acme-corp
```

**Flags**

| Flag | Description |
|------|-------------|
| `--org <name>` | The organization to switch to. |

---

## Config

View and manage Pullminder configuration.

### `pullminder config show`

Display the effective configuration for the current project or organization.

```bash
pullminder config show

# Show organization-level config (requires active org context)
pullminder config show --org

# Output as JSON
pullminder config show --json
```

**Flags**

| Flag | Description |
|------|-------------|
| `--org` | Show the organization-level platform configuration instead of local config. |
| `--json` | Output config as JSON. |

### `pullminder config set`

Set a configuration value.

```bash
pullminder config set threshold.risk 75
pullminder config set packs.security.enabled true
```

### `pullminder config export`

Export the current configuration to a file.

```bash
pullminder config export > pullminder-config.yml
```

### `pullminder config import`

Import configuration from a file.

```bash
pullminder config import pullminder-config.yml
```

### `pullminder config diff`

Show differences between local and remote configuration.

```bash
pullminder config diff

# Output diff as JSON
pullminder config diff --json
```

**Flags**

| Flag | Description |
|------|-------------|
| `--json` | Output the diff as JSON. |

---

## Packs

Manage rule packs.

### `pullminder packs list`

List all available rule packs.

```bash
pullminder packs list

# Show only enabled packs
pullminder packs list --enabled

# Output as JSON
pullminder packs list --json
```

**Flags**

| Flag | Description |
|------|-------------|
| `--enabled` | Show only packs that are currently enabled. |
| `--json` | Output the list as JSON. |

### `pullminder packs info`

Show detailed information about a specific pack.

```bash
pullminder packs info security

# Output as JSON
pullminder packs info security --json
```

**Flags**

| Flag | Description |
|------|-------------|
| `--json` | Output pack info as JSON. |

### `pullminder packs enable`

Enable a rule pack.

```bash
pullminder packs enable security
```

### `pullminder packs disable`

Disable a rule pack.

```bash
pullminder packs disable deprecated-api
```

---

## Rules

Author and publish custom rules.

### `pullminder rules test`

Run tests against rule definitions to verify they match the expected files and produce the expected findings.

```bash
pullminder rules test

# Test a specific pack
pullminder rules test --pack my-custom-pack

# Verbose output showing each test case
pullminder rules test --pack my-custom-pack --verbose

# Output as JSON
pullminder rules test --json
```

**Flags**

| Flag | Description |
|------|-------------|
| `--pack <name>` | Test only the specified pack. |
| `--verbose` | Print detailed output for each test case. |
| `--json` | Output test results as JSON. |

### `pullminder rules publish`

Publish a rule pack to the Pullminder registry.

```bash
pullminder rules publish --pack my-custom-pack

# Dry run to validate without publishing
pullminder rules publish --pack my-custom-pack --dry-run

# Publish with a specific GitHub token
pullminder rules publish --pack my-custom-pack --github-token $GITHUB_TOKEN

# Set the PR title and target branch
pullminder rules publish --pack my-custom-pack --title "Add SQL injection rules" --branch main
```

**Flags**

| Flag | Description |
|------|-------------|
| `--pack <name>` | The pack to publish. Required. |
| `--dry-run` | Validate the pack without creating a publish request. |
| `--github-token <token>` | GitHub token for authentication. Defaults to `GITHUB_TOKEN` env var. |
| `--title <text>` | Title for the publish pull request. |
| `--branch <name>` | Target branch in the registry repository. |

---

## Hooks

Manage Git hooks for automatic pre-push and pre-commit analysis.

### `pullminder hooks install`

Install a Git hook that runs Pullminder automatically.

```bash
# Install a pre-push hook
pullminder hooks install --hook pre-push

# Install a pre-commit hook
pullminder hooks install --hook pre-commit

# Overwrite an existing hook
pullminder hooks install --hook pre-push --force
```

**Flags**

| Flag | Description |
|------|-------------|
| `--hook <type>` | The hook to install. Valid values: `pre-push`, `pre-commit`. |
| `--force` | Overwrite an existing hook file if one exists. |

### `pullminder hooks uninstall`

Remove a previously installed Git hook.

```bash
pullminder hooks uninstall --hook pre-push
```

### `pullminder hooks status`

Show which hooks are currently installed.

```bash
pullminder hooks status
```

---

## Registry

Manage a custom rule pack registry.

### `pullminder registry init`

Initialize a new registry repository with the required directory structure and metadata files.

```bash
pullminder registry init
```

### `pullminder registry validate`

Validate the registry structure and all pack definitions.

```bash
pullminder registry validate

# Strict mode (treat warnings as errors)
pullminder registry validate --strict
```

**Flags**

| Flag | Description |
|------|-------------|
| `--strict` | Treat warnings as validation errors. |

### `pullminder registry upgrade check`

Check the registry for available schema upgrades without applying them.

```bash
pullminder registry upgrade check
pullminder registry upgrade check ./path/to/registry
```

### `pullminder registry upgrade apply`

Apply schema upgrades to the registry.

```bash
pullminder registry upgrade apply
pullminder registry upgrade apply ./path/to/registry
```

Both subcommands accept an optional directory argument. If omitted, the current directory is used.

### `pullminder registry pack add`

Add a new pack to the registry.

```bash
pullminder registry pack add my-new-pack
```

### `pullminder registry pack list`

List all packs in the registry.

```bash
pullminder registry pack list
```

### `pullminder registry pack remove`

Remove a pack from the registry.

```bash
pullminder registry pack remove deprecated-pack
```

---

## Utility

### `pullminder version`

Print the CLI version and exit.

```bash
pullminder version
```

---

## Exit codes

All commands use the following exit codes:

| Code | Meaning |
|------|---------|
| `0` | Success. No findings, or analysis completed without issues. |
| `1` | Findings were reported at or above the configured severity threshold, or a critical error occurred. |
| `2` | Warnings were reported, but no critical or high-severity findings. |

When using `--strict`, any finding of any severity causes exit code `1`. When using `--fail-on <severity>`, only findings at or above the specified severity cause exit code `1`.

## Documentation

Full documentation is available at [docs.pullminder.com](https://docs.pullminder.com/cli/installation/).

## Security

To report a vulnerability, please email **security@pullminder.com**. See [SECURITY.md](https://github.com/pullminder/.github/blob/main/SECURITY.md) for the full policy.

## License

[Apache-2.0](LICENSE)

---

_This README is auto-generated from the [pullminder.com monorepo](https://github.com/upmate/pullminder.com). Last synced: 2026-04-18._
