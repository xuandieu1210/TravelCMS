import React, { Component } from 'react';

interface RichTextEditorBoundaryProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  language: 'vi' | 'en';
  children: React.ReactNode;
}

interface RichTextEditorBoundaryState {
  hasError: boolean;
}

export class RichTextEditorBoundary extends Component<RichTextEditorBoundaryProps, RichTextEditorBoundaryState> {
  state: RichTextEditorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RichTextEditorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Rich text editor failed to initialize', error);
  }

  render() {
    if (this.state.hasError) {
      const isVietnamese = this.props.language === 'vi';
      return (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">
            {isVietnamese
              ? 'Không thể mở trình soạn thảo định dạng. Bạn vẫn có thể sửa nội dung HTML bên dưới.'
              : 'The rich-text editor could not open. You can still edit the HTML content below.'}
          </p>
          <textarea
            aria-label={this.props.label}
            rows={10}
            value={this.props.value}
            onChange={(event) => this.props.onChange(event.target.value)}
            className="w-full rounded-lg border border-amber-200 bg-white p-3 font-mono text-xs leading-relaxed text-stone-800 outline-none focus:border-amber-500"
          />
        </div>
      );
    }

    return this.props.children;
  }
}