import { ActionIcon } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useNavigate } from '@tanstack/react-router';


interface AppBarLeftProps {
  to: string;
  params?: Record<string, string | number>;
}

export function AppBarLeft({ to, params }: AppBarLeftProps) {
  const navigate = useNavigate();

  return (
    <ActionIcon variant="subtle" onClick={() => navigate({ to, params })}>
      <IconChevronLeft color="gray" />
    </ActionIcon>
  );
}