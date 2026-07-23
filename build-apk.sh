#!/usr/bin/env bash
# =============================================================
#  build-apk.sh — منظم الموظف · APK Builder
#  يُشغَّل على جهازك الشخصي (ليس داخل السيرفر)
#
#  المتطلبات:
#   1. Node.js >= 18  (https://nodejs.org)
#   2. pnpm           (npm i -g pnpm)
#   3. Java JDK 17+   (https://adoptium.net)
#   4. Android SDK    (عبر Android Studio أو command-line tools)
#      - ANDROID_HOME مُعيَّن ← مثال: /Users/name/Library/Android/sdk
#      - build-tools;34.0.0 مُثبَّت (sdkmanager "build-tools;34.0.0")
#      - platform-tools مُثبَّت
# =============================================================

set -e
CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   منظم الموظف — APK Builder v1.0.0      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Check Java ───────────────────────────────────────────────
if ! command -v java &>/dev/null; then
  echo -e "${RED}✗ Java غير موجود. حمّل JDK 17: https://adoptium.net${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Java: $(java -version 2>&1 | head -1)${NC}"

# ── Check ANDROID_HOME ───────────────────────────────────────
if [ -z "$ANDROID_HOME" ]; then
  # Try common locations
  for loc in "$HOME/Library/Android/sdk" "$HOME/Android/Sdk" "/opt/android-sdk"; do
    [ -d "$loc" ] && export ANDROID_HOME="$loc" && break
  done
fi
if [ -z "$ANDROID_HOME" ]; then
  echo -e "${RED}✗ ANDROID_HOME غير مُعيَّن."
  echo "  1. ثبّت Android Studio: https://developer.android.com/studio"
  echo "  2. أضف: export ANDROID_HOME=~/Library/Android/sdk  (Mac)"
  echo "          export ANDROID_HOME=~/Android/Sdk           (Linux)"
  echo "          set ANDROID_HOME=C:\Users\NAME\AppData\Local\Android\Sdk (Windows)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ ANDROID_HOME: $ANDROID_HOME${NC}"

# ── Install JS dependencies ───────────────────────────────────
echo -e "\n${CYAN}▶ تثبيت الحزم...${NC}"
pnpm install --frozen-lockfile

# ── Sync Capacitor ────────────────────────────────────────────
echo -e "\n${CYAN}▶ مزامنة Capacitor...${NC}"
npx cap sync android

# ── Build Debug APK ──────────────────────────────────────────
echo -e "\n${CYAN}▶ بناء APK (debug)...${NC}"
cd android

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  CMD="./gradlew.bat"
else
  chmod +x gradlew
  CMD="./gradlew"
fi

$CMD assembleDebug --no-daemon --stacktrace

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
  SIZE=$(du -sh "$APK_PATH" | cut -f1)
  echo -e "\n${GREEN}╔════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ APK جاهز للتثبيت!                      ║${NC}"
  echo -e "${GREEN}║                                              ║${NC}"
  echo -e "${GREEN}║  المسار: android/$APK_PATH${NC}"
  echo -e "${GREEN}║  الحجم:  $SIZE                               ${NC}"
  echo -e "${GREEN}║                                              ║${NC}"
  echo -e "${GREEN}║  للتثبيت عبر USB:                           ║${NC}"
  echo -e "${GREEN}║  adb install $APK_PATH   ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
  # Copy to project root for easy access
  cd ..
  cp "android/$APK_PATH" "منظم-الموظف-v1.0.apk"
  echo -e "${GREEN}  نسخة في جذر المشروع: منظم-الموظف-v1.0.apk${NC}"
else
  echo -e "${RED}✗ فشل البناء. راجع الأخطاء أعلاه.${NC}"
  exit 1
fi
