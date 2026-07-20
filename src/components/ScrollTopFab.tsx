import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface Props {
  targetRef: RefObject<HTMLElement | null>;
  variant: 'sidebar' | 'workspace';
}

export default function ScrollTopFab({ targetRef, variant }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    const onScroll = () => setShow(el.scrollTop > 300);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [targetRef]);

  const scrollTop = () => targetRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const className = variant === 'sidebar' ? 'fab-top' : 'ws-fab-top';

  return (
    <button className={`${className}${show ? ' show' : ''}`} title="ขึ้นบนสุด" onClick={scrollTop}>
      ↑
    </button>
  );
}
