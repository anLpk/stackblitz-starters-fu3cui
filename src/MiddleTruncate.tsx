import { useRef, useLayoutEffect, useState } from 'react';

export const measureText = (container: HTMLElement) => {
  const span = document.createElement('span');
  span.style.opacity = '0';
  span.style.position = 'absolute';
  span.style.top = '-1000px';
  span.style.left = '-1000px';
  span.style.whiteSpace = 'nowrap';
  span.style.pointerEvents = 'none';
  container.appendChild(span);

  return {
    measure: (text: string) => {
      span.innerText = text;
      return span.clientWidth;
    },
    destroy: () => {
      container.removeChild(span);
    },
  };
};

const getMiddleTruncatedString = (
  text: string,
  ellipsis: string,
  container: HTMLElement
): string => {
  if (!text) return text;

  const { measure: getTextWidth, destroy: destroyMeasure } =
    measureText(container);

  const textWidth = getTextWidth(text);
  const containerWidth = container.clientWidth;
  const initialOffset = Math.floor((containerWidth / textWidth) * text.length);

  if (textWidth <= containerWidth) {
    destroyMeasure();
    return text;
  }

  let offset = initialOffset;
  const attempts: Record<number, [number, string]> = {};
  const maxAttempts = 20;
  const buffer = 10;

  while (Object.values(attempts).length <= maxAttempts) {
    // If we have already tried this offset, stop
    if (attempts[offset]) break;

    // If we are at the beginning of the string, just return the ellipsis
    if (offset <= 1) {
      attempts[0] = [0, ellipsis];
      break;
    }

    const start = text
      .slice(0, Math.ceil((offset - ellipsis.length) / 2 - 1))
      .trimEnd();
    const end = text
      .slice(Math.floor((offset - ellipsis.length) / 2) - offset)
      .trimStart();
    const truncatedStr = start + ellipsis + end;
    const width = getTextWidth(truncatedStr);

    attempts[offset] = [width, truncatedStr];

    if (width >= containerWidth) {
      offset = offset - 2;
    } else {
      // If we are close to the container width, stop
      if (containerWidth - width < buffer) break;
      offset = offset + 2;
    }
  }

  // Remove the span element used for measuring text
  destroyMeasure();

  // Find the closest attempt that is smaller than the container width
  return (
    Object.values(attempts)
      .reverse()
      .find(([width]) => width < containerWidth)?.[1] ??
    Object.values(attempts)[0][1]
  );
};

type Props = {
  text: string;
} & React.CSSProperties;

export default function MiddleTruncate({ text, ...style }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [truncatedString, setTruncatedString] = useState(text);

  useLayoutEffect(() => {
    let cancellationToken = { cancelled: false };

    const container = containerRef.current;

    if (!container) return;

    const calculateTruncatedString = () => {
      if (cancellationToken) cancellationToken.cancelled = true;

      const requestCancellationToken = { cancelled: false };
      cancellationToken = requestCancellationToken;

      const truncated = getMiddleTruncatedString(text, '\u2026', container);

      if (requestCancellationToken.cancelled) return;

      setTruncatedString(truncated);
    };

    window.document.fonts?.ready?.then(calculateTruncatedString);

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(calculateTruncatedString);
    });

    observer.observe(container);

    return () => {
      cancellationToken.cancelled = true;
      observer.disconnect();
    };
  }, [text]);

  return (
    <div
      data-testid="middle-truncate-container"
      ref={containerRef}
      style={{
        overflow: 'hidden',
        textOverflow: 'clip',
        whiteSpace: 'nowrap',
        flexGrow: 1,
        ...style,
      }}
    >
      {text === truncatedString ? text : <div>{truncatedString}</div>}
    </div>
  );
}
