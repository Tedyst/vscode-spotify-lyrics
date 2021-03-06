import * as express from "express";
import * as api from "genius-api";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
const app = express();
const genius = new api(process.env.GENIUS_CLIENT_ACCESS_TOKEN);

app.get("/lyrics", async function(req, res) {
  try {
    const title = req.query.title.toLowerCase().split("(", 1);
    console.log(title);
    const artist = req.query.artist.toLowerCase();
    const artistTitle = `${artist} - ${title}`;

    console.log(`Trying to find lyrics for ${artistTitle}`);
    const response = await genius.search(artistTitle);
    const song = response.hits.find(hit => {
      if (hit.type === "song") {
        console.log(hit);
        // return hit.result.title.toLowerCase().replace === title && hit.result.primary_artist.name.toLowerCase() === artist;
        return (
          hit.result.primary_artist.name.toLowerCase().search(artist) ||
          artist.search(hit.result.primary_artist.name.toLowerCase()) ||
          hit.result.primary_artist.name.toLowerCase() === artist
        );
      }
      return false;
    });
    if (!song) {
      console.log(`Failed to find lyrics for ${artistTitle}`);
      return res.status(404).send("Not found");
    }
    const fetchRes = await fetch(`https://genius.com${song.result.path}`);
    console.log(`${song.result.path}`);
    if (fetchRes.status !== 200) {
      return res.status(fetchRes.status).send(await fetchRes.text());
    }
    const text = await fetchRes.text();
    const $ = cheerio.load(text);
    res.status(200).send($(".lyrics").text());
  } catch (e) {
    return res.status(500).send(e);
  }
});

app.listen(process.env.PORT || 3001, function() {
  console.log("Lyrics server is running");
});
