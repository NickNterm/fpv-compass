import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders user-submitted markdown. No rehype-raw, so embedded HTML is escaped
// rather than rendered — this keeps user content XSS-safe by default.
export default function MarkdownBody({ children }: { children: string }) {
  return (
    <div className="prose-blog text-sm leading-relaxed text-gray-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-[var(--color-accent-400)] underline hover:text-[var(--color-accent-300)]"
            />
          ),
          h1: (props) => (
            <h1 {...props} className="mt-4 mb-2 text-xl font-bold text-white" />
          ),
          h2: (props) => (
            <h2 {...props} className="mt-4 mb-2 text-lg font-bold text-white" />
          ),
          h3: (props) => (
            <h3 {...props} className="mt-3 mb-1.5 text-base font-semibold text-white" />
          ),
          p: (props) => <p {...props} className="my-2" />,
          ul: (props) => (
            <ul {...props} className="my-2 list-disc space-y-1 pl-5" />
          ),
          ol: (props) => (
            <ol {...props} className="my-2 list-decimal space-y-1 pl-5" />
          ),
          blockquote: (props) => (
            <blockquote
              {...props}
              className="my-3 border-l-2 border-gray-700 pl-3 italic text-gray-400"
            />
          ),
          code: (props) => (
            <code
              {...props}
              className="rounded bg-[#0a0f1e] px-1.5 py-0.5 font-mono text-xs text-emerald-300"
            />
          ),
          pre: (props) => (
            <pre
              {...props}
              className="my-3 overflow-x-auto rounded-lg border border-gray-800 bg-[#0a0f1e] p-3 text-xs"
            />
          ),
          table: (props) => (
            <div className="my-3 overflow-x-auto">
              <table {...props} className="w-full border-collapse text-xs" />
            </div>
          ),
          th: (props) => (
            <th
              {...props}
              className="border border-gray-800 bg-[#0a0f1e] px-2 py-1 text-left font-semibold text-white"
            />
          ),
          td: (props) => (
            <td {...props} className="border border-gray-800 px-2 py-1" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
