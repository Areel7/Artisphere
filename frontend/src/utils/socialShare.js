const safeEncode = (value) => encodeURIComponent(value || "");

export const buildShareLinks = ({ url, text }) => {
  const encodedUrl = safeEncode(url);
  const encodedText = safeEncode(text);
  const whatsappText = safeEncode(`${text || ""} ${url || ""}`.trim());

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${whatsappText}`,
  };
};

export const openShareWindow = (shareUrl) => {
  if (!shareUrl) return;
  window.open(shareUrl, "_blank", "noopener,noreferrer");
};

export const copyShareLink = async (url) => {
  if (!url) return false;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
};
