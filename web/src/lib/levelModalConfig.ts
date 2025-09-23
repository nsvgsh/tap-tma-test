export interface LevelModalConfig {
  rewardsLabel: string;
  rewardsLayout: 'standard' | 'gift-center';
  actionsLayout: 'standard' | 'wide-green';
  giftIcon?: string;
}

export interface LevelModalConfigs {
  [level: number]: LevelModalConfig;
}

export const defaultLevelModalConfig: LevelModalConfig = {
  rewardsLabel: "REWARDS",
  rewardsLayout: "standard",
  actionsLayout: "standard",
};

// Кэш для хранения конфигураций из базы данных
const configCache = new Map<number, LevelModalConfig | null>();

// Функция для получения конфигурации уровня из базы данных
export const getLevelModalConfig = async (level: number): Promise<LevelModalConfig | undefined> => {
  // Проверяем кэш
  if (configCache.has(level)) {
    const cached = configCache.get(level);
    return cached || undefined;
  }

  try {
    console.log(`Fetching modal config for level ${level}`);
    const response = await fetch(`/api/v1/modal/config?level=${level}`);
    const data = await response.json();

    console.log(`Modal config response for level ${level}:`, data);

    if (data.success && data.hasCustomConfig) {
      console.log(`Using custom config for level ${level}:`, data.config);
      configCache.set(level, data.config);
      return data.config;
    } else {
      console.log(`No custom config for level ${level}, using default`);
      configCache.set(level, null);
      return undefined;
    }
  } catch (error) {
    console.warn('Failed to fetch modal config from database:', error);
    configCache.set(level, null);
    return undefined;
  }
};

// Функция для проверки есть ли кастомная конфигурация для уровня
export const hasCustomModalConfig = async (level: number): Promise<boolean> => {
  const config = await getLevelModalConfig(level);
  return config !== undefined;
};

// Функция для очистки кэша (полезно для тестирования)
export const clearModalConfigCache = (): void => {
  configCache.clear();
};