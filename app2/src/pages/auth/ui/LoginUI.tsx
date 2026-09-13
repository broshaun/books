import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconUser } from "@tabler/icons-react";

interface LoginSubmitData {
  account: string;
  password: string;
}

interface LoginUIProps {
  avatarUrl?: string | null;
  defaultAccount?: string;
  loading?: boolean;
  disabled?: boolean;
  onAccountChange?: (account: string) => void;
  onSubmit: (data: LoginSubmitData) => void;
}

const LoginUI = ({
  avatarUrl,
  defaultAccount = "",
  loading = false,
  disabled = false,
  onAccountChange,
  onSubmit,
}: LoginUIProps) => {
  const [account, setAccount] = useState(defaultAccount);
  const [password, setPassword] = useState("");

  const inputDisabled = loading || disabled;

  useEffect(() => {
    setAccount(defaultAccount);
  }, [defaultAccount]);

  const handleAccountChange = (value: string): void => {
    setAccount(value);
    onAccountChange?.(value);
  };

  const handleSubmit = (): void => {
    if (inputDisabled) {
      return;
    }

    onSubmit({
      account: account.trim(),
      password,
    });
  };

  return (
    <Stack align="center" gap="md" w="100%">
      <Avatar
        src={avatarUrl || undefined}
        size={75}
        radius={100}
      >
        <IconUser size={36} />
      </Avatar>

      <Title order={4}>登录界面</Title>

      <Divider
        w="100%"
        styles={{
          root: {
            border: "none",
            height: 1,
            backgroundImage:
              "linear-gradient(to right, transparent, light-dark(rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.15)) 50%, transparent)",
          },
        }}
      />

      <Paper
        withBorder
        radius="md"
        w="100%"
        maw={250}
        opacity={inputDisabled ? 0.6 : 1}
        style={{
          overflow: "hidden",
          cursor: inputDisabled ? "not-allowed" : "default",
        }}
      >
        <Group gap={0} wrap="nowrap">
          <Center
            px="md"
            h={40}
            miw={66}
            bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
            style={{
              borderRight:
                "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))",
            }}
          >
            <Text size="xs" fw={600} c="dimmed">
              账号
            </Text>
          </Center>

          <TextInput
            value={account}
            placeholder="请输入账号"
            disabled={inputDisabled}
            variant="unstyled"
            size="sm"
            flex={1}
            px="sm"
            h={40}
            autoComplete="username"
            onChange={(event) =>
              handleAccountChange(event.currentTarget.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </Group>
      </Paper>

      <Paper
        withBorder
        radius="md"
        w="100%"
        maw={250}
        opacity={inputDisabled ? 0.6 : 1}
        style={{
          overflow: "hidden",
          cursor: inputDisabled ? "not-allowed" : "default",
        }}
      >
        <Group gap={0} wrap="nowrap">
          <Center
            px="md"
            h={40}
            miw={66}
            bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
            style={{
              borderRight:
                "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))",
            }}
          >
            <Text size="xs" fw={600} c="dimmed">
              密码
            </Text>
          </Center>

          <TextInput
            type="password"
            value={password}
            placeholder="请输入密码"
            disabled={inputDisabled}
            variant="unstyled"
            size="sm"
            flex={1}
            px="sm"
            h={40}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </Group>
      </Paper>

      <Button
        h={42}
        w="100%"
        maw={250}
        loading={loading}
        disabled={disabled}
        onClick={handleSubmit}
      >
        登录
      </Button>
    </Stack>
  );
};

export default LoginUI;