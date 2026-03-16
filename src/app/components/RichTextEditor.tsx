'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Underline as UnderlineIcon, X, Check, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'

// ─── Link Tooltip (click on existing link) ───────────────────────────────────

interface LinkTooltipProps {
  href: string
  position: { top: number; left: number }
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

function LinkTooltip({ href, position, onEdit, onDelete, onClose }: LinkTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 100)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
  }, [onClose])

  const displayHref = href.length > 32 ? href.slice(0, 32) + '…' : href

  return (
    <div
      ref={tooltipRef}
      style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 60 }}
      className="flex items-center gap-1 bg-gray-900 text-white rounded-lg shadow-xl px-2 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
    >
      <ExternalLink size={11} className="text-gray-400 shrink-0" />
      <span className="text-gray-300 max-w-[140px] truncate">{displayHref}</span>
      <div className="w-px h-3 bg-gray-600 mx-0.5" />
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors font-medium"
      >
        <Pencil size={11} />
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-colors font-medium"
      >
        <Trash2 size={11} />
        Delete
      </button>
    </div>
  )
}

// ─── Link Insert/Edit Popup ───────────────────────────────────────────────────

interface LinkPopupProps {
  isOpen: boolean
  anchorRef: React.RefObject<HTMLButtonElement | null>
  initialText: string
  initialUrl: string
  onConfirm: (text: string, url: string) => void
  onRemove: () => void
  onClose: () => void
  hasExistingLink: boolean
}

function LinkPopup({ isOpen, anchorRef, initialText, initialUrl, onConfirm, onRemove, onClose, hasExistingLink }: LinkPopupProps) {
  const [text, setText] = useState(initialText)
  const [url, setUrl] = useState(initialUrl)
  const popupRef = useRef<HTMLDivElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setText(initialText)
      setUrl(initialUrl)
      setTimeout(() => urlInputRef.current?.focus(), 50)
    }
  }, [isOpen, initialText, initialUrl])

  useEffect(() => {
    if (!isOpen || isMobile || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPopupStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: Math.min(rect.left, window.innerWidth - 320),
    })
  }, [isOpen, isMobile, anchorRef])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose, anchorRef])

  const handleConfirm = () => {
    if (!url.trim()) return
    onConfirm(text, url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleConfirm() }
    if (e.key === 'Escape') onClose()
  }

  if (!isOpen) return null

  const inputClass =
    'w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all'

  const content = (
    <div ref={popupRef} onKeyDown={handleKeyDown} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">
          {hasExistingLink ? 'Edit Link' : 'Insert Link'}
        </span>
        <button type="button" onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Link Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Display text..."
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">URL</label>
        <input
          ref={urlInputRef}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        {hasExistingLink && (
          <button
            type="button"
            onClick={onRemove}
            className="flex-1 px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
          >
            Remove link
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!url.trim()}
          className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check size={13} />
          {hasExistingLink ? 'Update' : 'Insert'}
        </button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl p-5 pb-8 animate-in slide-in-from-bottom duration-200">
          {content}
        </div>
      </>
    )
  }

  return (
    <div
      style={{ ...popupStyle, zIndex: 50, width: 300 }}
      className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-150"
    >
      {content}
    </div>
  )
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

