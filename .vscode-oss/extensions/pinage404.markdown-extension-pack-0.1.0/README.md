# Markdown VS Code Extension Pack

Collection of extensions to improve writing document using Markdown

## Features

### Edition

-   WYSIWYG editor
-   Generate and auto update Table Of Contents (TOC)
-   Paths autocompletion
-   Link update
-   Intelligent pasting
-   Table formatting

### Almost standard Markdown features

-   Task list
-   Footnotes
-   Display Front Matter in the preview
-   Front Matter editor

### Metadata

-   Linting
-   Display linked documents graph
-   Display orphan documents (files without links to them)
-   Display links pointing to a non-existent document
-   Display backlinks
-   Display reading time

### Additionnal features

-   One-click script execution
-   Keyboard shortcuts
-   Better highlight of code snippets
-   and more

## Recommended settings

To display links pointing to a non-existent document, add this to your settings :

```json
{
	"foam.decorations.links.enable": true
}
```

By default, the Table Of Contents (TOC) generated by [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) includes the main title, to avoid that, add this to your settings :

```json
{
	"markdown.extension.toc.levels": "2..6"
}
```

## Want to see more extension added?

Open a [MR][merge-request-url] or an [issue][issue-url] and i will to take a look

[merge-request-url]: https://gitlab.com/pinage404/pinage404-vscode-extension-packs/-/merge_requests
[issue-url]: https://gitlab.com/pinage404/pinage404-vscode-extension-packs/-/issues