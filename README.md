# ScoreSaberEnhanced
Provides additional features to the ScoreSaber website

# Install
Get Tampermonkey or Greasemonkey for [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/). Then install the script from [here](https://github.com/Splamy/ScoreSaberEnhanced/raw/master/scoresaber.user.js).

# Compare Scores
- Compare your scores with your friends
- Extend the song table to the full box width
- Direct links to BeatSaver and OneClick download

![Compare](https://i.imgur.com/3xy8FQo.png)

- Compare scores on a song page with friends

![Compare2](https://i.imgur.com/ZtCGEbx.png)

- Show pp distribution Graphs

![Compare3](https://i.imgur.com/KQNqWFg.png)

# Pin
- Pin your own profile to the nav bar
- Jump directly to other saved users

![Pin](https://i.imgur.com/2B0GLwi.png)

# Themes
- Many themes, including various dark themes.

![Themes](https://i.imgur.com/3Nso0TP.png)

# Other
- Rank number link on a user page jumps to the page where the user is
- Rank number now links to the song leaderboard page where the user is
![LinkFix2](https://i.imgur.com/U1quEKP.png)



# Development

Setup everything with `npm install`

Run `gulp` to build the project.

Run `gulp watch` to run the watcher which will continuously build the project.

The generated output file is always `scoresaber.user.js`.

# Changelog

1.5.0
 - Added pp distribution graph
 - Adjust colors to dark mode of ScoreSaber

1.4.1
 - Fixed force update for song pages

1.4.0
 - Added visual feedback for download start/fail

1.3.1
 - Fixed 'friends' tab being broken
 - Fixed some songs breaking the song comparison
 - Disable BS/OC buttons on songs with invalid ids
