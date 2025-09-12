import React, { useState, useEffect } from 'react';

// --- STYLES for this component ---
const contentStyles = `
  .main-content {
    flex: 1;
    padding: 20px;
    color: white;
    overflow-y: auto; /* Allows scrolling if content is too long */
    background-color: #121212;
    margin-left: 15px;
    margin-right: 15px;
    border-radius: 20px;
  }
  .content-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .show-all {
    font-size: 14px;
    font-weight: normal;
    color: #b3b3b3;
    cursor: pointer;
  }
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }
  .song-card {
    background-color: #181818;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    transition: background-color 0.3s ease;
  }
  .song-card:hover { background-color: #282828; }
  .song-card img {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 12px;
  }
  .song-card h3 {
    font-size: 16px;
    margin: 0 0 4px 0;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .song-card p {
    font-size: 14px;
    margin: 0;
    color: #b3b3b3;
  }
  .artist-card {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .artist-card img {
    border-radius: 50%; /* Make artist images circular */
  }
`;


// --- TYPES (Good practice for TypeScript) ---
interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
}

interface Artist {
  id: number;
  name: string;
  type: string;
  avatar: string;
}

// The MainContent component
const MainContent: React.FC = () => {
    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const songsResponse = await fetch('/api/trending-songs'); 
                const artistsResponse = await fetch('/api/popular-artists');

                const songsData = await songsResponse.json();
                const artistsData = await artistsResponse.json();

                setTrendingSongs(songsData);
                setPopularArtists(artistsData);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Simulate a network request with a delay
        setTimeout(() => {
            // In a real app, you'd call fetchData() here.
            // For now, we'll use mock data to simulate a successful fetch.
            setTrendingSongs([
              { id: 1, title: 'BU', artist: 'SURIYA, MQT, P6ICK', cover: 'https://placehold.co/200x200/94a3b8/000000?text=BU' },
              { id: 2, title: 'wanna be yours', artist: 'Violette Wautier', cover: 'https://placehold.co/200x200/64748b/000000?text=Yours' },
            ]);
            setPopularArtists([
              { id: 1, name: 'YOUNGOHM', type: 'Artist', avatar: 'https://placehold.co/200x200/94a3b8/000000?text=YO' },
              { id: 2, name: 'Only Monday', type: 'Artist', avatar: 'https://placehold.co/200x200/64748b/000000?text=OM' },
            ]);
            setIsLoading(false);
        }, 1000); // 1 second delay

    }, []);

    if (isLoading) {
        return <div className="main-content"><h1>Loading...</h1></div>;
    }

    return (
      <>
        <style>{contentStyles}</style>
        <div className="main-content">
          <section>
            <div className="content-title"><span>Trending songs</span><span className="show-all">Show all</span></div>
            <div className="card-grid">
              {trendingSongs.map(song => (
                <div key={song.id} className="song-card">
                  <img src={song.cover} alt={song.title} />
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="content-title"><span>Popular artists</span><span className="show-all">Show all</span></div>
            <div className="card-grid">
              {popularArtists.map(artist => (
                <div key={artist.id} className="song-card artist-card">
                  <img src={artist.avatar} alt={artist.name} />
                  <h3>{artist.name}</h3>
                  <p>{artist.type}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </>
    );
};

export default MainContent;

