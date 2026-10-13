import React, { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { normalizePostContentForEditor } from '../../utils/postContent';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  language: 'vi' | 'en';
}

const extensions = [
  StarterKit.configure({ link: false }),
  Image.configure({ inline: false, allowBase64: false }),
  Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ label, value, onChange, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isVietnamese = language === 'vi';

  const editor = useEditor({
    extensions,
    content: normalizePostContentForEditor(value),
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    editorProps: {
      attributes: {
        class: 'tiptap rich-text-editor__content',
        'aria-label': label,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const normalizedValue = normalizePostContentForEditor(value);
    if (editor.getHTML() !== normalizedValue) {
      editor.commands.setContent(normalizedValue, { emitUpdate: false });
    }
  }, [editor, value]);

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      window.alert(isVietnamese ? 'Vui lòng chọn tệp hình ảnh.' : 'Please choose an image file.');
      return;
    }

    setIsUploading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Unable to read image'));
        reader.onerror = () => reject(reader.error || new Error('Unable to read image'));
        reader.readAsDataURL(file);
      });
      const imageUrl = await apiClient.uploadImage({
        filename: file.name,
        base64Data,
        folder: 'BLOG',
      });

      editor?.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
    } catch (error) {
      console.error('Article image upload failed', error);
      window.alert(isVietnamese ? 'Không thể tải ảnh lên, vui lòng thử lại.' : 'Could not upload the image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addLink = () => {
    if (!editor) return;
    const currentHref = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt(isVietnamese ? 'Nhập địa chỉ liên kết' : 'Enter link URL', currentHref || 'https://');
    if (href === null) return;

    if (!href.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
  };

  const toolbarButton = (
    labelText: string,
    isActive: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    disabled = false,
  ) => (
    <button
      key={labelText}
      type="button"
      title={labelText}
      aria-label={labelText}
      aria-pressed={isActive}
      disabled={disabled}
      onClick={onClick}
      className={`rich-text-editor__tool ${isActive ? 'is-active' : ''}`}
    >
      {icon}
    </button>
  );

  if (!editor) {
    return <div className="h-48 animate-pulse rounded-xl border border-stone-200 bg-stone-50" />;
  }

  return (
    <div className="rich-text-editor">
      <label className="mb-1.5 block text-xs font-bold text-stone-700">{label}</label>
      <div className="rich-text-editor__toolbar" role="toolbar" aria-label={label}>
        {toolbarButton(isVietnamese ? 'Đậm' : 'Bold', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <Bold className="h-4 w-4" />)}
        {toolbarButton(isVietnamese ? 'Nghiêng' : 'Italic', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <Italic className="h-4 w-4" />)}
        {toolbarButton(isVietnamese ? 'Gạch ngang' : 'Strikethrough', editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), <Strikethrough className="h-4 w-4" />)}
        <span className="rich-text-editor__separator" />
        {toolbarButton('Heading 2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 className="h-4 w-4" />)}
        {toolbarButton('Heading 3', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 className="h-4 w-4" />)}
        {toolbarButton(isVietnamese ? 'Danh sách chấm' : 'Bulleted list', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <List className="h-4 w-4" />)}
        {toolbarButton(isVietnamese ? 'Danh sách số' : 'Numbered list', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="h-4 w-4" />)}
        {toolbarButton(isVietnamese ? 'Trích dẫn' : 'Blockquote', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), <Quote className="h-4 w-4" />)}
        <span className="rich-text-editor__separator" />
        {toolbarButton(isVietnamese ? 'Chèn liên kết' : 'Insert link', editor.isActive('link'), addLink, <Link2 className="h-4 w-4" />)}
        <button
          type="button"
          title={isVietnamese ? 'Tải ảnh và chèn vào bài viết' : 'Upload and insert image'}
          aria-label={isVietnamese ? 'Chèn ảnh' : 'Insert image'}
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="rich-text-editor__tool"
        >
          {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </button>
        <span className="rich-text-editor__separator" />
        {toolbarButton(isVietnamese ? 'Hoàn tác' : 'Undo', false, () => editor.chain().focus().undo().run(), <Undo2 className="h-4 w-4" />, !editor.can().undo())}
        {toolbarButton(isVietnamese ? 'Làm lại' : 'Redo', false, () => editor.chain().focus().redo().run(), <Redo2 className="h-4 w-4" />, !editor.can().redo())}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadImage(file);
        }}
      />
      <EditorContent editor={editor} />
    </div>
  );
};