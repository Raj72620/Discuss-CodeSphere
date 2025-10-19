// frontend/src/components/Editor/RichTextEditor.jsx

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Code,
  Undo,
  Redo
} from 'lucide-react';

const RichTextEditor = ({ content, onChange, placeholder = "Write your content..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toolbarButtons = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Bold'
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italic'
    },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Bullet List'
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Numbered List'
    },
    {
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Quote'
    },
    {
      icon: Code,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      title: 'Code Block'
    },
    { type: 'separator' },
    {
      icon: Undo,
      action: () => editor.chain().focus().undo().run(),
      title: 'Undo'
    },
    {
      icon: Redo,
      action: () => editor.chain().focus().redo().run(),
      title: 'Redo'
    }
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 dark:border-gray-600">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;
          }
          
          const Icon = button.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={button.action}
              className={`p-2 rounded transition-colors ${
                button.isActive 
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              title={button.title}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm dark:prose-invert max-w-none focus:outline-none"
        />
      </div>

      {/* Character Count */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
        {editor.getText().length} characters
      </div>
    </div>
  );
};

export default RichTextEditor;