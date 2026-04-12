# pullminder

npm wrapper for the [Pullminder CLI](https://github.com/pullminder/cli).

## Install

```sh
# Run without installing:
npx pullminder registry validate --strict

# Install globally:
npm install -g pullminder

# As a dev dependency:
npm install -D pullminder
```

## Usage

```sh
pullminder registry init
pullminder registry validate --strict
pullminder registry pack add --slug my-rules --kind detection --name "My Rules"
pullminder version
```

## How it works

This package downloads the correct pre-built binary for your platform on install. No compilation required.

## Supported platforms

| Platform | Architecture |
|----------|-------------|
| Linux | x64, arm64 |
| macOS | x64 (Intel), arm64 (Apple Silicon) |
| Windows | x64 |

## License

MIT
