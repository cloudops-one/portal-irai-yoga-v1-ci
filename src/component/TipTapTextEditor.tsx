import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import ImageIcon from "@mui/icons-material/Image";
import TextStyle from "@tiptap/extension-text-style";
import FontSize from "tiptap-extension-font-size";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove"; // For the image toolbar icon

import { useEffect } from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  Undo,
  Redo,
  Code,
  FormatQuote,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  HorizontalRule,
} from "@mui/icons-material";

export const TiptapEditor = ({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Enter description here...",
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true, // Allow base64 images
        HTMLAttributes: {
          class: "editor-image", // Add a class for styling
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontSize,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onBlur: () => {
      onBlur();
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        "data-testid": "orgDescription",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }
  const handleImageUpload = (file: File) => {
    if (!editor) return;

    // Option 1: Insert as base64 (client-side only)
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);

    // Option 2: Upload to a server first (recommended for production)
    // const formData = new FormData();
    // formData.append('image', file);
    // axios.post('/api/upload', formData).then((res) => {
    //   editor.chain().focus().setImage({ src: res.data.url }).run();
    // });
  };

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: "4px",
        overflow: "hidden",
        minHeight: "250px",
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          borderBottom: "1px solid #eee",
          padding: "4px 8px",
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <ToggleButtonGroup size="small">
          <Tooltip title="Decrease Font Size">
            <ToggleButton
              value="decrease-font"
              onClick={() => {
                const currentSize = editor.getAttributes("textStyle").fontSize;
                let newSize = 12; // default size

                if (currentSize) {
                  const numericSize = parseInt(currentSize);
                  if (!isNaN(numericSize)) {
                    newSize = Math.max(8, numericSize - 2); // min size 8px
                  }
                }
                editor.chain().focus().setFontSize(`${newSize}px`).run();
              }}
            >
              <RemoveIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Increase Font Size">
            <ToggleButton
              value="increase-font"
              onClick={() => {
                const currentSize = editor.getAttributes("textStyle").fontSize;
                let newSize = 14; // default size

                if (currentSize) {
                  const numericSize = parseInt(currentSize);
                  if (!isNaN(numericSize)) {
                    newSize = Math.min(72, numericSize + 2); // max size 72px
                  }
                }
                editor.chain().focus().setFontSize(`${newSize}px`).run();
              }}
            >
              <AddIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
        <ToggleButtonGroup size="small" exclusive>
          <Tooltip title="Bold">
            <ToggleButton
              value="bold"
              selected={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <FormatBold fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Italic">
            <ToggleButton
              value="italic"
              selected={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <FormatItalic fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Underline">
            <ToggleButton
              value="underline"
              selected={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <FormatUnderlined fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Strikethrough">
            <ToggleButton
              value="strike"
              selected={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <FormatStrikethrough fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <ToggleButtonGroup size="small" exclusive>
          <Tooltip title="Bullet List">
            <ToggleButton
              value="bullet"
              selected={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <FormatListBulleted fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Numbered List">
            <ToggleButton
              value="ordered"
              selected={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <FormatListNumbered fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Blockquote">
            <ToggleButton
              value="blockquote"
              selected={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <FormatQuote fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Code Block">
            <ToggleButton
              value="code"
              selected={editor.isActive("codeBlock")}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Code fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Insert Image">
            <ToggleButton
              value="image"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    // Handle image insertion (see Step 2)
                    handleImageUpload(file);
                  }
                };
                input.click();
              }}
            >
              <ImageIcon fontSize="small" />{" "}
              {/* Make sure to import the Image icon from MUI */}
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Horizontal Rule">
            <ToggleButton
              value="hr"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <HorizontalRule fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <ToggleButtonGroup size="small" exclusive>
          <Tooltip title="Align Left">
            <ToggleButton
              value="left"
              selected={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <FormatAlignLeft fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Center">
            <ToggleButton
              value="center"
              selected={editor.isActive({ textAlign: "center" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <FormatAlignCenter fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Align Right">
            <ToggleButton
              value="right"
              selected={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <FormatAlignRight fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Justify">
            <ToggleButton
              value="justify"
              selected={editor.isActive({ textAlign: "justify" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
            >
              <FormatAlignJustify fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <ToggleButtonGroup size="small">
          <Tooltip title="Undo">
            <ToggleButton
              value="undo"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Redo">
            <ToggleButton
              value="redo"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>

      {/* Editor Content */}
      <Box
        sx={{
          padding: "8px",
          minHeight: "200px",
          maxHeight: "400px",
          overflowY: "auto",
          "& .tiptap": {
            minHeight: "180px",
            "&:focus": {
              outline: "none",
            },
            "& p.is-empty:first-child::before": {
              content: "attr(data-placeholder)",
              float: "left",
              color: "#adb5bd",
              pointerEvents: "none",
              height: 0,
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};
