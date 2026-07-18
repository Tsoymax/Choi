export type ChatAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

export type ChatMessageContent = {
  text: string;
  attachments: ChatAttachment[];
};

const ATTACHMENT_MESSAGE_PREFIX = "__CHOI_ATTACHMENT_MESSAGE__";

export function serializeMessageContent(
  text: string,
  attachments: ChatAttachment[] = []
) {
  const trimmedText = text.trim();

  if (attachments.length === 0) {
    return trimmedText;
  }

  return `${ATTACHMENT_MESSAGE_PREFIX}${JSON.stringify({
    text: trimmedText,
    attachments
  })}`;
}

export function parseMessageContent(rawText: string): ChatMessageContent {
  if (!rawText.startsWith(ATTACHMENT_MESSAGE_PREFIX)) {
    return {
      text: rawText,
      attachments: []
    };
  }

  try {
    const parsed = JSON.parse(rawText.slice(ATTACHMENT_MESSAGE_PREFIX.length)) as Partial<ChatMessageContent>;
    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      attachments: Array.isArray(parsed.attachments) ? parsed.attachments : []
    };
  } catch {
    return {
      text: rawText,
      attachments: []
    };
  }
}

export function getMessagePreview(rawText?: string) {
  if (!rawText) {
    return "Диалог создан";
  }

  const content = parseMessageContent(rawText);
  if (content.text) {
    return content.text;
  }

  if (content.attachments.length === 1) {
    return `Файл: ${content.attachments[0].name}`;
  }

  if (content.attachments.length > 1) {
    return `Файлы: ${content.attachments.length}`;
  }

  return "";
}

export function isImageAttachment(attachment: ChatAttachment) {
  return attachment.type.startsWith("image/");
}

export function formatAttachmentSize(size: number) {
  if (size < 1024) {
    return `${size} Б`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} КБ`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} МБ`;
}
