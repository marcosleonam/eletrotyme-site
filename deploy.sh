#!/bin/bash
# Atualiza https://eletrotyme.com.br com a ultima versao do repo no GitHub.
# O site mora na VPS da Tyme (179.199.154.69) desde out/2026. A pasta ig/ (feed do Instagram) e gravada la pelo
# timer eletrotyme-instagram desta VPS e NAO pode ser apagada pelo rsync.
# Uso: bash /root/sites/eletrotyme-site/deploy.sh
set -e
REPO=/root/sites/eletrotyme-site
HOST=root@179.199.154.69
WEB=/var/www/eletrotyme-site

cd "$REPO"
git pull --ff-only origin main
ssh "$HOST" "mkdir -p /root/backup-site && tar -czf /root/backup-site/eletrotyme-site-\$(date +%Y%m%d-%H%M).tgz -C /var/www eletrotyme-site"
rsync -a --delete --exclude '.git' --exclude 'deploy.sh' --exclude '/ig/' "$REPO/" "$HOST:$WEB/"
ssh "$HOST" "chown -R www-data:www-data $WEB"
echo "OK — $(date '+%d/%m/%Y %H:%M') — commit $(git rev-parse --short HEAD)"
