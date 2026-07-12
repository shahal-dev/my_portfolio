'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// The Strapi markdown editor inserts each image as its own paragraph
// (`![alt](url)`), one per line. On their own, consecutive image-only
// paragraphs would render as a stack of separate full-width images with no
// way to group them — this merges consecutive image-only paragraphs into a
// single paragraph so the `p` renderer below can turn 2+ images into a
// horizontally-scrollable carousel instead.
function remarkGroupConsecutiveImages() {
  return (tree: any) => {
    const isImageOnlyParagraph = (node: any) =>
      node?.type === 'paragraph' &&
      node.children.length > 0 &&
      node.children.every(
        (c: any) => c.type === 'image' || (c.type === 'text' && c.value.trim() === '')
      );

    const walk = (node: any) => {
      if (!node?.children) return;
      const newChildren: any[] = [];
      let i = 0;
      while (i < node.children.length) {
        const child = node.children[i];
        if (isImageOnlyParagraph(child)) {
          const images = child.children.filter((c: any) => c.type === 'image');
          let j = i + 1;
          while (j < node.children.length && isImageOnlyParagraph(node.children[j])) {
            images.push(...node.children[j].children.filter((c: any) => c.type === 'image'));
            j++;
          }
          newChildren.push({ type: 'paragraph', children: images });
          i = j;
        } else {
          walk(child);
          newChildren.push(child);
          i++;
        }
      }
      node.children = newChildren;
    };

    walk(tree);
  };
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  const { resolvedTheme } = useTheme();
  const codeStyle = resolvedTheme === 'light' ? oneLight : oneDark;

  return (
    <div className={`prose dark:prose-invert max-w-none ${className ?? ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkGroupConsecutiveImages]}
        components={{
          code(props) {
            const { children, className: codeClassName, ...rest } = props;
            const match = /language-(\w+)/.exec(codeClassName || '');
            return match ? (
              <SyntaxHighlighter
                {...(rest as any)}
                PreTag="div"
                language={match[1]}
                style={codeStyle}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={codeClassName}>
                {children}
              </code>
            );
          },
          p(props) {
            const { node, children } = props as any;
            const nodeChildren = node?.children ?? [];
            const nonWhitespace = nodeChildren.filter(
              (c: any) => !(c.type === 'text' && (c.value ?? '').trim() === '')
            );
            const images = nonWhitespace.filter((c: any) => c.type === 'element' && c.tagName === 'img');

            // Paragraph is only image(s), nothing else — render as a
            // centered image or, for 2+, a horizontal-scroll carousel.
            if (images.length > 0 && images.length === nonWhitespace.length) {
              if (images.length === 1) {
                const img = images[0];
                return (
                  <div className="not-prose my-6 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.properties?.src}
                      alt={img.properties?.alt || ''}
                      className="max-w-full rounded-xl"
                    />
                  </div>
                );
              }
              return (
                <div className="not-prose my-6 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {images.map((img: any, i: number) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={img.properties?.src}
                      alt={img.properties?.alt || ''}
                      className="h-72 w-auto flex-shrink-0 rounded-xl object-cover snap-center"
                    />
                  ))}
                </div>
              );
            }

            return <p>{children}</p>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
