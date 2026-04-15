# pullminder

npm wrapper for the [Pullminder CLI](https://github.com/pullminder/cli) — AI-powered PR analysis, risk scoring, and rule-pack enforcement for your codebase.

This package downloads the correct pre-built binary for your platform. No compilation required.

## Install

```sh
# Run instantly without installing
npx pullminder check

# Install globally
npm install -g pullminder

# Add as a dev dependency
npm install -D pullminder
```

## Quick start

```sh
# Initialize a project config
pullminder init

# Analyze your current branch locally (offline, zero config)
pullminder check

# Run in CI with auto-detection
pullminder ci

# Analyze a remote PR
pullminder diff https://github.com/org/repo/pull/42
```

## Commands

### Local analysis (works offline)

| Command | Description |
|---------|-------------|
| `check` | Run rule packs against local branch diff |
| `ci` | CI-optimized analysis with auto-detection (GitHub Actions, GitLab CI, CircleCI, Jenkins, Bitbucket) |
| `init` | Create `.pullminder.yml` project config |

### Remote analysis (requires GitHub token)

| Command | Description |
|---------|-------------|
| `diff <pr-url>` | Run rule packs against a remote GitHub PR |
| `score <pr-url>` | Fetch risk score from platform |
| `brief <pr-url>` | Fetch AI reviewer brief from platform |

### Rule packs and registry

| Command | Description |
|---------|-------------|
| `packs` | List, info, enable, disable rule packs |
| `rules` | Test and publish rule packs |
| `registry` | Manage custom rule registries (init, validate, pack add/list/remove, upgrade) |

### Configuration and auth

| Command | Description |
|---------|-------------|
| `auth` | Login, logout, status, switch-org |
| `config` | Show, set, export, import, diff |
| `hooks` | Install/uninstall git hooks for auto-analysis |
| `version` | Print version info |

### Global flags

| Flag | Description |
|------|-------------|
| `--agent` | Output structured JSON for AI coding agent consumption |

## Supported platforms

| Platform | Architecture |
|----------|-------------|
| Linux | x64, arm64 |
| macOS | x64 (Intel), arm64 (Apple Silicon) |
| Windows | x64 |

## Documentation

For full CLI reference, configuration options, and rule-pack authoring guides, see the [Pullminder CLI repo](https://github.com/pullminder/cli).

## Links

- [Pullminder](https://pullminder.com) — AI-powered PR review platform
- [CLI](https://github.com/pullminder/cli) — Full CLI reference and releases
- [Registry](https://github.com/pullminder/registry) — Official rule pack registry
- [GitHub Action](https://github.com/pullminder/action) — CI validation action
- [Homebrew Tap](https://github.com/pullminder/homebrew-tap) — macOS/Linux install via Homebrew

## License

Apache-2.0
