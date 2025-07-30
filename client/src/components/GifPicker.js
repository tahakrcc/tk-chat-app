import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { GiphyFetch } from '@giphy/js-fetch-api';

const GifPickerContainer = styled.div`
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
  
  @media (max-width: 768px) {
    width: 95vw;
    max-width: 320px;
    max-height: 55vh;
  }
  
  @media (max-width: 480px) {
    width: 98vw;
    max-width: 300px;
    max-height: 50vh;
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

const GifHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
`;

const GifTitle = styled.h3`
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
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
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const SearchContainer = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    border-color: rgba(83, 82, 237, 0.8);
    box-shadow: 0 0 0 3px rgba(83, 82, 237, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const GifGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px 20px;
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    padding: 12px 16px;
    max-height: 250px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    padding: 10px 12px;
    max-height: 200px;
  }
`;

const GifItem = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
    border-color: rgba(83, 82, 237, 0.5);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    display: block;
  }
  
  @media (max-width: 768px) {
    img {
      height: 100px;
    }
  }
  
  @media (max-width: 480px) {
    img {
      height: 80px;
    }
  }
`;

const LoadingText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 30px 20px;
  font-size: 14px;
  font-weight: 600;
`;

const NoResultsText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 30px 20px;
  font-size: 14px;
  font-weight: 600;
`;

const GifPicker = ({ onGifSelect, isOpen, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // GIPHY API key - you'll need to get a free one from https://developers.giphy.com/
  const GIPHY_API_KEY = 'dc6zaTOxFJmzC'; // This is a public demo key, replace with your own
  const gf = new GiphyFetch(GIPHY_API_KEY);

  const searchGifs = async (query) => {
    if (!query.trim()) {
      setGifs([]);
      return;
    }

    setLoading(true);
    try {
      const response = await gf.search(query, {
        limit: 20,
        rating: 'g'
      });
      
      setGifs(response.data);
    } catch (error) {
      console.error('GIF arama hatası:', error);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchGifs(searchTerm);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm]);

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

  const handleGifClick = (gif) => {
    onGifSelect(gif.images.original.url);
    onToggle();
  };

  const handleClose = () => {
    setSearchTerm('');
    setGifs([]);
    onToggle();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Overlay onClick={handleOverlayClick} />
      <GifPickerContainer>
        <GifHeader>
          <GifTitle>🎬 GIF Ara</GifTitle>
          <CloseButton onClick={handleClose} title="Kapat">
            <X size={18} />
          </CloseButton>
        </GifHeader>
        
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="GIF ara... (örn: kedi, gülme, dans)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </SearchContainer>
        
        <GifGrid>
          {loading ? (
            <LoadingText>🔍 Aranıyor...</LoadingText>
          ) : gifs.length === 0 && searchTerm ? (
            <NoResultsText>❌ Sonuç bulunamadı</NoResultsText>
          ) : (
            gifs.map((gif) => (
              <GifItem key={gif.id} onClick={() => handleGifClick(gif)}>
                <img 
                  src={gif.images.fixed_height_small.url} 
                  alt={gif.title}
                  loading="lazy"
                />
              </GifItem>
            ))
          )}
        </GifGrid>
      </GifPickerContainer>
    </>
  );
};

export default GifPicker; 