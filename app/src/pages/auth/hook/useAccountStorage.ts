import { useCallback, useState } from "react";

const STORAGE_KEY = "account_map";

type AccountMap<TUser> = Record<string, TUser>;

interface SetUserParams<TUser> {
  account: string;
  user: TUser;
}

interface UseAccountStorageResult<TUser> {
  set: (params: SetUserParams<TUser>) => void;
  get: (account: string) => TUser | null;
  remove: (account: string) => void;
  clear: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readMap<TUser>(): AccountMap<TUser> {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return {};
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isRecord(parsedValue)) {
      return {};
    }

    return parsedValue as AccountMap<TUser>;
  } catch {
    return {};
  }
}

function writeMap<TUser>(map: AccountMap<TUser>): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(map),
  );
}

export function useAccountStorage<TUser>(): UseAccountStorageResult<TUser> {
  const [map, setMap] = useState<AccountMap<TUser>>(
    () => readMap<TUser>(),
  );

  const set = useCallback(
    ({ account, user }: SetUserParams<TUser>): void => {
      const normalizedAccount = account.trim();

      if (!normalizedAccount) {
        return;
      }

      setMap((currentMap) => {
        const nextMap: AccountMap<TUser> = {
          ...currentMap,
          [normalizedAccount]: user,
        };

        writeMap(nextMap);

        return nextMap;
      });
    },
    [],
  );

  const get = useCallback(
    (account: string): TUser | null => {
      const normalizedAccount = account.trim();

      if (!normalizedAccount) {
        return null;
      }

      return map[normalizedAccount] ?? null;
    },
    [map],
  );

  const remove = useCallback((account: string): void => {
    const normalizedAccount = account.trim();

    if (!normalizedAccount) {
      return;
    }

    setMap((currentMap) => {
      if (!(normalizedAccount in currentMap)) {
        return currentMap;
      }

      const nextMap = { ...currentMap };

      delete nextMap[normalizedAccount];
      writeMap(nextMap);

      return nextMap;
    });
  }, []);

  const clear = useCallback((): void => {
    setMap({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    set: set,
    get: get,
    remove: remove,
    clear: clear,
  };
}