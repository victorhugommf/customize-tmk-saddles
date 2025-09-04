find . -type f -name '*.png' -exec sh -c ' 
  for file do
    echo "Processando: $file"

    folder=$(basename "$(dirname "$file")")
    base=$(basename "${file%.png}")
    output="$(dirname "$file")/${base}_web.webp"

    magick "$file" \
      -trim +repage \
      -thumbnail "1080x1080" \
      -bordercolor none -border 100x100 \
      -background transparent \
      -gravity center \
      -extent 1080x1080 \
      "$output"
  done
' sh {} +