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

// JSON конфигурация для кастомных модальных окон
export const levelModalConfigs: LevelModalConfigs = {
  1: {
    rewardsLabel: "CONGRATS! YOU GOT ACCESS",
    rewardsLayout: "gift-center",
    actionsLayout: "wide-green",
    giftIcon: "/ui/bottomnav/assets/Icon_ImageIcon_Gift_Purple.png"
  },
  // Добавьте здесь другие уровни по необходимости
  5: {
    rewardsLabel: "CONGRATS! YOU GOT ACCESS",
    rewardsLayout: "gift-center",
    actionsLayout: "wide-green",
    giftIcon: "/ui/bottomnav/assets/Icon_ImageIcon_Gift_Purple.png"
  },
  // 10: {
  //   rewardsLabel: "MILESTONE ACHIEVED!",
  //   rewardsLayout: "gift-center", 
  //   actionsLayout: "wide-green",
  //   giftIcon: "/ui/bottomnav/assets/Icon_ImageIcon_Gift_Purple.png"
  // }
};

// Функция для получения конфигурации уровня
export const getLevelModalConfig = (level: number): LevelModalConfig | undefined => {
  return levelModalConfigs[level];
};

// Функция для проверки есть ли кастомная конфигурация для уровня
export const hasCustomModalConfig = (level: number): boolean => {
  return level in levelModalConfigs;
};