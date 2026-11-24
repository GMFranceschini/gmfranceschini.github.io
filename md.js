/* md.js — minimal Markdown renderer, no dependencies.
   Supports: headings, paragraphs, bold/italic/inline code, links, images,
   fenced code blocks, blockquotes, unordered/ordered lists, horizontal rules.
   Input is escaped first, so raw HTML in posts is shown as text, not executed. */
(function () {
  'use strict';

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function safeUrl(url) {
    const trimmed = url.trim();
    if (/^(https?:|mailto:|#|\.|\/)/i.test(trimmed)) return trimmed;
    return '#';
  }

  function inline(text) {
    let out = text;

    // Inline code first: protect its contents from other rules.
    const codeSlots = [];
    out = out.replace(/`([^`]+)`/g, function (_, code) {
      codeSlots.push('<code>' + code + '</code>');
      return '\u0000' + (codeSlots.length - 1) + '\u0000';
    });

    // Images, then links.
    out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, url) {
      return '<img src="' + safeUrl(url) + '" alt="' + alt + '" />';
    });
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, label, url) {
      const href = safeUrl(url);
      const external = /^https?:/i.test(href);
      return (
        '<a href="' + href + '"' +
        (external ? ' target="_blank" rel="noopener noreferrer"' : '') +
        '>' + label + '</a>'
      );
    });

    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    out = out.replace(/_([^_\n]+)_/g, '<em>$1</em>');

    out = out.replace(/\u0000(\d+)\u0000/g, function (_, i) {
      return codeSlots[Number(i)];
    });

    return out;
  }

  function render(markdown) {
    const lines = escapeHtml(String(markdown).replace(/\r\n?/g, '\n')).split('\n');
    const html = [];
    let i = 0;
    let listType = null;

    function closeList() {
      if (listType) {
        html.push('</' + listType + '>');
        listType = null;
      }
    }

    while (i < lines.length) {
      const line = lines[i];

      // Fenced code block
      const fence = line.match(/^```\s*([\w-]*)\s*$/);
      if (fence) {
        closeList();
        const lang = fence[1];
        const body = [];
        i += 1;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) {
          body.push(lines[i]);
          i += 1;
        }
        i += 1;
        html.push(
          '<pre' + (lang ? ' data-lang="' + lang + '"' : '') + '><code>' +
          body.join('\n') + '</code></pre>'
        );
        continue;
      }

      if (/^\s*$/.test(line)) {
        closeList();
        i += 1;
        continue;
      }

      if (/^(---+|\*\*\*+)\s*$/.test(line)) {
        closeList();
        html.push('<hr />');
        i += 1;
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        closeList();
        const level = heading[1].length;
        html.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
        i += 1;
        continue;
      }

      if (/^&gt;\s?/.test(line)) {
        closeList();
        const quote = [];
        while (i < lines.length && /^&gt;\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^&gt;\s?/, ''));
          i += 1;
        }
        html.push('<blockquote>' + inline(quote.join(' ')) + '</blockquote>');
        continue;
      }

      const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
      const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (bullet || numbered) {
        const wanted = bullet ? 'ul' : 'ol';
        if (listType !== wanted) {
          closeList();
          html.push('<' + wanted + '>');
          listType = wanted;
        }
        const parts = [(bullet || numbered)[1]];
        i += 1;
        // Lazy continuation: wrapped lines belong to the item above.
        while (
          i < lines.length &&
          !/^\s*$/.test(lines[i]) &&
          !/^(#{1,6}\s|```|&gt;\s?|---+\s*$|\*\*\*+\s*$)/.test(lines[i]) &&
          !/^\s*([-*+]|\d+[.)])\s+/.test(lines[i])
        ) {
          parts.push(lines[i].trim());
          i += 1;
        }
        html.push('<li>' + inline(parts.join(' ')) + '</li>');
        continue;
      }

      // Paragraph: gather until a blank line or a block-level starter.
      closeList();
      const para = [];
      while (
        i < lines.length &&
        !/^\s*$/.test(lines[i]) &&
        !/^(#{1,6}\s|```|&gt;\s?|---+\s*$|\*\*\*+\s*$)/.test(lines[i]) &&
        !/^\s*([-*+]|\d+[.)])\s+/.test(lines[i])
      ) {
        para.push(lines[i]);
        i += 1;
      }
      html.push('<p>' + inline(para.join(' ')) + '</p>');
    }

    closeList();
    return html.join('\n');
  }

  window.renderMarkdown = render;
}());
