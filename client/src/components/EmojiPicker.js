import React, { useEffect } from 'react';
import styled from 'styled-components';
import EmojiPickerReact from 'emoji-picker-react';
import { Smile } from 'lucide-react';

const EmojiButton = styled.button`
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    min-width: 44px;
    min-height: 44px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    min-width: 48px;
    min-height: 48px;
  }
`;

const EmojiPickerContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.9);
  z-index: 10000;
  overflow: hidden;
  width: 90vw;
  max-width: 350px;
  max-height: 60vh;
  
  .EmojiPickerReact {
    --epr-emoji-size: 24px;
    --epr-category-icon-size: 20px;
    --epr-horizontal-padding: 12px;
    --epr-vertical-padding: 8px;
    --epr-search-input-border-color: rgba(255, 255, 255, 0.3);
    --epr-search-input-bg-color: rgba(255, 255, 255, 0.1);
    --epr-search-input-text-color: #ffffff;
    --epr-search-input-placeholder-color: rgba(255, 255, 255, 0.7);
    --epr-category-label-bg-color: rgba(255, 255, 255, 0.1);
    --epr-category-label-text-color: #ffffff;
    --epr-skin-tone-picker-menu-bg-color: rgba(0, 0, 0, 0.9);
    --epr-skin-tone-picker-menu-border-color: rgba(255, 255, 255, 0.2);
    --epr-bg-color: transparent;
    --epr-category-label-color: #ffffff;
  }
  
  .EmojiPickerReact .epr-emoji {
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.2);
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  .EmojiPickerReact .epr-category-label {
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  @media (max-width: 768px) {
    width: 95vw;
    max-width: 320px;
    max-height: 55vh;
    
    .EmojiPickerReact {
      --epr-emoji-size: 22px;
      --epr-category-icon-size: 18px;
      --epr-horizontal-padding: 8px;
      --epr-vertical-padding: 6px;
    }
  }
  
  @media (max-width: 480px) {
    width: 98vw;
    max-width: 300px;
    max-height: 50vh;
    
    .EmojiPickerReact {
      --epr-emoji-size: 20px;
      --epr-category-icon-size: 16px;
      --epr-horizontal-padding: 6px;
      --epr-vertical-padding: 4px;
    }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  cursor: pointer;
`;

const EmojiPicker = ({ onEmojiClick, isOpen, onToggle }) => {
  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onToggle();
    }
  };

  // Prevent body scroll when picker is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <Overlay onClick={handleOverlayClick} />
      <EmojiPickerContainer>
        <EmojiPickerReact
          onEmojiClick={onEmojiClick}
          autoFocusSearch={false}
          searchPlaceholder="Emoji ara..."
          width="100%"
          height={window.innerWidth <= 768 ? 300 : 350}
          lazyLoadEmojis={true}
        />
      </EmojiPickerContainer>
    </>
  );
};

export default EmojiPicker; 