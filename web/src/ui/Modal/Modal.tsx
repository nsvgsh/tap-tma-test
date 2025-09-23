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
  onStartAd: (clickId?: number) => void;
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

  const handleBonusClick = async () => {
    // Generate unique CLICKID using Unix timestamp
    const clickId = Math.floor(Date.now() / 1000);
    
    // Log BONUS button click
    if (userId && sessionId) {
      await modalClickLogger.logLevelUpModalClick(
        userId,
        sessionId,
        level,
        'bonus',
        { 
          rewards: rewards,
          config: config,
          clickId: clickId,
          externalLink: true,
          targetUrl: 'himfls.com'
        }
      );
    }
    onStartAd(clickId);
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
          {/* Контейнер для иконки подарка с надписями */}
          <div className={styles.giftContainer}>
            {/* Круговой текст сверху */}
            <div className={styles.arcTextTop}>
              <svg viewBox="0 0 200 200" className={styles.circularTextSvg}>
                <defs>
                  <path id="circleTop" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" />
                </defs>
                <text className={styles.circularText}>
                  <textPath href="#circleTop" startOffset="0%">
                    CONGRATS! • CONGRATS! • CONGRATS! • CONGRATS! •
                  </textPath>
                </text>
              </svg>
            </div>
            
            <img 
              src={config.giftIcon} 
              alt="Gift" 
              className={styles.giftIcon}
            />
            
            {/* Круговой текст снизу */}
            <div className={styles.arcTextBottom}>
              <svg viewBox="0 0 200 200" className={styles.circularTextSvg}>
                <defs>
                  <path id="circleBottom" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" />
                </defs>
                <text className={styles.circularText}>
                  <textPath href="#circleBottom" startOffset="0%">
                    YOU GOT ACCESS • YOU GOT ACCESS • YOU GOT ACCESS •
                  </textPath>
                </text>
              </svg>
            </div>
          </div>
          
          {/* Кнопка внутри rewardsBox для кастомных уровней */}
          <Button variant="confirm" className={styles.ctaButton} width="100%" onClick={handleTryForFreeClick}>
            <span className={styles.actionLabel}>TRY FOR FREE</span>
          </Button>
        </div>
      );
    }
    
    // Standard layout
    // If zeroRewards is true, use zero rewards instead of the passed rewards
    const displayRewards = config.zeroRewards ? config.zeroRewardsPayload : rewards;
    
    return (
      <div className={styles.rewardsRow}>
        {typeof displayRewards?.coins === "number" && displayRewards.coins > 0 && (
          <RewardPill iconSrc="/ui/header/ResourceBar_Icon_Gold.png" label={displayRewards.coins.toLocaleString()} variant="blue" />
        )}
        {typeof displayRewards?.tickets === "number" && displayRewards.tickets > 0 && (
          <RewardPill iconSrc="/ui/header/Whisk_Purple_Ticket.png" label={displayRewards.tickets} variant="blue" iconWidthPercent={70} />
        )}
        {config.zeroRewards && (
          <div className={styles.zeroRewardsMessage}>
            Special milestone achieved!
          </div>
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


