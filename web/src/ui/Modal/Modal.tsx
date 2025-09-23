"use client";

import React, { useState, useEffect } from "react";
import styles from "./Modal.module.css";
import { Button } from "@/ui/Button/Button";
import { RewardPill } from "@/ui/shared/RewardPill/RewardPill";
import { getLevelModalConfig, defaultLevelModalConfig, LevelModalConfig } from "@/lib/levelModalConfig";
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
  const [config, setConfig] = useState<LevelModalConfig>(defaultLevelModalConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const customConfig = await getLevelModalConfig(level);
        setConfig(customConfig || defaultLevelModalConfig);
      } catch (error) {
        console.warn('Failed to load modal config:', error);
        setConfig(defaultLevelModalConfig);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [level]);

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
          {/* SVG для дугообразного текста сверху */}
          <svg className={styles.arcTextTop} viewBox="0 0 200 40" width="200" height="40">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF8C00" />
              </linearGradient>
            </defs>
            <path id="arcPathTop" d="M 20 30 Q 100 10 180 30" fill="none" stroke="none" />
            <text className={styles.arcText}>
              <textPath href="#arcPathTop" startOffset="50%" textAnchor="middle" fill="url(#goldGradient)">
                CONGRATS!
              </textPath>
            </text>
          </svg>
          
          <img 
            src={config.giftIcon} 
            alt="Gift" 
            className={styles.giftIcon}
          />
          
          {/* SVG для дугообразного текста снизу */}
          <svg className={styles.arcTextBottom} viewBox="0 0 200 40" width="200" height="40">
            <defs>
              <linearGradient id="goldGradientBottom" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF8C00" />
              </linearGradient>
            </defs>
            <path id="arcPathBottom" d="M 20 10 Q 100 30 180 10" fill="none" stroke="none" />
            <text className={styles.arcText}>
              <textPath href="#arcPathBottom" startOffset="50%" textAnchor="middle" fill="url(#goldGradientBottom)">
                YOU GOT ACCESS
              </textPath>
            </text>
          </svg>
          
          {/* Кнопка внутри rewardsBox для кастомных уровней */}
          <Button variant="confirm" className={styles.ctaButton} width="100%" onClick={handleTryForFreeClick}>
            <span className={styles.actionLabel}>TRY FOR FREE</span>
          </Button>
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
      // Для кастомных уровней кнопка уже находится в rewardsBox, поэтому не показываем actions
      return null;
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

  // Show loading state while config is being fetched
  if (isLoading) {
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
          <div className={styles.headerArea}>
            <div className={styles.title}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

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
          {config.rewardsLayout === 'gift-center' ? (
            renderRewardsContent()
          ) : (
            <>
              <span className={styles.rewardsLabel}>{config.rewardsLabel}</span>
              {renderRewardsContent()}
            </>
          )}
        </div>

        {/* Grid Row 3: CTAs area (20%) */}
        {renderActions()}
      </div>
    </div>
  );
};


