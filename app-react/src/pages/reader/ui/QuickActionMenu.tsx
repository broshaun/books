import { useState, Children, isValidElement, cloneElement, useRef } from 'react';
import type { ReactNode, ReactElement, MouseEventHandler } from 'react';
import { Affix, ActionIcon, Stack, Transition } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';

export interface QuickActionMenuProps {
  children?: ReactNode;
  position?: { bottom?: number; right?: number; top?: number; left?: number };
}

export function QuickActionMenu({
  children,
  position = { bottom: 20, right: 35 },
}: QuickActionMenuProps) {
  const [opened, setOpened] = useState(false);
  const [pos, setPos] = useState({ bottom: position.bottom ?? 20, right: position.right ?? 35 });

  const hasMovedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, bottom: 0, right: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    hasMovedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY, bottom: pos.bottom, right: pos.right };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startRef.current.x;
      const dy = moveEvent.clientY - startRef.current.y;

      if (!hasMovedRef.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        hasMovedRef.current = true;
      }

      if (hasMovedRef.current) {
        setPos({
          bottom: startRef.current.bottom - dy,
          right: startRef.current.right - dx,
        });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <Affix position={pos} zIndex={100}>
      <Stack align="center" gap="sm" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '100%', marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Transition transition="slide-up" duration={200} mounted={opened}>
            {(styles) => (
              <Stack
                style={{
                  ...styles,
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(12px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
                  borderRadius: 24,
                }}
                p={6}
                gap="xs"
                align="center"
                onClick={() => setOpened(false)}
              >
                {Children.map(children, (child) => {
                  if (!isValidElement(child)) return null;
                  const element = child as ReactElement<{ onClick?: MouseEventHandler }>;
                  return cloneElement(element, {
                    onClick: (e) => {
                      element.props.onClick?.(e);
                      setOpened(false);
                    },
                  });
                })}
              </Stack>
            )}
          </Transition>
        </div>

        <ActionIcon
          variant="gradient"
          size={36}
          radius="xl"
          aria-label="功能菜单"
          gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
          onPointerDown={handlePointerDown}
          onClick={() => !hasMovedRef.current && setOpened((o) => !o)}
          style={{
            cursor: 'grab',
            transform: opened ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            userSelect: 'none',
          }}
        >
          {opened ? <IconX size={20} /> : <IconPlus size={20} />}
        </ActionIcon>
      </Stack>
    </Affix>
  );
}

export default QuickActionMenu;