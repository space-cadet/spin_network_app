#!/bin/bash

# Function to show usage instructions
show_help() {
    echo "Usage: ./scripts/run.sh <script-name> [arguments]"
    echo ""
    echo "Available scripts:"
    echo "  index     - Generate component index"
    echo "  map       - Generate project map"
    echo "  convert   - Convert markdown to HTML (requires filepath argument)"
    echo ""
    echo "Examples:"
    echo "  ./scripts/run.sh index"
    echo "  ./scripts/run.sh map"
    echo "  ./scripts/run.sh convert docs/example.md"
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

# Parse command
case $1 in
    "index")
        NODE_OPTIONS='--loader ts-node/esm' node scripts/generate-component-index.ts
        ;;
    "map")
        NODE_OPTIONS='--loader ts-node/esm' node scripts/generate_project_map.ts
        ;;
    "convert")
        if [ -z "$2" ]; then
            echo "Error: convert requires a file path argument"
            echo "Example: ./scripts/run.sh convert docs/example.md"
            exit 1
        fi
        NODE_OPTIONS='--loader ts-node/esm' node scripts/convert-md-to-html.ts "$2"
        ;;
    "help")
        show_help
        ;;
    *)
        echo "Unknown script: $1"
        show_help
        exit 1
        ;;
esac