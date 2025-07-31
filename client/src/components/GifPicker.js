import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const GifPickerContainer = styled.div`
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
  
  @media (max-width: 768px) {
    width: 320px;
    max-height: 350px;
    right: -8px;
  }
  
  @media (max-width: 480px) {
    width: 280px;
    max-height: 300px;
    right: -4px;
  }
`;

const GifHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #40444b;
  background: #36393f;
`;

const GifTitle = styled.h3`
  color: #dcddde;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`;

const SearchContainer = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #40444b;
`;

const SearchInput = styled.input`
  width: 100%;
  background: #40444b;
  border: 1px solid #202225;
  border-radius: 6px;
  padding: 8px 12px;
  color: #dcddde;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: #72767d;
  }
  
  &:focus {
    border-color: #7289da;
    box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.2);
  }
`;

const GifGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px 16px;
  max-height: 250px;
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
    gap: 6px;
    padding: 10px 12px;
    max-height: 200px;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
    padding: 8px 10px;
    max-height: 180px;
  }
`;

const GifItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &:hover {
    transform: scale(1.02);
    border-color: #7289da;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    display: block;
  }
  
  @media (max-width: 768px) {
    img {
      height: 80px;
    }
  }
  
  @media (max-width: 480px) {
    img {
      height: 60px;
    }
  }
`;

const LoadingText = styled.div`
  color: #72767d;
  text-align: center;
  padding: 20px 16px;
  font-size: 13px;
  font-weight: 500;
`;

const NoResultsText = styled.div`
  color: #72767d;
  text-align: center;
  padding: 20px 16px;
  font-size: 13px;
  font-weight: 500;
`;

const GifPicker = ({ onGifSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Tenor API - Google'ın GIF servisi (ücretsiz)
  // API key almak için: https://console.cloud.google.com
  const TENOR_API_KEY = 'AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz'; // Test key - gerçek key ile değiştirin
  const TENOR_CLIENT_KEY = 'tk-chat-app';

  const searchGifs = async (query) => {
    if (!query.trim()) {
      setGifs([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=20&media_filter=minimal`
      );
      
      if (!response.ok) {
        throw new Error('Tenor API hatası');
      }
      
      const data = await response.json();
      setGifs(data.results || []);
    } catch (error) {
      console.error('GIF arama hatası:', error);
             // Hata durumunda demo GIF'leri göster
       setGifs([
         {
           id: 'demo1',
           media_formats: { gif: { url: 'https://media.tenor.com/8KqJ6S_5KqIAAAAC/cat-cute.gif' } },
           title: 'Sevimli Kedi'
         },
         {
           id: 'demo2',
           media_formats: { gif: { url: 'https://media.tenor.com/8KqJ6S_5KqIAAAAC/laugh-funny.gif' } },
           title: 'Gülme'
         },
         {
           id: 'demo3',
           media_formats: { gif: { url: 'https://media.tenor.com/8KqJ6S_5KqIAAAAC/dance-happy.gif' } },
           title: 'Dans'
         }
       ]);
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
    onGifSelect(gif.media_formats.gif.url);
  };

  return (
    <GifPickerContainer>
      <GifHeader>
        <GifTitle>🎬 GIF Ara</GifTitle>
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
            <GifItem key={gif.id} onClick={() => handleGifClick(gif)} title={gif.title}>
              <img 
                src={gif.media_formats.gif.url} 
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