import { BulmaSize, IBeatSaverSongInfo } from "./declarations/Types";
import { get_wide_table, is_song_leaderboard_page, is_user_page } from "./env";
import g from "./global";
import { create, into } from "./util/dom";
import { check } from "./util/err";
import { number_invariant, toggled_class } from "./util/format";
import { fetch_song_info_by_hash, get_song_hash_from_text, oneclick_install } from "./util/song";

function new_page(link: string): void {
	window.open(link, "_blank");
}

function generate_beatsaver_button(song_hash: string | undefined, size: BulmaSize): HTMLElement {
	const base_elem = create("div", {
		class: `button icon is-${size} ${toggled_class(size !== "large", "has-tooltip-left")}`,
		style: {
			cursor: song_hash === undefined ? "default" : "pointer",
			padding: "0",
		},
		disabled: song_hash === undefined,
		data: { tooltip: "View on BeatSaver" },
		onclick() {
			checked_hash_to_song_info(this as any, song_hash)
				.then(song_info => new_page(g.beatsaver_link + song_info.key))
				.catch(() => failed_to_download(this as any));
		},
	},
		create("div", { class: "beatsaver_bg" }),
	);
	return base_elem;
}

function generate_oneclick_button(song_hash: string | undefined, size: BulmaSize): HTMLElement {
	return create("div", {
		class: `button icon is-${size} ${toggled_class(size !== "large", "has-tooltip-left")}`,
		style: {
			cursor: song_hash === undefined ? "default" : "pointer",
		},
		disabled: song_hash === undefined,
		data: { tooltip: "Download with OneClick™" },
		onclick() {
			checked_hash_to_song_info(this as any, song_hash)
				.then(song_info => oneclick_install(song_info.key))
				.then(() => ok_after_download(this as any))
				.catch(() => failed_to_download(this as any));
		},
	},
		create("i", { class: "fas fa-cloud-download-alt" }),
	);
}

function generate_lastfm_button(song: object | undefined, size: BulmaSize): HTMLElement {
	return create("div", {
		class: `button icon is-${size} ${toggled_class(size !== "large", "has-tooltip-left")}`,
		style: {
			cursor: song === undefined ? "default" : "pointer",
		},
		disabled: song === undefined,
		data: { tooltip: "Show on Last.fm" },
		onclick() {
			console.log(song)
		},
	},
		create("i", { class: "fab lastfm-square" }),
	);
}

function generate_bsaber_button(song_hash: string | undefined): HTMLElement {
	return create("a", {
		class: "button icon is-large",
		style: {
			cursor: song_hash === undefined ? "default" : "pointer",
			padding: "0",
		},
		disabled: song_hash === undefined,
		data: { tooltip: "View/Add rating on BeastSaber" },
		async onclick() {
			checked_hash_to_song_info(this as any, song_hash)
				.then(song_info => new_page(g.bsaber_link + song_info.key))
				.catch(() => failed_to_download(this as any));
		},
	},
		create("div", {
			style: {
				backgroundImage: "url(\"https://bsaber.com/wp-content/themes/beastsaber-wp-theme/assets/img/avater-callback.png\")",
				backgroundSize: "cover",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				width: "100%",
				height: "100%",
				borderRadius: "inherit",
			}
		}),
	);
}

async function checked_hash_to_song_info(ref: HTMLElement, song_hash?: string, ): Promise<IBeatSaverSongInfo> {
	reset_download_visual(ref);
	if (!song_hash) { failed_to_download(ref); throw new Error("song_hash is undefined"); }
	const song_info = await fetch_song_info_by_hash(song_hash);
	if (!song_info) { failed_to_download(ref); throw new Error("song_info is undefined"); }
	return song_info;
}


function reset_download_visual(ref: HTMLElement) {
	if (ref) {
		ref.classList.remove("button_success");
		ref.classList.remove("button_error");
	}
}

function failed_to_download(ref?: HTMLElement) {
	if (ref) {
		ref.classList.add("button_error");
	}
}

function ok_after_download(ref: HTMLElement) {
	if (ref) {
		ref.classList.add("button_success");
	}
}

