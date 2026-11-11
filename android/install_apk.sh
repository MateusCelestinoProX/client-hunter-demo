#!/bin/bash
set -e

DEVICE="${1:-192.168.15.22:5555}"

echo "=== [1/4] Configurando ADB Reverse para Porta 3333 ==="
adb -s "$DEVICE" reverse tcp:3333 tcp:3333

echo "=== [2/4] Instalando dist/client-hunter.apk EXCLUSIVAMENTE no Usuário 0 ==="
adb -s "$DEVICE" install --user 0 -r dist/client-hunter.apk

echo "=== [3/4] Higienizando perfis secundários (User 10 e User 95) ==="
adb -s "$DEVICE" shell pm uninstall --user 10 com.mateuscelestino.clienthunter 2>/dev/null || true
adb -s "$DEVICE" shell pm uninstall --user 95 com.mateuscelestino.clienthunter 2>/dev/null || true

echo "=== [4/4] Iniciando Client Hunter no Usuário 0 ==="
adb -s "$DEVICE" shell am start --user 0 -n com.mateuscelestino.clienthunter/.MainActivity

echo "=== CONCLUÍDO! Client Hunter ativo no Android (Usuário 0) ==="