function RichTextEditor({ value, onChange }: { value: string | undefined; onChange: (val: string) => void }) {
  const [linkPopupOpen, setLinkPopupOpen] = useState(false)
  const linkBtnRef = useRef<HTMLButtonElement>(null)

  const [tooltip, setTooltip] = useState<{
    href: string
    position: { top: number; left: number }
    editText: string
  } | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: value ?? '',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Sync external value changes (e.g. editing an existing post)
  const prevValue = useRef(value)
  useEffect(() => {
    if (!editor) return
    if (value !== prevValue.current && value !== editor.getHTML()) {
      editor.commands.setContent(value ?? '')
    }
    prevValue.current = value
  }, [value, editor])

  // Detect clicks on link elements inside the editor
  const handleEditorClick = useCallback((e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('a')
    if (!target) {
      setTooltip(null)
      return
    }
    const href = target.getAttribute('href') ?? ''
    const rect = target.getBoundingClientRect()
    setTooltip({
      href,
      position: {
        top: rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - 260),
      },
      editText: target.textContent ?? '',
    })
  }, [])

  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom
    dom.addEventListener('click', handleEditorClick)
    return () => dom.removeEventListener('click', handleEditorClick)
  }, [editor, handleEditorClick])

  // Insert link and immediately exit the link mark
  const handleLinkConfirm = (text: string, url: string) => {
    if (!editor) return
    const { empty, from } = editor.state.selection

    if (!empty) {
      // Has selection — just apply the link mark, don't touch the cursor
      editor.chain().focus().setLink({ href: url }).run()
    } else if (text) {
      // No selection — insert text, select it, apply link, then place cursor after
      editor.commands.focus()

      // Step 1: insert the text
      editor.commands.insertContent(text)
      const insertEnd = editor.state.selection.to

      // Step 2: select the inserted text
      editor.commands.setTextSelection({ from, to: insertEnd })

      // Step 3: apply the link mark to that selection
      editor.commands.setLink({ href: url })

      // Step 4: move cursor to just after the link (collapse to end)
      editor.commands.setTextSelection(insertEnd)
    }

    setLinkPopupOpen(false)
    setTooltip(null)
  }

  const handleLinkRemove = () => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkPopupOpen(false)
    setTooltip(null)
  }

  // Opens the full edit popup from the tooltip
  const handleTooltipEdit = () => {
    if (!editor || !tooltip) return
    // Place cursor inside the link so isActive('link') returns true
    editor.chain().focus().extendMarkRange('link').run()
    setTooltip(null)
    setLinkPopupOpen(true)
  }

  const handleTooltipDelete = () => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    setTooltip(null)
  }

  if (!editor) return null

  const hasExistingLink = editor.isActive('link')
  const { empty } = editor.state.selection
  const selectedText = empty
    ? ''
    : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, '')
  const existingUrl = hasExistingLink ? (editor.getAttributes('link').href ?? '') : ''

  const btnClass = (active: boolean) =>
    `p-1.5 rounded-lg transition-colors ${active
      ? 'bg-gray-900 text-white'
      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
    }`

  return (
    <div className="rounded-xl overflow-visible border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-gray-300 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-white rounded-t-xl">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
          <Bold size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
          <Italic size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline">
          <UnderlineIcon size={15} />
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet list">
          <List size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Numbered list">
          <ListOrdered size={15} />
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button
          ref={linkBtnRef}
          type="button"
          onClick={() => { setTooltip(null); setLinkPopupOpen((prev) => !prev) }}
          className={btnClass(hasExistingLink || linkPopupOpen)}
          title="Insert link"
        >
          <LinkIcon size={15} />
        </button>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="px-4 py-3 min-h-40 text-gray-900 text-sm [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-40 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:cursor-pointer [&_.ProseMirror_p]:mb-1 [&_.ProseMirror_p:last-child]:mb-0"
      />

      {/* Inline tooltip on existing links */}
      {tooltip && (
        <LinkTooltip
          href={tooltip.href}
          position={tooltip.position}
          onEdit={handleTooltipEdit}
          onDelete={handleTooltipDelete}
          onClose={() => setTooltip(null)}
        />
      )}

      {/* Insert / edit popup */}
      <LinkPopup
        isOpen={linkPopupOpen}
        anchorRef={linkBtnRef}
        initialText={tooltip ? tooltip.editText : selectedText}
        initialUrl={tooltip ? tooltip.href : existingUrl}
        onConfirm={handleLinkConfirm}
        onRemove={handleLinkRemove}
        onClose={() => setLinkPopupOpen(false)}
        hasExistingLink={hasExistingLink || !!tooltip}
      />
    </div>
  )
}

export default RichTextEditor
