import React from "react";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
  content,
  className = "",
}) => {
  return (
    <>
      <style jsx global>{`
        .rich-text-display h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
          color: #111827;
          line-height: 1.2;
        }

        .rich-text-display h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.25rem;
          color: #111827;
          line-height: 1.3;
        }

        .rich-text-display h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
          color: #111827;
          line-height: 1.4;
        }

        .rich-text-display h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 0.75rem;
          color: #111827;
          line-height: 1.4;
        }

        .rich-text-display p {
          margin-bottom: 1rem;
          color: #374151;
          line-height: 1.75;
          font-size: 1rem;
        }

        .rich-text-display p:last-child {
          margin-bottom: 0;
        }

        .rich-text-display strong {
          font-weight: 700;
          color: #111827;
        }

        .rich-text-display em {
          font-style: italic;
          color: #1f2937;
        }

        .rich-text-display u {
          text-decoration: underline;
        }

        .rich-text-display s {
          text-decoration: line-through;
        }

        .rich-text-display ul {
          list-style-type: disc;
          margin-bottom: 1rem;
          margin-left: 1.5rem;
          padding-left: 0;
        }

        .rich-text-display ol {
          list-style-type: decimal;
          margin-bottom: 1rem;
          margin-left: 1.5rem;
          padding-left: 0;
        }

        .rich-text-display li {
          margin-bottom: 0.5rem;
          color: #374151;
          line-height: 1.625;
        }

        .rich-text-display li:last-child {
          margin-bottom: 0;
        }

        .rich-text-display ul ul,
        .rich-text-display ol ol,
        .rich-text-display ul ol,
        .rich-text-display ol ul {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .rich-text-display blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          background-color: #f8fafc;
          margin: 1.5rem 0;
          font-style: italic;
          color: #475569;
          border-radius: 0 0.375rem 0.375rem 0;
        }

        .rich-text-display blockquote p {
          margin: 0;
        }

        .rich-text-display a {
          color: #2563eb;
          text-decoration: underline;
          transition: color 0.2s ease-in-out;
        }

        .rich-text-display a:hover {
          color: #1d4ed8;
          text-decoration-thickness: 2px;
        }

        .rich-text-display img {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          display: block;
        }

        .rich-text-display code {
          background-color: #f1f5f9;
          color: #e11d48;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
        }

        .rich-text-display pre {
          background-color: #1e293b;
          color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .rich-text-display pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }

        .rich-text-display table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .rich-text-display th {
          background-color: #f9fafb;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }

        .rich-text-display td {
          padding: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
        }

        .rich-text-display tr:last-child td {
          border-bottom: none;
        }

        .rich-text-display hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }

        /* Color styles for text */
        .rich-text-display .ql-color-red {
          color: #dc2626;
        }
        .rich-text-display .ql-color-orange {
          color: #ea580c;
        }
        .rich-text-display .ql-color-yellow {
          color: #d97706;
        }
        .rich-text-display .ql-color-green {
          color: #16a34a;
        }
        .rich-text-display .ql-color-blue {
          color: #2563eb;
        }
        .rich-text-display .ql-color-purple {
          color: #9333ea;
        }

        /* Background color styles */
        .rich-text-display .ql-bg-red {
          background-color: #fef2f2;
        }
        .rich-text-display .ql-bg-orange {
          background-color: #fff7ed;
        }
        .rich-text-display .ql-bg-yellow {
          background-color: #fefce8;
        }
        .rich-text-display .ql-bg-green {
          background-color: #f0fdf4;
        }
        .rich-text-display .ql-bg-blue {
          background-color: #eff6ff;
        }
        .rich-text-display .ql-bg-purple {
          background-color: #faf5ff;
        }

        /* Text alignment */
        .rich-text-display .ql-align-center {
          text-align: center;
        }

        .rich-text-display .ql-align-right {
          text-align: right;
        }

        .rich-text-display .ql-align-justify {
          text-align: justify;
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .rich-text-display h1 {
            font-size: 1.5rem;
          }

          .rich-text-display h2 {
            font-size: 1.25rem;
          }

          .rich-text-display h3 {
            font-size: 1.125rem;
          }

          .rich-text-display ul,
          .rich-text-display ol {
            margin-left: 1rem;
          }

          .rich-text-display blockquote {
            margin: 1rem 0;
            padding-left: 0.75rem;
          }

          .rich-text-display table {
            font-size: 0.875rem;
          }

          .rich-text-display th,
          .rich-text-display td {
            padding: 0.5rem;
          }
        }
      `}</style>

      <div
        className={`rich-text-display ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
};

export default RichTextDisplay;
