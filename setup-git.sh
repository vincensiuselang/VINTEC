#!/bin/bash
# Bikin VINTEC-main jadi git repo beneran, tanpa ngilangin file yang udah dikerjain.
# Caranya: clone repo TANPA checkout (biar file lu gak ketimpa), terus pindahin
# folder .git-nya ke VINTEC-main. Hasilnya semua perubahan lu langsung kebaca git.
#
# Jalanin dari mana aja:  bash ~/Downloads/setup-git.sh

set -e

PROJECT="$HOME/Downloads/VINTEC-main"
TMP="$HOME/Downloads/.vintec-git-tmp"
REPO="https://github.com/vincensiuselang/VINTEC.git"

if [ ! -d "$PROJECT" ]; then
  echo "❌ Folder $PROJECT gak ketemu."
  exit 1
fi

if [ -d "$PROJECT/.git" ]; then
  echo "✅ $PROJECT udah jadi git repo. Gak perlu setup lagi."
else
  echo "→ Clone repo (tanpa checkout, file lu aman)..."
  rm -rf "$TMP"
  git clone --no-checkout "$REPO" "$TMP"

  echo "→ Pasang .git ke VINTEC-main..."
  mv "$TMP/.git" "$PROJECT/.git"
  rm -rf "$TMP"

  cd "$PROJECT"
  git reset            # samain index sama HEAD, file kerja gak disentuh
  echo "✅ VINTEC-main sekarang git repo beneran."
fi

cd "$PROJECT"

# dist/ ada di .gitignore tapi masih ke-track dari commit lama — lepasin.
if git ls-files --error-unmatch dist > /dev/null 2>&1; then
  echo "→ Lepas dist/ dari tracking (udah ada di .gitignore)..."
  git rm -r --cached dist --quiet
fi

# folder sampah, jangan ikut ke-commit
if [ -d "_to_delete" ]; then
  echo "→ Hapus folder _to_delete..."
  rm -rf _to_delete
fi

# .DS_Store bawaan macOS — jangan sampai ke-commit
if ! grep -q "^.DS_Store$" .gitignore 2>/dev/null; then
  echo "→ Tambah .DS_Store ke .gitignore..."
  printf '\n.DS_Store\n' >> .gitignore
fi
find . -name ".DS_Store" -not -path "./node_modules/*" -delete 2>/dev/null || true

echo ""
echo "════════════════════════════════════════"
echo "  Status sekarang:"
echo "════════════════════════════════════════"
git status --short

echo ""
echo "Kalau daftar di atas udah bener, lanjut:"
echo ""
echo "  cd ~/Downloads/VINTEC-main"
echo "  npm install && npm run dev     # tes dulu di localhost:3000"
echo "  git add -A"
echo "  git commit -m \"redesign: single page command palette, hero, 4 links, visitor counter global\""
echo "  git push"
echo ""
