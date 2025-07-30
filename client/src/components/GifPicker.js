import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { GiphyFetch } from '@giphy/js-fetch-api';

const GifButton = styled.button`
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
`;

const GifPickerContainer = styled.div`
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
  width: 350px;
  max-height: 500px;
  
  @media (max-width: 768px) {
    left: 50%;
    transform: translateX(-50%);
    width: 95vw;
    max-width: 320px;
    bottom: 120%;
    max-height: 400px;
  }
  
  @media (max-width: 480px) {
    width: 98vw;
    max-width: 300px;
    bottom: 130%;
    max-height: 350px;
  }
`;

const GifHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const GifTitle = styled.h3`
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SearchContainer = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    border-color: rgba(83, 82, 237, 0.8);
    box-shadow: 0 0 0 2px rgba(83, 82, 237, 0.3);
  }
`;

const GifGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px 16px;
  max-height: 350px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
  
  @media (max-width: 768px) {
    gap: 6px;
    padding: 10px 12px;
    max-height: 280px;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
    padding: 8px 10px;
    max-height: 250px;
  }
`;

const GifItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
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
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 20px;
  font-size: 14px;
`;

const NoResultsText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 20px;
  font-size: 14px;
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

  const handleGifClick = (gif) => {
    onGifSelect(gif.images.original.url);
    onToggle();
  };

  const handleClose = () => {
    setSearchTerm('');
    setGifs([]);
    onToggle();
  };

  if (!isOpen) return null;

  return (
    <GifPickerContainer>
      <GifHeader>
        <GifTitle>GIF Ara</GifTitle>
        <CloseButton onClick={handleClose} title="Kapat">
          <X size={16} />
        </CloseButton>
      </GifHeader>
      
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="GIF ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </SearchContainer>
      
      <GifGrid>
        {loading ? (
          <LoadingText>Aranıyor...</LoadingText>
        ) : gifs.length === 0 && searchTerm ? (
          <NoResultsText>Sonuç bulunamadı</NoResultsText>
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
  );
};

export default GifPicker; 