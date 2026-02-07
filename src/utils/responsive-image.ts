export interface ImageInfo {
  postSlug: string;
  imageName: string;
  alt: string;
}

export function generateResponsiveImageHtml(img: ImageInfo, fallbackSlug: string): string {
  const resolvedSlug = img.postSlug || fallbackSlug;
  const srcset = [320, 480, 768, 1200]
    .map((size) => `/images/posts/${resolvedSlug}/${img.imageName}-${size}.webp ${size}w`)
    .join(', ');

  return `<img
    src="/images/posts/${resolvedSlug}/${img.imageName}-768.webp"
    srcset="${srcset}"
    sizes="(max-width: 768px) calc(100vw - 48px), 720px"
    alt="${img.alt}"
    loading="lazy"
    decoding="async"
    width="768"
    height="432"
    class="rounded-lg shadow-md w-full h-auto"
  />`;
}
