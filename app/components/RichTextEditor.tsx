'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showPreview?: boolean;
  height?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Commencez à rédiger...',
  showPreview = true,
  height = '300px'
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none',
        style: `min-height: ${height}; padding: 1rem;`,
      },
    },
  });

  // Initialiser l'éditeur avec la valeur fournie
  useEffect(() => {
    if (editor && editor.isEmpty && value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ne rien rendre côté serveur
  if (!isMounted) {
    return null;
  }

  const ToolbarButton = ({ 
    icon: Icon, 
    onClick, 
    isActive = false 
  }: { 
    icon: any; 
    onClick: () => void; 
    isActive?: boolean 
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-200' : ''}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div>
      <div className="mb-4 border border-gray-300 rounded-md overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-300 p-1 flex gap-1">
          <ToolbarButton
            icon={Bold}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold') || false}
          />
          <ToolbarButton
            icon={Italic}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic') || false}
          />
          <ToolbarButton
            icon={Heading1}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor?.isActive('heading', { level: 1 }) || false}
          />
          <ToolbarButton
            icon={Heading2}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor?.isActive('heading', { level: 2 }) || false}
          />
          <div className="mx-1 border-r border-gray-300"></div>
          <ToolbarButton
            icon={List}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            isActive={editor?.isActive('bulletList') || false}
          />
          <ToolbarButton
            icon={ListOrdered}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            isActive={editor?.isActive('orderedList') || false}
          />
          <div className="mx-1 border-r border-gray-300"></div>
          <ToolbarButton
            icon={Undo}
            onClick={() => editor?.chain().focus().undo().run()}
          />
          <ToolbarButton
            icon={Redo}
            onClick={() => editor?.chain().focus().redo().run()}
          />
        </div>
        
        <EditorContent 
          editor={editor} 
          className={`bg-white ${editor?.isEmpty ? 'relative' : ''}`}
        />
        
        {editor?.isEmpty && (
          <div className="absolute top-16 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
      
      {showPreview && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu</h4>
          <div 
            className="p-4 border border-gray-200 rounded-md prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || value }}
          />
        </div>
      )}
    </div>
  );
} 