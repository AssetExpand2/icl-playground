import { useEffect, useCallback } from 'react';

const HASH_PARAM = 'code';

/**
 * Encode a string to a URL-safe base64 representation.
 * Uses TextEncoder → btoa for broad browser support.
 */
function encodeSource(source: string): string {
  const bytes = new TextEncoder().encode(source);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode a URL-safe base64 string back to source.
 */
function decodeSource(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Hook for shareable URL support.
 *
 * On mount, checks the URL hash for `#code=<base64>` and returns
 * the decoded source if found. Provides a `share()` function that
 * encodes the current source into the URL and copies it to clipboard.
 */
export function useShareableUrl(
  onLoadFromUrl: (source: string) => void,
) {
  // Check URL on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1); // remove '#'
    const params = new URLSearchParams(hash);
    const encoded = params.get(HASH_PARAM);
    if (encoded) {
      try {
        const source = decodeSource(encoded);
        if (source.trim()) {
          onLoadFromUrl(source);
        }
      } catch {
        // Invalid encoding — ignore
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Encode current source into URL hash and copy to clipboard. */
  const share = useCallback(async (source: string): Promise<boolean> => {
    const encoded = encodeSource(source);
    const url = `${window.location.origin}${window.location.pathname}#${HASH_PARAM}=${encoded}`;

    // Update URL without reload
    window.history.replaceState(null, '', url);

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }, []);

  return { share };
}
