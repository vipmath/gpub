#! /bin/bash

set -e

gulp concat-node

# set working directory to this directory
cd "$(dirname "$0")"

if [ -d "epub-book" ]; then
  rm -R epub-book
fi

if [ -d "gen-diagrams" ]; then
  rm -R gen-diagrams
fi

if [ -f "epub-book.yaml" ]; then
  rm epub-book.yaml
fi


echo " ** Generating yaml ** "
node ../../cmd/gpub.js init-spec --init-type=PROBLEM_EBOOK --output=epub-book.yaml

echo " ** Processing yaml ** "
node ../../cmd/gpub.js process --input=epub-book.yaml --output=epub-book.yaml

echo " ** Generating diagrams ** "
node ../../cmd/gpub.js render-diagrams --input=epub-book.yaml

echo " Warning: Generating book not yet finished "
exit

# echo " ** Zipping ebook ** "
# ./zip.sh

# echo " ** Validating ebook ** "
# ./validate.sh
