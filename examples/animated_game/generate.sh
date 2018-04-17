#! /bin/bash

set -e

gulp concat-node

# set working directory to this directory
cd "$(dirname "$0")"

if [ -d "epub-book" ]; then
  rm -R epub-book
fi

if [ -d "diagrams" ]; then
  rm -R diagrams
fi

if [ -f "epub-book.yaml" ]; then
  rm epub-book.yaml
fi


# echo " ** Generating yaml ** "
node ../../cmd/gpub.js init-spec --init-type=COMMENTARY_EBOOK --max-diagram-distance=1 --ignore-render-labels --output=epub-book.yaml

echo " ** Processing yaml ** "
node ../../cmd/gpub.js process --input=epub-book.yaml

echo " ** Generating diagrams ** "
node ../../cmd/gpub.js render-diagrams --input=epub-book-processed.yaml

echo " ** Converting to PNG ** "
INKS=/Applications/Inkscape.app/Contents/Resources/bin/inkscape
# brew install imagemagick --with-librsvg
if [ -f $INKS ]; then
  svgfiles=$(find . -type f -name '*.svg')
  for f in $svgfiles; do
    svg=diagrams/$(basename $f)
    png=diagrams/$(basename $f .svg).png
    # Doesn't do a good job with fonts. =(
    # convert $PWD/$svg $PWD/$png
    $INKS -z -e $PWD/$png -w 300 $PWD/$svg
  done
fi

echo " ** Animating ** "
convert -loop 0 -delay 30 diagrams/*.png game.gif

exit

# echo " ** Zipping ebook ** "
# ./zip.sh

# echo " ** Validating ebook ** "
#


