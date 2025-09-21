"use client";

import React from "react";
import styles from "./Modal.module.css";
import { Button } from "@/ui/Button/Button";
import { RewardPill } from "@/ui/shared/RewardPill/RewardPill";
import { getLevelModalConfig, defaultLevelModalConfig } from "@/lib/levelModalConfig";
import { modalClickLogger } from "@/lib/modalClickLogger";

export interface LevelUpModalProps {
  level: number;
  rewards: { coins?: number; tickets?: number };
  onClaimBase: () => void;
  onStartAd: () => void;
  claimLabel?: string;
  bonusLabel?: string;
  singleAction?: boolean;
  // Logging props
  userId?: string;
  sessionId?: string;
  onClose?: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ 
  level, 
  rewards, 
  onClaimBase, 
  onStartAd, 
  claimLabel, 
  bonusLabel, 
  singleAction,
  userId,
  sessionId,
  onClose
}) => {
  const config = getLevelModalConfig(level) || defaultLevelModalConfig;

  // Log only TRY FOR FREE button clicks
  const logTryForFreeClick = async () => {
    if (userId && sessionId) {
      await modalClickLogger.logLevelUpModalClick(
        userId,
        sessionId,
        level,
        'try_for_free',
        { 
          rewards: rewards,
          config: config
        }
      );
    }
  };

  // Simple click handlers - only log TRY FOR FREE
  const handleClaimClick = () => {
    onClaimBase();
  };

  const handleBonusClick = () => {
    onStartAd();
  };

  const handleTryForFreeClick = async () => {
    await logTryForFreeClick();
    onClaimBase();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const handleCloseClick = () => {
    onClose?.();
  };
  
  const renderRewardsContent = () => {
    if (config.rewardsLayout === 'gift-center') {
      return (
        <div className={styles.giftCenter}>
          <img 
            src={config.giftIcon} 
            alt="Gift" 
            className={styles.giftIcon}
          />
        </div>
      );
    }
    
    // Standard layout
    return (
      <div className={styles.rewardsRow}>
        {typeof rewards.coins === "number" && (
          <RewardPill iconSrc="/ui/header/ResourceBar_Icon_Gold.png" label={rewards.coins.toLocaleString()} variant="blue" />
        )}
        {typeof rewards.tickets === "number" && (
          <RewardPill iconSrc="/ui/header/Whisk_Purple_Ticket.png" label={rewards.tickets} variant="blue" iconWidthPercent={70} />
        )}
      </div>
    );
  };

  const renderActions = () => {
    if (config.actionsLayout === 'wide-green') {
      return (
        <div className={styles.actionsWide}>
          <Button variant="confirm" className={styles.wideGreenButton} width="100%" onClick={handleTryForFreeClick}>
            <span className={styles.actionLabel}>TRY FOR FREE</span>
          </Button>
        </div>
      );
    }
    
    // Standard layout
    return (
      <div className={styles.actions}>
        <div className={styles.actionsItem}>
          <Button variant="primary" className={styles.ctaButton} width="100%" onClick={handleClaimClick}>
            <span className={styles.actionLabel}>{claimLabel ?? 'Claim'}</span>
          </Button>
        </div>
        {!singleAction && (
          <div className={styles.actionsItem}>
            <Button variant="confirm" className={styles.ctaButton} width="100%" onClick={handleBonusClick}>
              <span className={styles.actionLabel}>{bonusLabel ?? 'BONUS'}</span>
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="levelup-title" 
      aria-describedby="levelup-rewards" 
      className={styles.overlay}
      onClick={handleOverlayClick}
    >
      <div className={styles.card}>
        {/* Grid Row 1: header area (50%) */}
        <div className={styles.headerArea}>
          <button 
            className={styles.closeButton} 
            onClick={handleCloseClick}
            aria-label="Close modal"
          >
            ×
          </button>
          <div className={styles.headline} id="levelup-headline">You have reached the Next Level!</div>
          <div className={styles.shield}>
            <div className={styles.levelNum}>{level}</div>
          </div>
          <div className={styles.title} id="levelup-title">LEVEL UP!</div>
        </div>

        {/* Grid Row 2: rewards area (30%) */}
        <div className={styles.rewardsBox} id="levelup-rewards">
          <span className={styles.rewardsLabel}>{config.rewardsLabel}</span>
          {renderRewardsContent()}
        </div>

        {/* Grid Row 3: CTAs area (20%) */}
        {renderActions()}
      </div>
    </div>
  );
};