export function setup_dl_link_user_site(): void {
	if (!is_user_page()) { return; }

	// find the table we want to modify
	const table = check(document.querySelector("table.ranking.songs"));

	// add a new column for our links
	const table_tr = check(table.querySelector("thead tr"));
	into(table_tr, create("th", { class: "compact bs_link" }, "BS"));
	into(table_tr, create("th", { class: "compact oc_link" }, "OC"));
	into(table_tr, create("th", { class: "compact oc_link" }, "LFM"));

	// add a link for each song
	const table_row = table.querySelectorAll("tbody tr");
	for (const row of table_row) {
		// there's only one link, so 'a' will find it.
		const image_link = check(row.querySelector<HTMLImageElement>("th.song img")).src;
		const song_hash = get_song_hash_from_text(image_link);

		// Extract song details from row
		const song = {
			mapper: <string> "",
			name: <string> "",
			artist: <string> "",
		};
		song.mapper = check(row.querySelector<HTMLElement>("th.song span.songTop.mapper")).innerText;
		const song_split = check(row.querySelector<HTMLElement>("th.song span.songTop.pp")).firstChild?.nodeValue?.split("-");
		song.name = song_split[1].trim();
		if (song_split[0].trim().length > 0) {
			song.artist = song_split[0].trim();
		}

		// link to the website
		into(row,
			create("th", { class: "compact bs_link" },
				generate_beatsaver_button(song_hash, "medium")
			)
		);

		// oneclick installer
		into(row,
			create("th", { class: "compact oc_link" },
				generate_oneclick_button(song_hash, "medium")
			)
		);

		into(row,
			create("th", { class: "compact oc_link" },
				generate_lastfm_button(song, "medium")
			)
		);
	}
}

export function setup_dl_link_leaderboard(): void {
	if (!is_song_leaderboard_page()) { return; }

	// find the element we want to modify
	let details_box = check(document.querySelector(".content .title.is-5"));
	details_box = check(details_box.parentElement);

	const song_hash = get_song_hash_from_text(details_box.innerHTML);

	details_box.appendChild(
		create("div", {
			id: "leaderboard_tool_strip"
		},
			generate_bsaber_button(song_hash),
			generate_beatsaver_button(song_hash, "large"),
			generate_oneclick_button(song_hash, "large")
		));
}

// ** Wide table ***

export function setup_wide_table_checkbox(): void {
	if (!is_user_page()) { return; }

	const table = check(document.querySelector("table.ranking.songs"));

	table.insertAdjacentElement("beforebegin", create("input", {
		id: "wide_song_table_css",
		type: "checkbox",
		style: { display: "none" },
		checked: get_wide_table(),
	}));
}

// ** Link util **

export function setup_user_rank_link_swap(): void {
	if (!is_user_page()) { return; }

	const elem_global = check(document.querySelector<HTMLAnchorElement>(".content div.columns ul li a"));
	const res_global = check(g.leaderboard_rank_reg.exec(elem_global.innerText));
	const number_global = number_invariant(res_global[1]);
	elem_global.href = g.scoresaber_link + "/global/" + rank_to_page(number_global, g.user_per_page_global_leaderboard);
}

export function setup_song_rank_link_swap(): void {
	if (!is_user_page()) { return; }

	const song_elems = document.querySelectorAll("table.ranking.songs tbody tr");
	for (const row of song_elems) {
		const rank_elem = check(row.querySelector(".rank"));
		// there's only one link, so 'a' will find it.
		const leaderboard_link = check(row.querySelector<HTMLAnchorElement>("th.song a")).href;
		const rank = number_invariant(rank_elem.innerText.slice(1));
		const rank_str = rank_elem.innerText;
		rank_elem.innerHTML = "";
		into(rank_elem,
			create("a", {
				href: `${leaderboard_link}?page=${rank_to_page(rank, g.user_per_page_song_leaderboard)}`
			}, rank_str)
		);
	}
}

function rank_to_page(rank: number, ranks_per_page: number): number {
	return Math.floor((rank + ranks_per_page - 1) / ranks_per_page);
}
