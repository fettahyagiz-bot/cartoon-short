#!/usr/bin/env bash
# Colab kurulum: sistem libleri + Node 20 + git clone + npm paketleri
# Kullanım (Colab hücresi): !bash "$DRIVE/colab-setup.sh"
set -euo pipefail
REPO="${1:-https://github.com/fettahyagiz-bot/cartoon-short.git}"
echo "== apt (chrome deps) =="
apt-get update -qq 2>&1 | tail -1
apt-get install -y -qq libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2 libxss1 2>&1 | tail -1
echo "== node 20 =="
if ! node -v 2>/dev/null | grep -q "v20"; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs
fi
node -v; npm -v
echo "== git clone =="
mkdir -p /content/work
if [ ! -d /content/work/cartoon-short ]; then
  git clone --depth 1 "$REPO" /content/work/cartoon-short
else
  cd /content/work/cartoon-short && git pull --ff-only || true
fi
cd /content/work/cartoon-short
ls
echo "== npm paketleri (birkaç dk sürer) =="
npm ci --no-audit --no-fund 2>&1 | tail -2 || npm install --no-audit --no-fund 2>&1 | tail -2
echo "KURULUM TAMAM"
# NOT: Chrome Headless Shell ilk render'da otomatik iner (log'da "Downloading" görürsün).
