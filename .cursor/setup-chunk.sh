#!/usr/bin/env bash
# Install Chunk CLI and SSH identity for Cloud Agent sidecar validation.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_DIR="${HOME}/.local/bin"

mkdir -p "$BIN_DIR" "${HOME}/.ssh"
export PATH="$BIN_DIR:$PATH"

sha256_file() {
  if [ "$(uname -s)" = "Darwin" ]; then
    shasum -a 256 "$1" | awk '{ print $1 }'
  else
    sha256sum "$1" | awk '{ print $1 }'
  fi
}

install_chunk() {
  local os arch asset version url tmpdir

  os="$(uname -s)"
  arch="$(uname -m)"
  case "${os}/${arch}" in
    Linux/x86_64) asset="chunk-cli_Linux_x86_64.tar.gz" ;;
    Linux/aarch64 | Linux/arm64) asset="chunk-cli_Linux_arm64.tar.gz" ;;
    Darwin/arm64) asset="chunk-cli_Darwin_arm64.tar.gz" ;;
    Darwin/x86_64) asset="chunk-cli_Darwin_x86_64.tar.gz" ;;
    *)
      echo "unsupported platform: ${os}/${arch}" >&2
      return 1
      ;;
  esac

  version="${CHUNK_VERSION:-v0.7.167}"
  if [ -z "$version" ]; then
    echo "CHUNK_VERSION must be set to a pinned release tag (e.g. v0.7.138)" >&2
    return 1
  fi

  tmpdir="$(mktemp -d)"
  trap 'rm -rf "$tmpdir"' RETURN
  base_url="https://github.com/CircleCI-Public/chunk-cli/releases/download/${version}"
  url="${base_url}/${asset}"
  echo "Installing chunk ${version} (${asset})"
  curl -fsSL "${base_url}/checksums.txt" -o "${tmpdir}/checksums.txt"
  curl -fsSL "$url" -o "${tmpdir}/chunk.tar.gz"
  expected="$(awk -v asset="$asset" '$2 == asset { print $1; exit }' "${tmpdir}/checksums.txt")"
  if [ -z "$expected" ]; then
    echo "checksum for ${asset} not found in release checksums.txt" >&2
    return 1
  fi
  actual="$(sha256_file "${tmpdir}/chunk.tar.gz")"
  if [ "$actual" != "$expected" ]; then
    echo "checksum mismatch for ${asset}: expected ${expected}, got ${actual}" >&2
    return 1
  fi
  tar -xzf "${tmpdir}/chunk.tar.gz" -C "$tmpdir"
  install -m 0755 "${tmpdir}/chunk" "${BIN_DIR}/chunk"
}

desired_version="${CHUNK_VERSION:-v0.7.167}"
version_number="${desired_version#v}"

if command -v chunk >/dev/null 2>&1; then
  actual_version="$(chunk --version 2>/dev/null || true)"
  if [[ "$actual_version" == *"$version_number"* ]]; then
    echo "chunk already installed: $actual_version"
  else
    install_chunk
    echo "Installed: $(chunk --version)"
  fi
else
  install_chunk
  echo "Installed: $(chunk --version)"
fi

if [ ! -f "${HOME}/.ssh/chunk_ai" ]; then
  ssh-keygen -t ed25519 -f "${HOME}/.ssh/chunk_ai" -N "" -C "chunk-sidecar" >/dev/null
  chmod 600 "${HOME}/.ssh/chunk_ai"
  echo "Created SSH key: ~/.ssh/chunk_ai"
else
  chmod 600 "${HOME}/.ssh/chunk_ai" 2>/dev/null || true
  echo "SSH key ok: ~/.ssh/chunk_ai"
fi

marker="# chunk-cli"
if ! grep -q "$marker" "${HOME}/.bashrc" 2>/dev/null; then
  {
    echo ""
    echo "$marker"
    echo 'export PATH="$HOME/.local/bin:$PATH"'
  } >> "${HOME}/.bashrc"
fi

cd "$REPO_ROOT"

if [ -n "${CIRCLECI_TOKEN:-${CIRCLE_TOKEN:-}}" ]; then
  echo "CircleCI token: configured (from environment)"
else
  echo "Note: set CIRCLECI_TOKEN in Cloud Agent Secrets for sidecar validation" >&2
fi

echo "Chunk sidecar setup complete."
