// frontend/src/components/Editor/RichTextEditor.jsx

import React, { useState } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Link,
  Eye,
  Type
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const RichTextEditor = ({ content, onChange, placeholder = "Write in Markdown..." }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const insertText = (before, after = '') => {
    const textarea = document.getElementById('markdown-editor');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);

    const newText = text.substring(0, start) + before + selection + after + text.substring(end);
    onChange(newText);

    // Restore selection and focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      action: () => insertText('**', '**'),
      title: 'Bold',
      showInPreview: false
    },
    {
      icon: Italic,
      action: () => insertText('*', '*'),
      title: 'Italic',
      showInPreview: false
    },
    {
      icon: List,
      action: () => insertText('- '),
      title: 'Bullet List',
      showInPreview: false
    },
    {
      icon: ListOrdered,
      action: () => insertText('1. '),
      title: 'Numbered List',
      showInPreview: false
    },
    {
      icon: Quote,
      action: () => insertText('> '),
      title: 'Quote',
      showInPreview: false
    },
    {
      icon: Code,
      action: () => insertText('```\n', '\n```'),
      title: 'Code Block',
      showInPreview: false
    },
    {
      icon: Link,
      action: () => insertText('[', '](url)'),
      title: 'Link',
      showInPreview: false
    },
    { type: 'separator', showInPreview: false },
    {
      icon: Eye,
      action: () => setIsPreviewMode(!isPreviewMode),
      isActive: isPreviewMode,
      title: isPreviewMode ? 'Edit Mode' : 'Preview Mode',
      showInPreview: true
    }
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return !isPreviewMode ? <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" /> : null;
          }

          if (isPreviewMode && !button.showInPreview) return null;

          const Icon = button.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={button.action}
              className={`p-2 rounded transition-colors ${button.isActive
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              title={button.title}
            >
              <Icon size={18} />
              {button.isActive && <span className="ml-2 text-xs font-medium">Preview On</span>}
            </button>
          );
        })}
      </div>

      {/* Editor / Preview Area */}
      <div className="min-h-[300px]">
        {isPreviewMode ? (
          <div className="p-4 prose prose-sm dark:prose-invert max-w-none overflow-y-auto max-h-[500px] bg-white dark:bg-gray-700">
            {content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={dracula}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <div className="text-gray-400 italic">Nothing to preview</div>
            )}
          </div>
        ) : (
          <textarea
            id="markdown-editor"
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full min-h-[300px] p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-none focus:outline-none resize-y font-mono text-sm"
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <span>Markdown supported</span>
        <span>{content.length} characters</span>
      </div>
    </div>
  );
};

export default RichTextEditor;