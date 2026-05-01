'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function BlogBody({ content }: { content: string }) {
  return (
    <div className="prose-blog">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight leading-tight mt-8 mb-4 text-primary highlighter inline">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-epilogue font-black text-2xl uppercase tracking-tight leading-tight mt-7 mb-3 text-primary">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-epilogue font-bold text-xl uppercase tracking-tight mt-6 mb-2 text-primary">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="font-grotesk text-base text-on-surface leading-relaxed mb-4">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-epilogue font-black text-primary">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-on-surface/80">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-secondary-fixed pl-4 my-6 italic font-grotesk text-on-surface/70 sticky-note py-3 pr-3">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="font-grotesk text-base text-on-surface leading-relaxed mb-4 space-y-1 pl-6 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="font-grotesk text-base text-on-surface leading-relaxed mb-4 space-y-1 pl-6 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="relative before:content-['—'] before:absolute before:-left-5 before:text-secondary-fixed before:font-black">
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-epilogue font-bold underline decoration-2 decoration-secondary-fixed hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors px-0.5"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return (
                <pre className="bg-primary text-on-primary font-grotesk text-sm p-4 my-4 overflow-x-auto sketch-box">
                  <code>{children}</code>
                </pre>
              )
            }
            return (
              <code className="bg-secondary-fixed text-on-secondary-fixed font-grotesk text-sm px-1 py-0.5 sketch-box">
                {children}
              </code>
            )
          },
          hr: () => (
            <div className="my-8 flex items-center gap-3" aria-hidden>
              <div className="flex-1 border-t border-dashed border-primary/30" />
              <span className="font-epilogue font-black text-lg text-primary/30">✦</span>
              <div className="flex-1 border-t border-dashed border-primary/30" />
            </div>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt ?? ''}
              className="w-full border-2 border-primary my-6 sketch-box dither"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
