#!/bin/bash

cd ../optimize/01-raw
find . -type f -name '*.png' -exec sh -c '
  for file do
    echo "Processando: $file"

    # Nome base do arquivo (sem caminho e extensão)
    base=$(basename "${file%.png}")

    # Caminho de saída: ./web com sufixo "_web.jpg"
    output="../02-optimized/${base}_web.webp"

    # Chamada do ImageMagick
    magick "$file" \
      -trim +repage \
      -thumbnail "760x760" \
      -quality 64 \
      -gravity center \
      -background none \
      -extent 760x760 \
      -bordercolor none \
      -border 100 \
      -alpha set \
      "$output"
    done
' sh {} +

find . -type f -name '*.png' -exec sh -c '
  for file do
    echo "Processando: $file"

    # Nome base do arquivo (sem caminho e extensão)
    base=$(basename "${file%.png}")

    # Caminho de saída: ./web com sufixo "_web.jpg"
    output="./web/${base}.webp"

    # Chamada do ImageMagick
    magick "$file" \
      -trim +repage \
      -thumbnail "760x760" \
      -quality 64 \
      -gravity center \
      -background none \
      -extent 760x760 \
      -bordercolor none \
      -border 100 \
      -alpha set \
      "$output"
    done
' sh {} +