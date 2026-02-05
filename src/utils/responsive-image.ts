export interface ImageInfo {
  postSlug: string;
  imageName: string;
  alt: string;
}

export function generateResponsiveImageHtml(
  img: ImageInfo,
  fallbackSlug: string
): string {
  const resolvedSlug = img.postSlug || fallbackSlug;
  const srcset = [400, 800, 1200]
    .map(
      (size) =>
        `/images/posts/${resolvedSlug}/${img.imageName}-${size}.webp ${size}w`
    )
    .join(', ');

  return `<img
    src="/images/posts/${resolvedSlug}/${img.imageName}-800.webp"
    srcset="${srcset}"
    sizes="(max-width: 768px) 90vw, 800px"
    alt="${img.alt}"
    loading="lazy"
    decoding="async"
    width="800"
    height="450"
    class="rounded-lg shadow-md w-full h-auto"
  />`;
}
