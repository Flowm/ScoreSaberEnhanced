export class LastFM {
	api_url = "";
	api_key = "";
	api_secret = "";
	username = "";
	password = "";
	sk = "";

	constructor() {
		this.getMobileSession();
	}

	getUrl(options: object): URL {
		let url = new URL(this.api_url);
		const params = this.getParams(options);
		params.format = "json";
		Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val));
		return url;
	}

	getParams(options: object): object {
		const params = { ...options,
			api_key: this.api_key,
		}
		const sig_params = Object.entries(params).sort((a, b) => a[0].localeCompare(b[0]));
		params.api_sig = md5(sig_params.map(([key, val]) => key+val).join("")+this.api_secret);
		return this.sortParams(params);
	}

	sortParams(params: object): object {
		var newParams = {};
		var keys = Object.keys(params).sort();
		for (var i in keys) {
			newParams[keys[i]] = params[keys[i]];
		}
		return newParams;
	};

	getMobileSession(): void {
		const url = this.getUrl({
			method: "auth.getMobileSession",
			username: this.username,
			password: this.password,
		});
		fetch(url, {
			method: "POST",
		}).then(response => response.json()).then(json => {
			this.sk = json.session.key
			console.log("Lastfm session initialized")
		});
	}

	track_search(song: object): Promise {
		const params = {
			method: "track.search",
			artist: song.artist || song.mapper,
			track: song.name,
			sk: this.sk,
		}
		const url = this.getUrl(params);
		return fetch(url)
			.then(response => response.json())
			.then(json => json.results.trackmatches.track);
	}

	track_scrobble(song: object): Promise {
		const parmas = {
			method: "track.scrobble",
			artist: song.artist || song.mapper,
			track: song.name,
			timestamp: `${Math.floor(Date.parse(song.time) / 1000)}`,
			chosenByUser: 0,
			sk: this.sk,
		}
		const url = this.getUrl(parmas);
		return fetch(url.origin + url.pathname, {
			method: "POST",
			body: url.searchParams.toString(),
		}).then(response => response.json())
		  .then(json => json.scrobbles);
	}
}
