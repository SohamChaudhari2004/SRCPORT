#!/bin/bash
# Renders every scene in scenes/ to renders/<slug>.mp4 one at a time (low-memory machine).
cd "$(dirname "$0")"
mkdir -p renders
# Then: copy renders/<slug>.mp4 (remuxed with -movflags +faststart) and a 5.8s webp poster to ../../public/assets/solutions/.
for f in scenes/*.html; do
  s=$(basename "$f" .html)
  [ -s "renders/$s.mp4" ] && continue
  cp "$f" index.html
  npx hyperframes render . --skill=motion-graphics --crf 28 -w 2 --quiet -o "renders/$s.mp4" > "renders/$s.log" 2>&1 && echo "done $s" || echo "FAIL $s"
done
cp index.blank.bak index.html
echo ALL_DONE
