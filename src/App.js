import React, {useEffect, useState} from "react";
import "./App.css";
import axios from "axios";
import { Button, Typography, Card, Stack } from "@mui/material";
import { borderRadius, textTransform } from "@mui/system";

function App() {

  const clientId = "1f45e650e5a54ab7863490302d4cb37a"
  const redirectUri = "http://localhost:3000/callback"
  const [accessToken, setAccessToken] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [popularity, setPopularity] = useState(0);
  const [popKey, setPopKey] = useState(0);
  const [mon, setMon] = useState("");

  const imagesContext = require.context('./151', true, /\.(png|jpeg|jpg|gif|svg)$/);
  const imageKeys = imagesContext.keys();

  const buttonStyle = {
    display: "block",
    position: 'absolute',
    margin: 'auto',
    top: '42%',
    left: '42%',
    backgroundColor:"#4d8a41",
    color: "white",
    padding: '10px',
    borderRadius:'20px',
    textTransform: 'none',
    "&:hover": {
      backgroundColor:" #8fbf86",
    }
  }

  const imgStyle = {
    margin: 'auto',
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }

  const textStyle = {
    maxWidth: '66%',
    display: 'block',
    margin: 'auto'
  }

  const cardStyle = {
    borderRadius: '10px',
    width: '150px',
    height:'150px',
    left: 'calc(50% - 75px)',
    backgroundColor: '#4d8a41',
    position:'relative'
  }
  
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
    console.log(topTracks)
    var totalPop = 0;
    var numTracks = 0;
    topTracks.forEach(track => {
      totalPop += track.popularity;
      numTracks++;
    });
    setPopularity(totalPop/numTracks);
    const localPopKey = Math.floor(((totalPop/numTracks)/100) * 151)-1;
    setPopKey(localPopKey);
    try{
      setMon(sortedImageKeys[localPopKey].split("-")[2].split(".")[0])
    }
    catch(error){
    }
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
    
    try{
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setTopTracks(response.data.items);
      popCalc(response.data.items);

    } catch (error) {
      setAccessToken(null);
    }

  };

  if (!accessToken) {
    return (
      <div>
        <Button onClick={handleLogin}>Login with Spotify</Button>
        {window.location.hash.length > 0 && handleCallback()}
      </div>
    );
  }

  else if(!mon){
    return (
      <div>
        <Button onClick={getTopTracks} sx={buttonStyle}>Calculate My Spotify Pokemon</Button>
      </div>
    );
  }

  return(
    <Stack sx={{display: 'flex', justifyContent: 'center'}}>
      {/* <ul>
        {topTracks.map(track => (
          <li key={track.id}>{track.name + "popularity: " + track.popularity}</li>
        ))} 
      </ul> */} 
        <Typography sx={textStyle}>
          {"The average popularity of your top 50 recent tracks is  " + popularity + " out of 100, this makes you a " + mon + "!"}
        </Typography>
        <Card sx={cardStyle}>
          <img src={(images[popKey])} height="100px" style={imgStyle} alt="Pokemon representing popularity" />
        </Card>
        <Typography sx={textStyle}>
          {mon + "is ranked #" + (popKey+1) + " out of 151 Pokemon by popularity based on a poll conducted by "}
          <a href="https://www.reddit.com/user/mamamia1001/">/u/mamamia1001.</a>
          {"You can see the results of the poll "}
          <a href="https://www.reddit.com/r/pokemon/comments/c0w4s0/favourite_pok%C3%A9mon_survey_results/">here.</a>
        </Typography>
    </Stack>
  )
}

export default App;