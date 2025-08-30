#!/bin/bash
# chromium-args-test.sh

ARGS_LIST=(
    "--no-sandbox"
    "--disable-setuid-sandbox"
    "--disable-dev-shm-usage"
    "--disable-gpu"
    "--no-first-run"
    "--no-zygote"
    "--disable-extensions"
    "--single-process"
)

echo "=== Chromium-Argumente-Test ==="
echo "Zeit: $(date)"
echo ""

for arg in "${ARGS_LIST[@]}"; do
    echo "Teste Argument: $arg"
    chromium --headless $arg --print-to-pdf=/tmp/arg-test.pdf about:blank 2>/dev/null
    if [ -f /tmp/arg-test.pdf ]; then
        echo "✅ $arg funktioniert"
        rm /tmp/arg-test.pdf
    else
        echo "❌ $arg fehlgeschlagen"
    fi
    echo ""
done

echo "=== Argumente-Test abgeschlossen ==="
