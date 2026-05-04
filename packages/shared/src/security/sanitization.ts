export const sanitizeHtml = (html: string): string => {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;

  if (!div) {
    return html;
  }

  div.textContent = html;
  return div.innerHTML;
};

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }

    return parsed.toString();
  } catch {
    return '';
  }
};

export const sanitizeFilePath = (filePath: string): string => {
  return filePath
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '')
    .replace(/\x00/g, '');
};

export const sanitizeJsonString = (str: string): string => {
  return str.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[char] || char;
  });
};
