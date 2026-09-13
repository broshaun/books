import { useState } from "react";
import {
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

interface TextFieldProps {
  label?: string;
  hintText?: string;
  value: string;
  onChanged?: (value: string) => void;
  maxWidth?: number;
  obscureText?: boolean;
  disabled?: boolean;
}

interface RegisterSubmitData {
  account: string;
  password: string;
}

interface RegisterUIProps {
  loading?: boolean;
  onSubmit?: (
    data: RegisterSubmitData,
  ) => void | Promise<void>;
}

const TextField = ({
  label,
  hintText,
  value,
  onChanged,
  maxWidth = 250,
  obscureText = false,
  disabled = false,
}: TextFieldProps) => {
  return (
    <Paper
      withBorder
      radius="md"
      w="100%"
      maw={maxWidth}
      opacity={disabled ? 0.6 : 1}
      style={{
        overflow: "hidden",
      }}
    >
      <Group gap={0} wrap="nowrap">
        {label && (
          <Center
            px="md"
            h={40}
            bg="gray.0"
            style={{
              borderRight:
                "1px solid var(--mantine-color-gray-3)",
            }}
          >
            <Text size="xs" fw={600} c="dimmed">
              {label}
            </Text>
          </Center>
        )}

        <TextInput
          value={value}
          placeholder={hintText}
          onChange={(event) =>
            onChanged?.(event.currentTarget.value)
          }
          type={obscureText ? "password" : "text"}
          variant="unstyled"
          disabled={disabled}
          h={40}
          px="sm"
          flex={1}
        />
      </Group>
    </Paper>
  );
};

const RegisterUI = ({
  loading = false,
  onSubmit,
}: RegisterUIProps) => {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (): Promise<void> => {
    await onSubmit?.({
      account,
      password,
    });

    setAccount("");
    setPassword("");
  };

  return (
    <Stack align="center" gap="md">
      <Title order={3}>
        注册账号
      </Title>

      <Divider
        w="100%"
        styles={{
          root: {
            border: "none",
            height: 1,
            backgroundImage:
              "linear-gradient(to right, transparent, light-dark(rgba(0,0,0,0.12), rgba(255,255,255,0.15)) 50%, transparent)",
          },
        }}
      />

      <TextField
        label="账号"
        hintText="请输入账号"
        value={account}
        disabled={loading}
        onChanged={setAccount}
      />

      <TextField
        label="密码"
        hintText="请输入密码"
        obscureText
        value={password}
        disabled={loading}
        onChanged={setPassword}
      />

      <Button
        h={42}
        w="100%"
        maw={250}
        loading={loading}
        onClick={() => void submit()}
      >
        注册
      </Button>
    </Stack>
  );
};

export default RegisterUI;