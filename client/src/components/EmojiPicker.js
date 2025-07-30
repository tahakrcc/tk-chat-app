import React from 'react';
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
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  
  .EmojiPickerReact {
    --epr-bg-color: transparent;
    --epr-category-label-bg-color: transparent;
    --epr-category-label-color: #ffffff;
    --epr-search-input-bg-color: rgba(255, 255, 255, 0.1);
    --epr-search-input-border-color: rgba(255, 255, 255, 0.3);
    --epr-search-input-color: #ffffff;
    --epr-search-input-placeholder-color: rgba(255, 255, 255, 0.7);
    --epr-category-icon-size: 20px;
    --epr-emoji-size: 24px;
    --epr-horizontal-padding: 12px;
    --epr-vertical-padding: 8px;
  }
  
  .EmojiPickerReact .epr-emoji-category-label {
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .EmojiPickerReact .epr-emoji {
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.2);
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  @media (max-width: 768px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 350px;
    bottom: auto;
    margin-bottom: 0;
    z-index: 9999;
    
    .EmojiPickerReact {
      --epr-emoji-size: 22px;
      --epr-category-icon-size: 18px;
      --epr-horizontal-padding: 8px;
      --epr-vertical-padding: 6px;
    }
  }
  
  @media (max-width: 480px) {
    width: 95vw;
    max-width: 320px;
    
    .EmojiPickerReact {
      --epr-emoji-size: 20px;
      --epr-category-icon-size: 16px;
      --epr-horizontal-padding: 6px;
      --epr-vertical-padding: 4px;
    }
  }
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

  return (
    <>
      <EmojiButton 
        onClick={handleToggle} 
        onTouchEnd={handleToggle}
        title="Emoji Ekle"
      >
        <Smile size={20} />
      </EmojiButton>
      
      {isOpen && (
        <>
          {/* Mobilde overlay */}
          {window.innerWidth <= 768 && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9998,
                cursor: 'pointer'
              }}
              onClick={handleOverlayClick}
            />
          )}
          <EmojiPickerContainer>
            <EmojiPickerReact
              onEmojiClick={onEmojiClick}
              autoFocusSearch={false}
              searchPlaceholder="Emoji ara..."
              width="100%"
              height={window.innerWidth <= 768 ? 350 : 400}
              lazyLoadEmojis={true}
            />
          </EmojiPickerContainer>
        </>
      )}
    </>
  );
};

export default EmojiPicker; 