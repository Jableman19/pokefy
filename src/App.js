import React, {useEffect, useState} from "react";
import "./App.css";
import axios from "axios";

function App() {

  const clientId = "1f45e650e5a54ab7863490302d4cb37a"
  const redirectUri = "http://localhost:3000/callback"
  const [accessToken, setAccessToken] = useState(null);
  const [topTracks, setTopTracks] = useState([]);

  const imagesContext = require.context('./151', true, /\.(png|jpeg|jpg|gif|svg)$/);
  const imageKeys = imagesContext.keys();
  
  const sortedImageKeys = imageKeys.sort((a, b) => {
    const nameA = parseInt(a.match(/\d+/g), 10);
    const nameB = parseInt(b.match(/\d+/g), 10);
    return nameA - nameB;
  });
  
  const images = sortedImageKeys.map(key => imagesContext(key));
  
  useEffect(() => {
    const token = window.localStorage.getItem('access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const handleLogin = () => {
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=user-top-read`;
  };

  const popCalc = (topTracks) => {
    //go through each track and add up the popularity and then divide by the number of tracks
    var totalPop = 0;
    var numTracks = 0;
    topTracks.forEach(track => {
      totalPop += track.popularity;
      numTracks++;
    });
    return (totalPop/numTracks);
  }

  const handleCallback = () => {
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((initial, item) => {
        let parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
        return initial;
      }, {});

    window.localStorage.setItem('access_token', hash.access_token);
    setAccessToken(hash.access_token);
  };

  const getTopTracks = async () => {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    setTopTracks(response.data.items);
  };

  if (!accessToken) {
    return (
      <div>
        <button onClick={handleLogin}>Login with Spotify</button>
        {window.location.hash.length > 0 && handleCallback()}
      </div>
    );
  }

  return (
    <div>
      <button onClick={getTopTracks}>Get Top Tracks</button>
      <ul>
        {topTracks.map(track => (
          <li key={track.id}>{track.name + "popularity: " + track.popularity}</li>
        ))} 
      </ul>
        {topTracks ? " total popularity: " + popCalc(topTracks) : ""}
        {topTracks ? <img src={(images[Math.floor((popCalc(topTracks)/100) * 151)-1])} alt="Pokemon representing popularity" /> : ""}
    </div>
  );
}

export default App;