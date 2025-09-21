export interface LevelModalConfig {
  rewardsLabel: string;
  rewardsLayout: 'standard' | 'gift-center';
  actionsLayout: 'standard' | 'wide-green';
  giftIcon?: string;
}

export interface LevelModalConfigs {
  [level: number]: LevelModalConfig;
}

// Configuration for custom level modal layouts
export const levelModalConfigs: LevelModalConfigs = {
  1: {
    rewardsLabel: "CONGRATS! YOU GOT ACCESS",
    rewardsLayout: "gift-center",
    actionsLayout: "wide-green",
    giftIcon: "/ui/bottomnav/assets/Icon_ImageIcon_Gift_Purple.png"
  }
  // Add more levels here as needed
  // 2: { ... },
  // 5: { ... },
};

// Get configuration for a specific level, returns default if not found
export function getLevelModalConfig(level: number): LevelModalConfig | null {
  return levelModalConfigs[level] || null;
}

// Default configuration for standard levels
export const defaultLevelModalConfig: LevelModalConfig = {
  rewardsLabel: "REWARDS",
  rewardsLayout: "standard",
  actionsLayout: "standard"
};
