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
  position: absolute;
  bottom: 100%;
  right: 0;
  background: #2f3136;
  border: 1px solid #202225;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  z-index: 1000;
  overflow: hidden;
  width: 350px;
  max-height: 400px;
  margin-bottom: 8px;
  margin-right: 8px;
  
  .EmojiPickerReact {
    --epr-emoji-size: 24px;
    --epr-category-icon-size: 18px;
    --epr-horizontal-padding: 12px;
    --epr-vertical-padding: 8px;
    --epr-search-input-border-color: #40444b;
    --epr-search-input-bg-color: #40444b;
    --epr-search-input-text-color: #dcddde;
    --epr-search-input-placeholder-color: #72767d;
    --epr-category-label-bg-color: #36393f;
    --epr-category-label-text-color: #72767d;
    --epr-skin-tone-picker-menu-bg-color: #2f3136;
    --epr-skin-tone-picker-menu-border-color: #40444b;
    --epr-bg-color: #2f3136;
    --epr-category-label-color: #72767d;
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
    width: 320px;
    max-height: 350px;
    right: -8px;
    
    .EmojiPickerReact {
      --epr-emoji-size: 22px;
      --epr-category-icon-size: 16px;
      --epr-horizontal-padding: 8px;
      --epr-vertical-padding: 6px;
    }
  }
  
  @media (max-width: 480px) {
    width: 280px;
    max-height: 300px;
    right: -4px;
    
    .EmojiPickerReact {
      --epr-emoji-size: 20px;
      --epr-category-icon-size: 14px;
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

const EmojiPicker = ({ onEmojiClick }) => {
  return (
    <EmojiPickerContainer>
      <EmojiPickerReact
        onEmojiClick={onEmojiClick}
        autoFocusSearch={false}
        searchPlaceholder="Emoji ara..."
        width="100%"
        height={300}
        lazyLoadEmojis={true}
      />
    </EmojiPickerContainer>
  );
};

export default EmojiPicker; 