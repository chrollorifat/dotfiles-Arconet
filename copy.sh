#!/bin/env bash

echo "This script will copy the contents of the repository to your home directory."
echo "Your home directory will be overwritten."
# Copy the contents to the home directory
cp -r -v .* $HOME/

echo "Contents of the repository have been copied to the home directory."

