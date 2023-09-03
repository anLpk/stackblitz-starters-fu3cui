import { useRef, useLayoutEffect, useState } from 'react';

const getTextWidth = (text: string, container: HTMLElement = document.body) => {
  const span = document.createElement('span');
  span.style.opacity = '0';
  span.style.position = 'absolute';
  span.style.top = '-1000px';
  span.style.left = '-1000px';
  span.style.whiteSpace = 'nowrap';
  span.innerText = text;
  container.appendChild(span);
  const width = span.clientWidth;
  container.removeChild(span);
  return width;
};

const getEllipsisWidth = (container: HTMLElement) =>
  getTextWidth('\u2026', container);

const getMaxStringLength = (containerWidth: number, ellipsisWidth: number) => {
  return Math.floor((containerWidth - ellipsisWidth) / getTextWidth('W'));
};

const truncateString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) {
    return str;
  }

  const ellipsis = '\u2026';
  const startLength = Math.ceil((maxLength - ellipsis.length) / 2);
  const endLength = Math.floor((maxLength - ellipsis.length) / 2);

  const start = str.slice(0, startLength);
  const end = str.slice(str.length - endLength);

  return start + ellipsis + end;
};

export default function TruncatedFileName({ fileName }: { fileName: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [truncatedString, setTruncatedString] = useState(fileName);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const containerWidth = container.clientWidth;
      const ellipsisWidth = getEllipsisWidth(container);
      const maxStringLength = getMaxStringLength(containerWidth, ellipsisWidth);
      const truncated = truncateString(fileName, maxStringLength);
      setTruncatedString(truncated);
    });

    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName]);
  return (
    <div ref={containerRef}>
      {fileName === truncatedString ? fileName : <div>{truncatedString}</div>}
    </div>
  );
}
