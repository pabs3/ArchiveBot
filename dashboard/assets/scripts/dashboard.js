/**
 * This file should be formatted with
 * rome check dashboard/assets/scripts/dashboard.js --apply-unsafe --line-width 120
 */

"use strict";

String.prototype.removePrefix = function (prefix) {
    return this.startsWith(prefix) ? this.substr(prefix.length) : this.toString();
};

// FIXME: add HTMLAnchorElement searchParams object instead
HTMLAnchorElement.prototype.setSearchParam = function (key, value) {
	const search = new URLSearchParams(this.search);
	search.set(key, value);
	this.search = search;
}

// FIXME: add HTMLAnchorElement searchParams object instead
HTMLAnchorElement.prototype.deleteSearchParam = function (key, value) {
	const search = new URLSearchParams(this.search);
	search.delete(key, value);
	this.search = search;
}

function assert(condition, message) {
	if (!condition) {
		throw message || "Assertion failed";
	}
}

function byId(id) {
	return document.getElementById(id);
}

function text(s) {
	return document.createTextNode(s);
}

/**
 * Adaptation of ActiveSupport's #blank?.
 *
 * Returns true if the object is undefined, null, or is a string whose
 * post-trim length is zero.  Otherwise, returns false.
 */
function isBlank(o) {
	return !o || o.trim().length === 0;
}

/**
 * appendChild but accepts strings and arrays of children|strings
 */
function appendAny(e, thing) {
	if (Array.isArray(thing)) {
		for (const item of thing) {
			appendAny(e, item);
		}
	} else if (typeof thing === "string") {
		e.appendChild(text(thing));
	} else {
		if (thing == null) {
			throw Error(`thing is ${JSON.stringify(thing)}`);
		}
		e.appendChild(thing);
	}
}

/**
 * Create DOM element with attributes and children from Array<node|string>|node|string
 */
function h(elem, attrs, thing) {
	const e = document.createElement(elem);
	if (attrs != null) {
		for (const attr in attrs) {
			if (attr === "spellcheck" || attr === "readonly") {
				e.setAttribute(attr, attrs[attr]);
			} else if (attr === "class") {
				throw new Error("Did you mean className?");
			} else {
				e[attr] = attrs[attr];
			}
		}
	}
	if (thing != null) {
		appendAny(e, thing);
	}
	return e;
}

function removeChildren(elem) {
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild);
	}
}

function addPageStyles(cssText) {
	const style = document.createElement("style");
	style.innerHTML = cssText;
	document.body.appendChild(style);
}

function prettyJson(obj) {
	return JSON.stringify(obj, undefined, 2);
}

function matchParentElement(elem, skip, attr, regex) {
		while (elem !== document && elem !== null) {
			if (skip-- <= 0 && elem.hasAttribute(attr)) {
				const match = regex.exec(elem.getAttribute(attr));
				if (match !== null) return [elem, ...match.slice(1)];
			}
			elem = elem.parentElement;
		};
		return [null, null];
	}

// Copied from Coreweb/js_coreweb/cw/string.js
/**
 * Like Python's s.split(delim, num) and s.split(delim)
 * This does *NOT* implement Python's no-argument s.split()
 *
 * @param {string} s The string to split.
 * @param {string} sep The separator to split by.
 * @param {number} maxsplit Maximum number of times to split.
 *
 * @return {!Array.<string>} The splitted string, as an array.
 */
function split(s, sep, maxsplit) {
	assert(typeof sep === "string", "arguments[1] of split must be a separator string");
	if (maxsplit === undefined || maxsplit < 0) {
		return s.split(sep);
	}
	const pieces = s.split(sep);
	const head = pieces.splice(0, maxsplit);
	// after the splice, pieces is shorter and no longer has the `head` elements.
	if (pieces.length > 0) {
		const tail = pieces.join(sep);
		head.push(tail); // no longer just the head.
	}
	return head;
}

// Based on closure-library's goog.string.regExpEscape
function regExpEscape(s) {
	let escaped = String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
	if (s.indexOf("[") === -1 && s.indexOf("]") === -1) {
		// If there were no character classes, there can't have been any need
		// to escape -, to unescape them.
		escaped = escaped.replace(/\\-/g, "-");
	}
	return escaped;
}

function extractTextValues(text, regex) {
	const match = regex.exec(text);
	return match === null ? []: match.slice(1);
}

function scrollToBottom(elem) {
	// Scroll to the bottom. To avoid serious performance problems in Firefox,
	// use a big number instead of elem.scrollHeight.
	elem.scrollTop = 999999;
}

/**
 * Returns a function that gets the given property on any object passed in
 */
function prop(name) {
	return (obj) => obj[name];
}

/**
 * Returns a function that adds the given class to any element passed in
 */
function classAdder(name) {
	return (elem) => elem.classList.add(name);
}

/**
 * Returns a function that removes the given class to any element passed in
 */
function classRemover(name) {
	return (elem) => elem.classList.remove(name);
}

function removeFromArray(arr, item) {
	const idx = arr.indexOf(item);
	if (idx !== -1) {
		arr.splice(idx, 1);
	}
}

/*** End of utility code ***/

// FIXME: update the backend instead
// /logs/recent job data has several differences to WebSocket job data
// some of both /logs/recent and WebSocket data uses strings instead of bool
const recent_copy_back = ["no_offsite_links", "user_agent", "slug", "url_file", "started_at"];
// https://github.com/ArchiveTeam/ArchiveBot/issues/304
const recent_rename = {fetch_depth: "depth"};
const recent_to_bool = ["suppress_ignore_reports"];
const websocket_to_bool = ["no_offsite_links", "suppress_ignore_reports", "abort_requested", "aborted"];
const recent_delete_null = ["finished_at", "note"];
const recent_delete_false = ["aborted", "finished"];
const recent_to_string = [
	"bytes_downloaded",
	"concurrency",
	"delay_max",
	"delay_min",
	"error_count",
	"items_downloaded",
	"items_queued",
	"queued_at",
	"r1xx",
	"r2xx",
	"r3xx",
	"r4xx",
	"runk",
	"started_at",
	"warc_size",
];
const changedHighlight = {
	concurrency: ".job-connections",
	delay_min: ".job-delay",
	delay_max: ".job-delay",
	started_by: ".job-nick",
	fetch_depth: ".job-type",
	url_file: ".job-type",
	note: ".job-note",
	started_at: ".job-started",
	queued_at: ".job-started",
	pipeline_id: ".job-pipeline",
	suppress_ignore_reports: ".job-ignores",
};
const changedShow = {
	"started_in": "IRC",
	"user_agent": "UA",
	"note": "note",
	"no_offsite_links": "offsite",
};

class JobsTracker {
	static #tracked = {
		"url": "https://digital.katalog.queersearch.org/",
		"fetch_depth": "inf",
		"user_agent": "",
		//"slug": "digital.katalog.queersearch.org-inf",
		"started_by": "c3manu",
		"started_in": "#archivebot",
		"delay_min": "250",
		"delay_max": "375",
//		"settings_age": "6", FIXME: use this to signal ignore changes?
		"concurrency": "3",
		"note": "proactive",
		"suppress_ignore_reports": "true",
		"queued_at": "1759430682",
		"started_at": "1759430685.166338",
		"pipeline_id": "pipeline:fdf7050af2a290e3cdd42947358ee578",
		"no_offsite_links": "true",
//		"error_count": "58",
//		"death_timer": "0",
	};

	constructor() {
		this.known = {};
		this.sorted = [];
		this.history = {};
		this.finishedArray = [];
		this.finishedSet = {};
		this.fatalExceptionSet = {};
	}

	countActive() {
		return this.sorted.length - this.finishedArray.length;
	}

	resort() {
		this.sorted.sort((a, b) => (a.started_at > b.started_at ? -1 : 1));
	}

	/**
	 * Returns true if a new job was added
	 */
	handleJobData(jobData, recent) {
		const ident = jobData.ident;
		const alreadyKnown = ident in this.known;
		let jobDataChanged = [];
		if (!alreadyKnown) {
			this.known[ident] = true;
			this.sorted.push(jobData);
			this.resort();
			this.history[ident] = [jobData];
			this.history[ident][0]._recent = recent;
		} else {
			// FIXME: update the backend instead
			// /logs/recent job data has missing/reduced items
			// so at the transition from recent to live data
			// copy them back to the last recent data item
			// since they were probably the same then
			// despite not being transmitted then
			if (!recent && this.history[ident][0]._recent) {
				for (const key of recent_copy_back) {
					if (key in jobData) {
						this.history[ident][0][key] = jobData[key];
					}
				}
			}
			for (const key of Object.keys(JobsTracker.#tracked)) {
				if (jobData[key] !== this.history[ident][0][key]) {
					jobDataChanged.push(key);
				}
			}
			if (jobDataChanged.length !== 0){
				/*
				let log = `${ident} `;
				for (const key of jobDataChanged) {
					log += `${key} ${this.history[ident][0][key]} => ${jobData[key]}, `;
				}
				console.log(log);
				*/
				this.history[ident].unshift(jobData);
			}
		}
		return [!alreadyKnown, jobDataChanged];
	}

	markFinished(ident) {
		if (!(ident in this.finishedSet)) {
			this.finishedSet[ident] = true;
			this.finishedArray.push(ident);
		}
	}

	markUnfinished(ident) {
		if (ident in this.finishedSet) {
			delete this.finishedSet[ident];
			removeFromArray(this.finishedArray, ident);
		}
		// Job was restarted, so unmark fatal exception
		if (ident in this.fatalExceptionSet) {
			delete this.fatalExceptionSet[ident];
		}
	}

	markFatalException(ident) {
		this.fatalExceptionSet[ident] = true;
	}

	hasFatalException(ident) {
		return ident in this.fatalExceptionSet;
	}
}

class JobRenderInfo {
	constructor(logWindow, logSegment, statsElements, jobType, jobUrl, jobNote, lineCountWindow, lineCountSegments) {
		this.logWindow = logWindow;
		this.logSegment = logSegment;
		this.statsElements = statsElements;
		this.jobType = jobType;
		this.jobUrl = jobUrl;
		this.jobNote = jobNote;
		this.lineCountWindow = lineCountWindow;
		this.lineCountSegments = lineCountSegments;
	}
}

const Reusable = {
	obj_className_line_normal: { className: "line-normal" },
	obj_className_line_error: { className: "line-error" },
	obj_className_line_warning: { className: "line-warning" },
	obj_className_line_redirect: { className: "line-redirect" },
	//
	obj_className_line_ignore: { className: "line-ignore" },
	obj_className_line_stdout: { className: "line-stdout" },
	obj_className_bold: { className: "bold" },
};

// http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(s_or_n) {
	return `${s_or_n}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toStringTenths(n) {
	let s = `${Math.round(10 * n) / 10}`;
	if (s !== "NaN" && s.indexOf(".") === -1) {
		s += ".0";
	}
	return s;
}

function getTotalResponses(jobData) {
	return (
		parseInt(jobData.r1xx) +
		parseInt(jobData.r2xx) +
		parseInt(jobData.r3xx) +
		parseInt(jobData.r4xx) +
		parseInt(jobData.r5xx) +
		parseInt(jobData.runk)
	);
}

function getSummaryResponses(jobData) {
	return `1xx: ${numberWithCommas(jobData.r1xx)}
2xx: ${numberWithCommas(jobData.r2xx)}
3xx: ${numberWithCommas(jobData.r3xx)}
4xx: ${numberWithCommas(jobData.r4xx)}
5xx: ${numberWithCommas(jobData.r5xx)}
Unknown: ${numberWithCommas(jobData.runk)}`;
}

//
// Has to use classList because of unrelated classes
class JobStatus {
	static #prefix = "job-info-"; // FIXME: const with ES7

	constructor(classList) {
		this.classList = classList;
	}

	get() {
		const [status] = [...this.classList].flatMap((i) => {
			return i.startsWith(JobStatus.#prefix) ? [i.substr(JobStatus.#prefix.length)] : [];
		});
		if (!status) return "running";
		return status;
	}

	unset() {
		const status_classes = [...this.classList].filter((i) => i.startsWith(JobStatus.#prefix));
		if (status_classes.length) {
			this.classList.remove(status_classes);
		}
	}

	set(status) {
		this.unset();
		if (status !== "running") {
			this.classList.add(JobStatus.#prefix + status);
		}
	}
}

const EOL = /[\r\n]+$/;

const logContainerIdent = /^log-container-(.*)/;
const logWindowIdent = /^log-window-(.*)/;
const logLineType = /^line-(.*)/;

const filterGetDomain = /^\(\?-i\:\^https?\:\/\/([^\/:]+)\/.*\$\)$/;

const lineInvalidPattern = /^Pattern (.*) is invalid \(error: (.*)\)\.  Ignored\.$/;
const lineERRORFetching = /^ERROR Fetching ‘([^’]+)’ encountered an error: (.*)$/;
const lineSettingsUpdated = /^Settings updated: +(\d+) workers, (\d+) ignores, delay min\/max: \[(\d+), (\d+)\] ms(, suppressing ignore reports)$/;

const lineFatal = /^CRITICAL (?:Sorry|Please report)|^ERROR Fatal exception\.$|^Traceback \(most recent call last\):$|No space left on device|^Fatal Python error:|^(?:Thread|Current thread) 0x/;
const lineAbortedItem = /Script requested immediate stop|^Adjusted target WARC path to.*-aborted$/;
const lineZeroBytes = /^ *0 bytes\.$/;
const lineSomeBytes = /^ *([1-9][0-9]*) bytes\.$/
// Check for several completion messages
// because some of them are often missing (FIXME)
const lineFinishedItem = /^Starting (RelabelIfAborted|CompressLogIfNoMetaWarc|StopHeartbeat|MarkItemAsDone) for Item *$|^Finished (WgetDownload|CompressLogIfNoMetaWarc|StopHeartbeat) for Item *$/;
const lineReceivedItem = /^Received item ([0-9a-z]{23,})\.$/;
const lineStartingItem = /^(?:Starting|Finished) (StartHeartbeat|SetFetchDepth|PreparePaths|WriteInfo) for Item *$/;
const lineDownloadItem = /^Starting (DownloadUrlFile|WgetDownload) for Item *$/
const lineQueuedItem = /^Queued (.*) as item ([0-9a-z]{23,}) to (pending:.*)\.$/;

class JobsRenderer {
	constructor(container, filterBox, historyLines, showNicks, contextMenuRenderer) {
		this.container = container;
		this.filterBox = filterBox;
		this.filterTimeout = null;
		this.filterBox.onchange = (e) => {
			const repeats = [
					"insertText",
					"deleteContent",
					"deleteContentForward",
					"deleteContentBackward",
			];
			let ms = e && e.inputType && repeats.includes(e.inputType) ? 100 : 0;
			ms = !this.filterBox.value ? 0 : ms;
			clearTimeout(this.filterTimeout);
			this.filterTimeout = setTimeout(() => {
				clearTimeout(this.filterTimeout);
				if (this.filterBox.value !== this.filterBox.old) {
					this.applyFilter();
					this.filterBox.old = this.filterBox.value;
					if (this.filterBox.value && this.filterBox.value !== "^$") {
						byId("alt").setSearchParam("initialFilter", this.filterBox.value);
						byId("beta").setSearchParam("initialFilter", this.filterBox.value);
						const domainFilter = this.filterBox.value.replace(filterGetDomain, "$1");
						byId("crawls-finished").setSearchParam("initialFilter", domainFilter);
						byId("crawls-viewer").setSearchParam("q", domainFilter);
					} else {
						byId("alt").deleteSearchParam("initialFilter");
						byId("beta").deleteSearchParam("initialFilter");
						byId("crawls-finished").deleteSearchParam("initialFilter");
						byId("crawls-viewer").deleteSearchParam("q");
					}
				}
			}, ms);
		};
		this.filterBox.oninput = this.filterBox.onchange;
		this.filterBox.onkeypress = (ev) => {
			// Don't let `j` or `k` in the filter box cause the job window to switch
			ev.stopPropagation();
		};
		this.historyLines = historyLines;
		this.showNicks = showNicks;
		this.contextMenuRenderer = contextMenuRenderer;
		this.linesPerSegment = Math.max(1, Math.round(this.historyLines / 10));
		this.jobs = new JobsTracker();
		// ident -> JobRenderInfo
		this.renderInfo = {};
		this.mouseInside = null;
		this.numCrawls = byId("num-crawls");
		this._aligned = true;
		this.pipelines = {};
	}

	_getNextJobInSorted(ident) {
		for (let i = 0; i < this.jobs.sorted.length; i++) {
			const e = this.jobs.sorted[i];
			if (e.ident === ident) {
				return this.jobs.sorted[i + 1];
			}
		}
		return null;
	}

	_createLogSegment() {
		return h("div");
	}

	updatePipelines(pipelines) {
		this.pipelines = pipelines;
		for (const jobData of this.jobs.sorted) {
			const pipeline = this.renderInfo[jobData.ident].statsElements.pipeline;
			[pipeline.textContent, pipeline.title] = this.jobPipelineInfo(jobData);
		}
	}

	_createLogContainer(jobData) {
		const ident = jobData.ident;
		const beforeJob = this._getNextJobInSorted(ident);
		const beforeElement = beforeJob == null ? null : byId(`log-container-${beforeJob.ident}`);

		const logSegment = this._createLogSegment();

		const logWindowAttrs = {
			className: "log-window",
			id: `log-window-${ident}`,
			onmouseenter: (ev) => {
				this.mouseInside = ident;
				ev.target.classList.add("log-window-stopped");
			},
			onmouseleave: (ev) => {
				const leave = () => {
					this.mouseInside = null;
					ev.target.classList.remove("log-window-stopped");
				};
				// When our custom context menu pops up, it causes onmouseleave on the
				// log window, so make our leave callback fire only after the context
				// menu is closed.
				if (this.contextMenuRenderer.visible) {
					this.contextMenuRenderer.callAfterBlur(leave);
				} else {
					leave();
				}
			},
		};

		const logWindow = h("div", logWindowAttrs, logSegment);

		const [jobHeader, statsElements, jobType, jobUrl, jobNote] = this._createJobHeader(jobData);

		const div = h("div", { className: "log-container", id: `log-container-${ident}` }, [
			h("details", { className: "job-history" }, [
				h("summary", {
					className: "job-history-summary",
					ariaDisabled: "true",
					onclick: (ev) => {
						if (this.ariaDisabled === "true" || ev.target !== ev.currentTarget) {
							// Ignore click events when no history or for child elements
							return false;
						}
					},
				}, [
					jobHeader,
				]),
			]),
			logWindow,
		]);

		this.renderInfo[ident] = new JobRenderInfo(logWindow, logSegment, statsElements, jobType, jobUrl, jobNote, 0, [0]);
		this.container.insertBefore(div, beforeElement);
		// Filter hasn't changed, but we might need to filter out the new job, or
		// add/remove log-window-expanded class
		this.applyFilter();
	}

	jobTypeText(jobData) {
		return (jobData.fetch_depth === "shallow" ? "!ao" : jobData.fetch_depth === "inf" ? "!a" : "?") + ("url_file" in jobData ? " <" : "");
	}

	jobOptionsTitle(jobData) {
		let title = []
		// FIXME: get the user_agent alias too
		if ("user_agent" in jobData && jobData.user_agent)
			title.push(`User-Agent: ${jobData.user_agent}`);
		if ("no_offsite_links" in jobData && jobData.no_offsite_links)
			title.push("No offsite links");
		title.push("Right click to copy archive command.");
		return title.join("\n");
	}

	jobStartedInfo(jobData) {
		const queuedISOString = new Date(parseFloat(jobData.queued_at) * 1000).toISOString();
		const startedISOString = new Date(parseFloat(jobData.started_at) * 1000).toISOString();
		let ISOString = "?";
		let ISOStringTitle = [];
		if ("queued_at" in jobData){
			ISOString = queuedISOString;
			ISOStringTitle.push(`queued ${queuedISOString}`);
		}
		if ("started_at" in jobData){
			ISOString = startedISOString;
			ISOStringTitle.push(`started ${startedISOString}`);
		}
		return [
			ISOString.split("T")[0].substr(5),
			ISOStringTitle.join("\n"),
		];
	}

	jobNickInfo(jobData) {
		if (this.showNicks) {
			return [
				` by ${jobData.started_by}`,
				jobData.started_by,
			];
		} else {
			return ["", ""];
		}
	}

	jobNoteText(jobData) {
		return isBlank(jobData.note) ? "" : ` (${jobData.note})`
	}

	jobNoteUrlTitle(jobData, jobUrl) {
		if (isBlank(jobData.note)) {
			jobUrl.removeAttribute("title");
		} else {
			jobUrl.title = jobData.note;
		}
	}

	jobDelayText(jobData) {
		const delayMin = parseInt(jobData.delay_min);
		const delayMax = parseInt(jobData.delay_max);
		return `${delayMin === delayMax ? delayMin : `${delayMin}-${delayMax}`} ms delay`;
	}

	jobPipelineInfo(jobData) {
		const pipelineId = jobData.pipeline_id;
		const pipelineIdOnly = pipelineId.removePrefix("pipeline:");
		const pipelineNick = this.pipelines[pipelineId];
		return [
			pipelineNick ?? pipelineIdOnly,
			`pipeline ${pipelineNick ?? "unknown"} ${pipelineIdOnly}`,
		]
	}

	_createJobHeader (jobData) {
		const ident = jobData.ident;

		const maybeAligned = (className) => {
			let s = className;
			if (this._aligned) {
				s += ` ${className}-aligned`;
			}
			return s;
		};

		const [pipelineText, pipelineTitle] = this.jobPipelineInfo(jobData);

		const statsElements = {
			mb: h("span", { className: `inline-stat ${maybeAligned("job-mb")}` }, "?"),
			responses: h("span", { className: `inline-stat ${maybeAligned("job-responses")}` }, "?"),
			responsesPerSecond: h("span", { className: `inline-stat ${maybeAligned("job-responses-per-second")}` }, "?"),
			queueLength: h("span", { className: `inline-stat ${maybeAligned("job-in-queue")}` }, "? in q."),
			connections: h("span", {
				className: `inline-stat ${maybeAligned("job-connections")}`,
				title: "Right click to copy !con command",
			}, jobData.concurrency),
			delay: h("span", {
				className: `inline-stat ${maybeAligned("job-delay")}`,
				title: "Right click to copy !d command",
			}, this.jobDelayText(jobData)),
			ignores: h("a", {
				className: "job-ignores" + (jobData.suppress_ignore_reports ? " job-igoff" : ""),
				href: `//archivebot.com/ignores/${ident}?compact=true`,
				onclick: (ev) => { ev.stopPropagation(); },
				title: "Click to open ignores for this job in a new tab.\nRight click to copy ignores related commands.",
			}, jobData.suppress_ignore_reports ? "igoff" : "igon" ),
			pipeline: h("a", {
				className: `inline-stat ${maybeAligned("job-pipeline")}`,
				href: `//archivebot.com/pipelines?initialFilter=${jobData.pipeline_id}`,
				title: pipelineTitle,
				onclick: (ev) => { ev.stopPropagation(); },
			}, pipelineText),
			jobInfo: null /* set later */,
		};

		statsElements.delay.dataset.min = jobData.delay_min;
		statsElements.delay.dataset.max = jobData.delay_max;

		const jobType = h("span", {
			className: `inline-stat ${maybeAligned("job-type")}`,
			title: "Right click to copy archive command"
		}, [this.jobTypeText(jobData)]);

		const [startedText, startedTitle] = this.jobStartedInfo(jobData);

		const [nickText, nickTitle] = this.jobNickInfo(jobData);

		const jobNote = h("span", { className: maybeAligned("job-note") }, this.jobNoteText(jobData));

		statsElements.jobInfo = h("span", { className: "job-info" }, [
			jobType,
			" ",
			h("a", {
				className: `inline-stat ${maybeAligned("job-url")}`,
				href: jobData.url,
				onclick: (ev) => { ev.stopPropagation(); },
			}, jobData.url),
			// Clicking anywhere in this area will set the filter to a regexp that
			// matches only this job URL, thus hiding everything but this job.
			h(
				"span",
				{
					className: "stats-elements",
					onclick: (ev) => {
						const filter = ds.getFilter();
						if (RegExp(filter).test(jobData.url) && filter.startsWith("(?-i:^") && filter.endsWith("$)")) {
							// If we're already showing just this log window,
							// go to the previous filter, usually showing nothing.
							ds.setFilter(ds.previousFilter);
						} else {
							ds.setFilter(`(?-i:^${regExpEscape(jobData.url)}$)`);
						}
						ev.stopPropagation();
						ev.preventDefault();
					},
				},
				[
					h("span", { className: "job-options", title: this.jobOptionsTitle(jobData) }, " on "),
					h("span", { className: "inline-stat job-started", title: startedTitle }, startedText),
					h(
						"span", {
							className: `inline-stat ${maybeAligned("job-nick")}`,
							title: nickTitle,
						},
						nickText,
					),
					jobNote,
					"; ",
					statsElements.mb,
					" MB in ",
					statsElements.responses,
					" at ",
					statsElements.responsesPerSecond,
					"/s, ",
					statsElements.queueLength,
					"; ",
					statsElements.connections,
					h("span", { className: "job-connections-text" }, " con."), // For context menu
					" w/ ",
					statsElements.delay,
					"; ",
					statsElements.ignores,
					"; ",
					statsElements.pipeline,
				],
			),
		]);

		statsElements.jobInfo.querySelector(".job-connections-text").title = statsElements.connections.title;

		const jobUrl = statsElements.jobInfo.querySelector(".job-url");
		jobUrl.dataset.url = jobUrl.textContent;
		jobUrl.textContent = jobUrl.textContent.removePrefix("https://transfer.archivete.am/").removePrefix("/inline/");
		if (jobUrl.href !== jobUrl.textContent) {
			jobUrl.href = "https://transfer.archivete.am/inline/" + jobUrl.textContent;
			jobUrl.textContent = jobUrl.textContent.split("/", 2)[1];
		}
		this.jobNoteUrlTitle(jobData, jobUrl);

		const jobHeader = h("div", { className: "job-header" }, [statsElements.jobInfo, h("span", { className: "job-ident" }, ident)]);

		return [jobHeader, statsElements, jobType, jobUrl, jobNote];
	}

	_addJobHistoryHeader(dataTs, jobData, changed) {

		const maybeAligned = (className) => {
			let s = className;
			if (this._aligned) {
				s += ` ${className}-aligned`;
			}
			return s;
		};

		// Create a normal job header for the history, modified below
		const [jobHeader, statsElements, jobType, jobUrl, jobNote] = this._createJobHeader(jobData);
		const info = new JobRenderInfo(null, null, statsElements, jobType, jobUrl, jobNote, null, null);
		this.updateHeader(changed, info, jobData);

		// Clear the job type indicator if it hasn't changed
		// other the job history is slightly harder to notice
		if (!changed.includes("fetch_depth") && !changed.includes("url_file")) {
			const len = jobType.textContent.length + 1;
			jobType.textContent = " ".repeat(len);
		}

		// Remove the URL since it doesn't change
		jobUrl.remove();

		// Add the timestamp in place of the URL to keep the same layout
		const tsISOString = new Date(parseFloat(dataTs) * 1000).toISOString();
		const ts = h("span", { className: `inline-stat ${maybeAligned("job-ts")}` }, tsISOString);
		jobType.after(ts);
		jobType.after(" ");

		// The stats elements container is non-interactive as it is historical
		statsElements.jobInfo.querySelector(".stats-elements").onclick = undefined;
		statsElements.jobInfo.querySelector(".stats-elements").style.cursor = "initial";
		statsElements.jobInfo.querySelector(".stats-elements").style.backgroundColor = "initial";

		// Use background color to highlight some changed parameters
		for (const [change, element] of Object.entries(changedHighlight)) {
			if (changed.includes(change)){
				jobHeader.querySelector(element).style.background = "rgb(255 255 255 / 40%)";
			}
		}

		// Note down other changes in text format
		const changes_items = [];
		for (const [change, text] of Object.entries(changedShow)) {
			if (changed.includes(change)){
				changes_items.push(`${text} ${jobData[change]} -> ${this.jobs.history[jobData.ident][0][change]}`)
			}
		}
		if (changes_items.length) {
			const changes = h("span", { className: "job-changes" });
			changes.textContent = changes_items.join(", ");
			changes.title = changes_items.join("\n");
			statsElements.jobInfo.append("; ");
			statsElements.jobInfo.append(changes);
		}

		// Remove the ident since it doesn't change
		jobHeader.querySelector(".job-ident").remove();

		// Enable job history and add the historical job header to the list
		const summary = byId(`log-container-${jobData.ident}`).querySelector(".job-history-summary");
		summary.removeAttribute("aria-disabled");
		summary.after(jobHeader);

	}

	_renderDownloadLine(data, logSegment) {
		let attrs;
		if (data.is_warning) {
			attrs = Reusable.obj_className_line_warning;
		} else if (data.is_error) {
			attrs = Reusable.obj_className_line_error;
		} else if (data.response_code && data.response_code >= 300 && data.response_code < 400) {
			attrs = Reusable.obj_className_line_redirect;
		} else {
			attrs = Reusable.obj_className_line_normal;
		}

		const url = data.url;
		// For testing a URL with characters that browsers like to escape, breaking the suggested ignores
		// url = "http://example.com/m/index.php/{$ibforums-%3Evars[TEAM_ICON_URL]}/t82380.html^hi";
		logSegment.appendChild(
			h("div", attrs, [`${data.response_code} ${data.wget_code} `, h("a", { href: url, className: "log-url" }, url)]),
		);

		logSegment.lastChild.title = new Date(data.ts * 1000).toISOString();
		logSegment.lastChild.title += "\nline: download, " + logSegment.lastChild.className.removePrefix("line-");

		return 1;
	}

	_renderIgnoreLine(data, logSegment) {
		const attrs = Reusable.obj_className_line_ignore;
		const source = data.source;
		let ignoreSpan;

		if (source != null) {
			ignoreSpan = h("span", null, ` IGNOR (${source}): `);
		} else {
			ignoreSpan = h("span", null, " IGNOR ");
		}

		logSegment.appendChild(
			h("div", attrs, [
				ignoreSpan,
				h("a", { href: data.url, className: "ignore-url" }, data.url),
				h("span", Reusable.obj_className_bold, " by "),
				h("span", { className: "ignore-pattern"}, data.pattern),
			]),
		);

		logSegment.lastChild.title = new Date(data.ts * 1000).toISOString();
		logSegment.lastChild.title += "\nline: ignore";

		return 1;
	}

	_renderStdoutLine(data, logSegment, info, ident) {
		const jobData = data.job_data;
		const cleanedMessage = data.message.replace(EOL, "");
		let renderedLines = 0;
		if (!cleanedMessage) {
			return renderedLines;
		}
		const lines = cleanedMessage.split("\n");
		for (const line of lines) {
			if (!line) {
				continue;
			}
			logSegment.appendChild(h("div", Reusable.obj_className_line_stdout, line));
			renderedLines += 1;

			logSegment.lastChild.title = new Date(data.ts * 1000).toISOString();
			logSegment.lastChild.title += "\nline: stdout";

			let ignores, pattern, url, error;

			[, ignores, , ] = extractTextValues(line, lineSettingsUpdated);

			[pattern, error] = extractTextValues(line, lineInvalidPattern);
			if (pattern && error){
				info.statsElements.ignores.classList.add("job-ignores-error");
				if (!("ignores_errors" in info))
					info.ignores_errors = new Set();
				info.ignores_errors.add([pattern, error]);
			}

			[url, error] = extractTextValues(line.textContent, lineERRORFetching);
			if (url) {
				const link = h("a", { href: url, className: "log-url" }, url);
				const parts = logSegment.lastChild.textContent.split(url);
				parts.splice(1, 0, link);
				logSegment.lastChild.replaceChildren(...parts);
			}

			let status = new JobStatus(info.statsElements.jobInfo.classList);

			if (lineFatal.test(line)) {
				status.set("fatal");
				this.jobs.markFatalException(ident);
			} else if (
				lineAbortedItem.test(line) ||
				(
					("aborted" in jobData) &&
					jobData.aborted === true
				)
			) {
				status.set("aborted");
			} else if (lineZeroBytes.test(line)) {
				status.set("failed");
				this.jobs.markFinished(ident);
			} else if (
				!["fatal", "aborted", "failed"].includes(status.get()) &&
				(
					lineSomeBytes.test(line) ||
					lineFinishedItem.test(line) ||
					(
						("finished" in jobData) &&
						jobData.finished === true
					) || (
						("finished_at" in jobData) &&
						jobData.finished_at !== null
					)
				)
			) {
				status.set("done");
				this.jobs.markFinished(ident);
			} else if (
				lineReceivedItem.test(line) ||
				lineDownloadItem.test(line) ||
				lineStartingItem.test(line) ||
				(
					!["fatal", "aborted", "failed", "done"].includes(status.get()) &&
					(
						("started_at" in jobData) &&
						jobData.started_at !== null
					)
				)
			) {
				status.set("running");
				this.jobs.markUnfinished(ident);
			} else if (
				lineQueuedItem.test(line) ||
				(
					!["fatal", "aborted", "failed", "done", "running"].includes(status.get()) &&
					(
						("queued_at" in jobData) &&
						jobData.queued_at !== null
					)
				)
			) {
				status.set("queued");
			}

			logSegment.lastChild.title += `, ${status.get()}`;
		}
		return renderedLines;
	}

	handleData(data, recent) {
		const jobData = data.job_data;
		const ident = jobData.ident;
		const [added, changed] = this.jobs.handleJobData(jobData, recent);
		this.numCrawls.textContent = this.jobs.countActive();
		if (added) {
			this._createLogContainer(jobData);
		} else if (changed.length) {
			this._addJobHistoryHeader(data.ts, this.jobs.history[ident][1], changed);
		}

		const info = this.renderInfo[ident];
		if (!info) {
			console.warn(`No render info for ${ident}`);
			return;
		}

		this.updateHeader(changed, info, jobData);
		this.updateLogs(ident, info, data);
	}

	updateHeader(changed, info, jobData) {

		// Update stats
		info.statsElements.mb.textContent = numberWithCommas(
			toStringTenths((parseInt(jobData.bytes_downloaded) / (1000 * 1000)).toString()),
		);
		const totalResponses = parseInt(getTotalResponses(jobData));
		info.statsElements.responses.textContent = `${numberWithCommas(totalResponses)} resp.`;
		info.statsElements.responses.title = getSummaryResponses(jobData);
		const duration = Date.now() / 1000 - parseFloat(jobData.started_at);
		info.statsElements.responsesPerSecond.textContent = toStringTenths(totalResponses / duration);

		if (jobData.items_queued && jobData.items_downloaded) {
			const totalQueued = parseInt(jobData.items_queued, 10);
			const totalDownloaded = parseInt(jobData.items_downloaded, 10);
			info.statsElements.queueLength.textContent = numberWithCommas(`${totalQueued - totalDownloaded} in q.`);
			info.statsElements.queueLength.title = `${numberWithCommas(totalQueued)} queued\n${numberWithCommas(
				totalDownloaded,
			)} downloaded`;
		}

		if (changed.includes("concurrency")) {
			info.statsElements.connections.textContent = jobData.concurrency;
		}

		if (["delay_min", "delay_max"].some((i) => changed.includes(i))) {
			info.statsElements.delay.textContent = this.jobDelayText(jobData);
			info.statsElements.delay.dataset.min = jobData.delay_min;
			info.statsElements.delay.dataset.max = jobData.delay_max;
		}

		if (changed.includes("suppress_ignore_reports")){
			if (jobData.suppress_ignore_reports) {
				info.statsElements.ignores.textContent = "igoff";
				if (!info.statsElements.ignores.classList.contains("job-igoff")) {
					info.statsElements.ignores.classList.add("job-igoff");
				}
			} else {
				info.statsElements.ignores.textContent = "igon";
				if (info.statsElements.ignores.classList.contains("job-igoff")) {
					info.statsElements.ignores.classList.remove("job-igoff");
				}
			}
		}

		if (["fetch_depth", "url_file"].some((i) => changed.includes(i))) {
			// Update job type in case a job is restarted in another way
			// FIXME: also because the url_file is not present in /logs/recent
			info.jobType.textContent = this.jobTypeText(jobData);
		}

		if (["queued_at", "started_at"].some((i) => changed.includes(i))) {
			// Update started info in case a job is restarted
			const jobStarted = info.statsElements.jobInfo.querySelector(".job-started");
			[jobStarted.textContent, jobStarted.title] = this.jobStartedInfo(jobData);
		}

		if (changed.includes("started_by")){
			// Update started by info in case a job is restarted
			const jobNick = info.statsElements.jobInfo.querySelector(".job-nick");
			[jobNick.textContent, jobNick.title] = this.jobNickInfo(jobData);
		}

		if (changed.includes("note")){
			// Update note
			info.jobNote.textContent = this.jobNoteText(jobData);
			this.jobNoteUrlTitle(jobData, info.jobUrl);
		}

		if (changed.includes("pipeline_id")){
			// Update pipeline in case a job is restarted on another pipline
			const jobPipeline = info.statsElements.pipeline;
			[jobPipeline.textContent, jobPipeline.title] = this.jobPipelineInfo(jobData);
		}
	}

	updateLogs(ident, info, data) {
		const type = data.type;

		let linesRendered;
		if (type === "download") {
			linesRendered = this._renderDownloadLine(data, info.logSegment);
		} else if (type === "stdout") {
			linesRendered = this._renderStdoutLine(data, info.logSegment, info, ident);
		} else if (type === "ignore") {
			linesRendered = this._renderIgnoreLine(data, info.logSegment);
		} else {
			assert(false, `Unexpected message type ${type}`);
		}

		info.lineCountWindow += linesRendered;
		info.lineCountSegments[info.lineCountSegments.length - 1] += linesRendered;

		if (info.lineCountSegments[info.lineCountSegments.length - 1] >= this.linesPerSegment) {
			//console.log("Created new segment", info);
			const newSegment = this._createLogSegment();
			info.logWindow.appendChild(newSegment);
			info.logSegment = newSegment;
			info.lineCountSegments.push(0);
		}

		if (this.mouseInside !== ident) {
			// Don't remove any scrollback information when the job has a fatal exception,
			// so that the user can find the traceback and report a bug.
			if (!this.jobs.hasFatalException(ident)) {
				// We may have to remove more than one segment, if the user
				// has paused the log window for a while.
				while (info.lineCountWindow >= this.historyLines + this.linesPerSegment) {
					const firstLogSegment = info.logWindow.firstChild;
					assert(
						firstLogSegment != null,
						`info.logWindow.firstChild is null; ${JSON.stringify({
							lineCountWindow: info.lineCountWindow,
							lineCountSegments: info.lineCountSegments,
						})}`,
					);
					info.logWindow.removeChild(firstLogSegment);
					info.lineCountWindow -= info.lineCountSegments[0];
					info.lineCountSegments.shift();
				}
			}

			// If hidden, don't scroll: this saves us reflows and half our CPU time in Firefox.
			if (!info.logWindow.classList.contains("log-window-hidden")) {
				scrollToBottom(info.logWindow);
			}
		}
	}

	applyFilter() {
		const query = RegExp(this.filterBox.value, "i");
		let matches = 0;
		const matchedWindows = [];
		const unmatchedWindows = [];
		this.firstFilterMatch = null;
		for (const job of this.jobs.sorted) {
			const w = this.renderInfo[job.ident].logWindow;
			const show =
			(byId("filter-job-id").checked && query.test(job.ident)) ||
			(byId("filter-job-url").checked && query.test(job.url)) ||
			(byId("filter-job-note").checked && query.test(job.note)) ||
			(byId("filter-job-pipeline").checked && (query.test(job.pipeline_id) || query.test(this.pipelines[job.pipeline_id]))) ||
			(this.showNicks && byId("filter-job-nick").checked && query.test(job.started_by));
			if (!show) {
				w.classList.add("log-window-hidden");

				unmatchedWindows.push(w);
			} else {
				w.classList.remove("log-window-hidden");

				matches += 1;
				matchedWindows.push(w);
				if (this.firstFilterMatch == null) {
					this.firstFilterMatch = job;
				}
			}
		}

		// If there's only one visible log window, expand it so that more lines are visible.
		unmatchedWindows.map(classRemover("log-window-expanded"));
		matchedWindows.map(classRemover("log-window-expanded"));
		if (matches === 1) {
			matchedWindows.map(classAdder("log-window-expanded"));
		}

		if (matches < this.jobs.sorted.length) {
			// If you're not seeing all of the log windows, you're probably seeing very
			// few of them, so you probably want alignment enabled.
			this.setAligned(true);
		} else {
			// You're seeing all of the log windows, so alignment doesn't help as much
			// as seeing the full info.
			this.setAligned(false);
		}

		// Hidden log windows aren't scrolled down while lines are added to them,
		// but now that more are visible, we need to scroll them to the bottom.
		for (const w of matchedWindows) {
			// Don't scroll log windows we're mousing over
			if (w.classList.contains("log-window-stopped")) {
				continue;
			}
			scrollToBottom(w);
		}
	}


	showNextPrev(offset) {
		let idx;
		if (this.firstFilterMatch == null) {
			idx = null;
		} else {
			idx = this.jobs.sorted.findIndex((el) => {
				return el.ident === this.firstFilterMatch.ident;
			});
		}
		if (idx == null) {
			// If no job windows are shown, set up index to make j show the first job window,
			// k the last job window.
			idx = this.jobs.sorted.length;
		}
		idx = idx + offset;
		// FIXME: ignore jobs not visible
		// When reaching either end, hide all job windows.  When going past
		// the end, wrap around.
		if (idx === -1) {
			idx = this.jobs.sorted.length;
		} else if (idx === this.jobs.sorted.length + 1) {
			idx = 0;
		}
		if (idx === this.jobs.sorted.length) {
			ds.setFilter("^$");
		} else {
			const newShownJob = this.jobs.sorted[idx];
			ds.setFilter(`(?-i:^${regExpEscape(newShownJob.url)}$)`);
		}
	}

	setAligned(aligned) {
		if (this._aligned === aligned) {
			return;
		}
		this._aligned = aligned;
		const adderOrRemover = aligned ? classAdder : classRemover;
		Array.from(document.querySelectorAll(".job-ts")).map(adderOrRemover("job-ts-aligned"));
		Array.from(document.querySelectorAll(".job-type")).map(adderOrRemover("job-type-aligned"));
		Array.from(document.querySelectorAll(".job-url")).map(adderOrRemover("job-url-aligned"));
		Array.from(document.querySelectorAll(".job-note")).map(adderOrRemover("job-note-aligned"));
		Array.from(document.querySelectorAll(".job-nick")).map(adderOrRemover("job-nick-aligned"));
		Array.from(document.querySelectorAll(".job-mb")).map(adderOrRemover("job-mb-aligned"));
		Array.from(document.querySelectorAll(".job-responses")).map(adderOrRemover("job-responses-aligned"));
		Array.from(document.querySelectorAll(".job-responses-per-second")).map(
			adderOrRemover("job-responses-per-second-aligned"),
		);
		Array.from(document.querySelectorAll(".job-in-queue")).map(adderOrRemover("job-in-queue-aligned"));
		Array.from(document.querySelectorAll(".job-connections")).map(adderOrRemover("job-connections-aligned"));
		Array.from(document.querySelectorAll(".job-delay")).map(adderOrRemover("job-delay-aligned"));
	}

	toggleAlign() {
		this.setAligned(!this._aligned);
	}
}

// FIXME: load all the regexes instead?
const igsetMap = {
	badvideos: "vp.nyt.com video1.nytimes.com videos.usatoday.net",
	blogs: "wordpress /wp- blogspot blogger.com livejournal dreamwidth tumblr",
	coppermine: "displayimage",
	dreamwidth: "dreamwidth livejournal",
	dspace6: "/discover? /search-filter? /simple-search? dateIssued_page=",
	facebook: "facebook.com fbcdn.net instagram.com meta.com threads.com",
	forums: "/viewtopic.php /showpost.php /profile.php",
	github: "github",
	mediawiki: "Special: Category: User: Property:",
	meetupeverywhere: "meetup.com",
	nosortedindex: "?C=",
	notumblrnotes: "tumblr",
	pinterest: "pinterest.com pinimg.com",
	reddit: "reddit.com redd.it",
	singletumblr: "tumblr",
}
/**
 * This context menu pops up when you right-click anywhere in
 * a log window, helping you copy an !ig command based on
 * the URL you right-clicked, and other useful commands.
 */
class ContextMenuRenderer {
	// FIXME: const with ES7
	static #log_classes = [
		// Job log window
		"log-window",
		// The line types
		"line-normal",
		"line-error",
		"line-warning",
		"line-redirect",
		"line-ignore",
		"line-stdout",
		// Parts of line-ignore
		"ignore-url",
		"bold",
		"ignore-pattern",
		// Part of line-{normal,error,warning,redirect}
		"log-url",
	];

	// FIXME: const with ES7
	static #line_log_url_types = [
		"normal",
		"error",
		"warning",
		"redirect",
	];

	constructor() {
		this.visible = false;
		this.callAfterBlurFns = [];
		this.element = byId("context-menu");
		this.maxSuggestedIgnores = 8;
	}

	makeCopyTextFn(text) {
		return () => {
			const clipboardScratchpad = byId("clipboard-scratchpad");
			clipboardScratchpad.value = text;
			clipboardScratchpad.focus();
			clipboardScratchpad.select();
			document.execCommand("copy");
		};
	}

	getPathVariants(fullPath) {
		const paths = [fullPath];
		// Avoid generating a near-duplicate suggestion with just the trailing slash removed
		let path = fullPath.replace(/\/$/, "");
		while (path && path.lastIndexOf("/") !== -1) {
			path = path.replace(/\/[^\/]*$/, "");
			paths.push(`${path}/`);
		}
		return paths;
	}

	getIgsetCommands(ident, url) {
		const commands = [];
		for (const [igset, includes] of Object.entries(igsetMap)) {
			if (includes.split(' ').some(i => url.includes(i))) {
				commands.push(`!igset ${ident} ${igset}`);
			}
		}
		return commands;
	}
	getPathIgnoreCommands(ident, url, maxSuggestedIgnores) {
		// For testing a URL with enough path segments to cause [N more ignore suggestions]
		// url = "https://example.com/asset/620787/liveblog/api/cms/modules/cms/modules/cms/modules/cms/modules/cms/modules/cms/modules/";
		const schema = url.split(":")[0];
		const domain = url.split("/")[2].split(":");
		const [withoutQuery, query] = url.split("?", 2);
		const path = `/${split(withoutQuery, "/", 3)[3]}`;
		const reSchema = schema.startsWith("http") ? "https?" : "ftp";
		const pathVariants = this.getPathVariants(path);

		let menuVariants = [];
		if (query) {
			menuVariants.push(`!ig ${ident} ^${reSchema}://${regExpEscape(domain + path + "?" + query)}$`);
		}
		menuVariants.push(...pathVariants.map((p) => {
			return `!ig ${ident} ^${reSchema}://${regExpEscape(domain + p)}`;
		}));
		if (!query) {
			menuVariants[0] += "$";
		}

		let somePathVariants = pathVariants.slice(-maxSuggestedIgnores);
		let ignoresRemaining = pathVariants.length - somePathVariants.length;
		// If only 1 more suggested ignore available, just put it in the context menu
		// to avoid a [... more ignore suggestions] taking up the same amount of space.
		if (ignoresRemaining === 1) {
			somePathVariants = pathVariants;
			ignoresRemaining = 0;
		}
		return [
			ignoresRemaining,
			menuVariants,
		];
	}

	makeEntry(entry) {
		entry.classList.add("context-menu-entry");
		appendAny(this.element, entry);
	}

	makePathStatusCommands(url) {
		const original_url = new URL(url);
		const domain = original_url.hostname;

		// FIXME: the URL API doesn't allow anything less than this
		const hostname_url = new URL('http://example.com/');
		hostname_url.protocol = original_url.protocol;
		hostname_url.hostname = original_url.hostname;
		this.makeCopyEntries(null, [`!status ${hostname_url.href}`], {});

		const finished = byId("crawls-finished");
		const finished_url = new URL(finished.href);
		finished_url.searchParams.set("initialFilter", domain);

		const viewer = byId("crawls-viewer");
		const viewer_url = new URL(viewer.href);
		viewer_url.searchParams.set("q", domain);

		appendAny(this.element, h("a", { href: finished_url.href, className: "context-menu-entry" }, "Finished"));
		appendAny(this.element, " or ");
		appendAny(this.element, h("a", { href: viewer_url.href, className: "context-menu-entry" }, "Viewer"));
		appendAny(this.element, ` for ${domain}`);
		appendAny(this.element, h("br"));
	}

	replaceIdent(str, ident) {
		const _ident = ` ${ident}`;
		const _ident_ = `${_ident} `;
		if (str.endsWith(_ident))
			return str.slice(0, -_ident.length) + " …";
		else
			return str.replace(_ident_, " … ");
	}

	makeCopyEntries(ident, commands, {prefix="Copy ", after=null}) {
		if (after === null) {
			after = h("br");
		}
		for (const c of commands) {
			let text, copy;
			if (Array.isArray(c)) {
				[text, copy] = c;
			} else {
				text = copy = c;
			}
			this.makeEntry(h("span", { onclick: this.makeCopyTextFn(copy) }, `${prefix}${this.replaceIdent(text, ident)}`));
			appendAny(this.element, after);
		}
	}

	makeAlwaysConcurrencyEntries(ident) {
		// FIXME: add/highlight current
		appendAny(this.element, "Copy !con … ");
		this.makeCopyEntries(ident, [
			["1", `!con ${ident} 1`],
			["3", `!con ${ident} 3`],
			["2", `!con ${ident} 2`],
			["6", `!con ${ident} 6`],
			["12", `!con ${ident} 12`], //FIXME: disable this?
		], { prefix: "", after: " "});
		appendAny(this.element, h("br"));
	}

	makeAlwaysDelayEntries(ident) {
		// FIXME: add/highlight current
		appendAny(this.element, "Copy !d … ");
		this.makeCopyEntries(ident, [
			["3min", `!d ${ident} 180000 180000`],
			["250-375 ms", `!d ${ident} 250 375`],
			["1hr", `!d ${ident} 3600000 3600000`],
			["zero", `!d ${ident} 0 0`], // FIXME: disable this?
		], { prefix: "", after: " "});
		appendAny(this.element, h("br"));
	}

	makeAlwaysEntries(ident, igon) {
		// FIXME: make these dependent on the job status
		this.makeCopyEntries(ident, [
			`!${igon} ${ident}`,
		], {});
		this.makeAlwaysConcurrencyEntries(ident);
		this.makeAlwaysDelayEntries(ident);
		appendAny(this.element, "Copy ");
		this.makeCopyEntries(ident, [
			["!status", `!status ${ident}`],
			["!whereis", `!whereis ${ident}`],
			["!expire", `!expire ${ident}`],
		], { prefix: "", after: " "});
		appendAny(this.element, " …");
		appendAny(this.element, h("br"));
		appendAny(this.element, "Copy ");
		this.makeCopyEntries(ident, [
			["!abort", `!abort ${ident}`],
			["!explain", `!explain ${ident} `],
			["!yahoo", `!yahoo ${ident}`], // FIXME: disable this?
		], { prefix: "", after: " "});
		appendAny(this.element, " …");
	}

	makeUrlPathEntries(ident, url, igon, maxSuggestedIgnores) {
		const igsetCommands = this.getIgsetCommands(ident, url);
		const [ignoresRemaining, ignorePathCommands] = this.getPathIgnoreCommands(ident, url, maxSuggestedIgnores);
		// Unfortunately, this does not open it in a background tab
		// like the real context menu does.
		this.makeEntry(h("a", { href: url }, "Open link in new tab"));
		this.makeEntry(h("span", { onclick: this.makeCopyTextFn(url) }, "Copy link address"));
		appendAny(this.element, h("br"));
		this.makeCopyEntries(ident, igsetCommands, {});
		if (ignoresRemaining) {
			this.makeEntry(
				h(
					"span",
					{
						onclick: (ev) => {
							ev.stopPropagation();
							this.resetEntries(ident, url, igon, maxSuggestedIgnores + 6);
						},
					},
					`[${ignoresRemaining} more ignore suggestion${ignoresRemaining === 1 ? "" : "s"}]`,
				),
			);
		}
		this.makeCopyEntries(ident, ignorePathCommands, {});
		this.makePathStatusCommands(url);
	}

	delayInfo(ident, min, max) {
		return [
			`!d ${ident} ${min === max ? min : `${min}-${max}`} ms`,
			`!d ${ident} ${min} ${max}`,
		];
	}

	logWindowMenu(ev, target) {
		this.prepare();

		// Below URLs are from the .textContent instead of the .href because
		// browsers URL-encode characters like { } ^ as they are added to
		// the DOM, while we want the original, unescaped characters to
		// create the correct ignore pattern.

		const maxSuggestedIgnores = 8;
		const [logWindow, ident] = matchParentElement(target, 0, "id", logWindowIdent);
		const igon = logWindow.parentElement.getElementsByClassName("job-ignores")[0].textContent === "igon" ? "igoff" : "igon";
		let url, pattern, con, min, max;

		const [line, type] = matchParentElement(target, 0, "class", logLineType);
		if (type === "ignore") {
			url = line.getElementsByClassName("ignore-url")[0].textContent;
			pattern = line.getElementsByClassName("ignore-pattern")[0].textContent;
		} else if (type === "stdout") {
			[url, ] = extractTextValues(line.textContent, lineERRORFetching);
			[pattern, ] = extractTextValues(line.textContent, lineInvalidPattern);
			[con, , min, max] = extractTextValues(line.textContent, lineSettingsUpdated);
		} else if (ContextMenuRenderer.#line_log_url_types.includes(type)) {
			url = line.getElementsByClassName("log-url")[0].textContent;
		}

		if (con) {
			this.makeCopyEntries(ident, [`!con ${ident} ${con}`], {});
		}

		if (min !== undefined && max !== undefined) {
			this.makeCopyEntries(ident, [this.delayInfo(ident, min, max)], {});
		}

		if (pattern) {
			this.makeCopyEntries(ident, [`!ug ${ident} ${pattern}`], {});
		}
		if (url) {
			this.makeUrlPathEntries(ident, url, igon, maxSuggestedIgnores);
		}

		this.makeAlwaysEntries(ident, igon);

		this.show(ev);
	}

	jobCommandMenu(ev, target) {
		this.prepare();

		const [logContainer, ident] = matchParentElement(target, 5, "id", logContainerIdent);
		const jr = ds.jobsRenderer;
		const info = jr.renderInfo[ident];
		const stats = info.statsElements;
		const jobData = jr.jobs.sorted.find((el) => el.ident === ident);
		const pipe = stats.pipeline.textContent.replace(/-[A-Za-z]$/, '');
		let cmd = ""
		cmd += info.jobType.textContent;
		cmd += ` ${jobData.url}`;
		cmd += ` -c ${jobData.concurrency}`;
		cmd += ` -d ${jobData.delay_max}`;
		cmd += ` -p ${pipe}`;
		if ("note" in jobData && jobData.note)
			cmd += ` -e '${jobData.note}'`;
		// FIXME: get the user_agent alias instead
		if ("user_agent" in jobData && jobData.user_agent)
			cmd += ` -u '${jobData.user_agent}'`;
		if ("no_offsite_links" in jobData && jobData.no_offsite_links)
			cmd += " --no-offsite";
		this.makeCopyEntries(null, [cmd], {});

		this.show(ev);
	}

	jobConcurrencyMenu(ev, target) {
		this.prepare();

		const [logContainer, ident] = matchParentElement(target, 5, "id", logContainerIdent);
		const elems = Array.from(logContainer.firstChild.getElementsByClassName("job-connections"));
		const cons = Array.from(elems, (c) => c.textContent);
		const cmds = cons.map((con) => `!con ${ident} ${con}`);

		this.makeCopyEntries(ident, cmds, {});

		if (elems.length > 1) {
			const cur = elems.indexOf(target);
			this.element.children[cur+1].style.backgroundColor = "lightgrey";
		}

		this.makeAlwaysConcurrencyEntries(ident);

		this.show(ev);
	}

	jobDelayMenu(ev, target) {
		this.prepare();

		const [logContainer, ident] = matchParentElement(target, 5, "id", logContainerIdent);
		const elems = Array.from(logContainer.firstChild.getElementsByClassName("job-delay"));
		const delays = Array.from(elems, (d) => [d.dataset.min, d.dataset.max]);
		const cmds = delays.map(([min, max]) => this.delayInfo(ident, min, max));

		this.makeCopyEntries(ident, cmds, {});

		if (elems.length > 1) {
			const cur = elems.indexOf(target);
			this.element.children[cur+1].style.backgroundColor = "lightgrey";
		}

		this.makeAlwaysDelayEntries(ident);

		this.show(ev);
	}

	jobIgnoresMenu(ev, target) {
		this.prepare();

		const [logContainer, ident] = matchParentElement(target, 5, "id", logContainerIdent);
		const igon = target.textContent === "igon" ? "igoff" : "igon";

		this.makeCopyEntries(ident, [`!${igon} ${ident}`], {});

		const info = ds.jobsRenderer.renderInfo[ident];
		if ("ignores_errors" in info) {
			const errors = info.ignores_errors;
			const mapper = ([pattern, error]) => `!ug ${ident} ${pattern}`;
			const cmds = Array.from(errors).sort().map(mapper);
			appendAny(this.element, "Invalid ignores:");
			appendAny(this.element, h("br"));
			this.makeCopyEntries(ident, cmds, {});
			info.statsElements.ignores.classList.remove('job-ignores-error');
		}

		this.show(ev);
	}

	onContextMenu(ev) {
		if (ev.target.classList.contains("job-type")) {
			this.jobCommandMenu(ev, ev.target);
		} else if (ev.target.classList.contains("job-options")) {
			this.jobCommandMenu(ev, ev.target);
		} else if (ev.target.classList.contains("job-connections")) {
			this.jobConcurrencyMenu(ev, ev.target);
		} else if (ev.target.classList.contains("job-connections-text")) {
			this.jobConcurrencyMenu(ev, ev.target.previousElementSibling);
		} else if (ev.target.classList.contains("job-delay")) {
			this.jobDelayMenu(ev, ev.target);
		} else if (ev.target.classList.contains("job-ignores")) {
			this.jobIgnoresMenu(ev, ev.target);
		} else if (ContextMenuRenderer.#log_classes.filter(c => ev.target.classList.contains(c)).length) {
			this.logWindowMenu(ev, ev.target);
		} else {
			this.blur();
			return;
		}

		// If the bottom of the context menu is outside the viewport, move the context
		// menu up, so that it appears to have opened from its bottom-left corner.
		// + 1 pixel so that the pointer lands inside the element and turns on cursor: default
		if (ev.clientY + this.element.offsetHeight > document.documentElement.clientHeight) {
			this.element.style.top = `${ev.clientY - this.element.offsetHeight + 1}px`;
		}
	}

	prepare() {
		removeChildren(this.element);
		// We put the clipboard-scratchpad in the fixed-positioned
		// context menu instead of elsewhere on the page, because
		// we must focus the input box to automatically copy its text,
		// and the focus operation scrolls to the element on the page,
		// and we want to avoid such scrolling.
		appendAny(this.element, h("input", { type: "text", id: "clipboard-scratchpad" }));
	}

	show(ev) {
		ev.preventDefault();
		this.visible = true;
		this.element.style.display = "block";
		this.element.style.left = `${ev.clientX}px`;
		this.element.style.top = `${ev.clientY}px`;
	}

	blur() {
		this.visible = false;
		this.element.style.display = "none";
		this.callAfterBlurFns.map((fn) => fn());
		this.callAfterBlurFns = [];
	}

	// TODO: decouple - fire an onblur event instead
	callAfterBlur(fn) {
		this.callAfterBlurFns.push(fn);
	}
}

class BatchingQueue {
	// `callable` is the function to call with the entire queue when we've waited enough
	// time (`minInterval` milliseconds) or have enough items (`maxItems`).
	//
	// We need the second mechanism (`maxItems`) only because Chromium-based browsers
	// have aggressive timer throttling and quickly stop handling a "recursive" setTimeout
	// when the tab is in the background. Meanwhile, the page isn't entirely strangled:
	// WebSocket messages keep getting pumped in, leading to (without this mechanism)
	// over 100K unprocessed messages in the queue.
	constructor(callable, minInterval, maxItems) {
		this.callable = callable;
		this._minInterval = minInterval;
		this._maxItems = maxItems;
		this.queue = [];
		this._timeout = null;
	}

	setMinInterval(minInterval) {
		this._minInterval = minInterval;
	}

	_runCallable() {
		this._timeout = null;
		const queue = this.queue;
		this.queue = [];
		this.callable(queue);
	}

	callNow() {
		if (this._timeout !== null) {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		this._runCallable();
	}

	push(v) {
		this.queue.push(v);
		if (this.queue.length >= this._maxItems) {
			this.callNow();
		} else if (this._timeout === null) {
			this._timeout = setTimeout(() => this._runCallable(), this._minInterval);
		}
	}
}

class Decayer {
	constructor(initial, multiplier, max) {
		this.initial = initial;
		this.multiplier = multiplier;
		this.max = max;
		this.reset();
	}

	reset() {
		// First call to .decay() will multiply, but we want to get the `initial`
		// value on the first call to .decay(), so divide.
		this.current = this.initial / this.multiplier;
		return this.current;
	}

	decay() {
		this.current = Math.min(this.current * this.multiplier, this.max);
		return this.current;
	}
}

class RateTracker {
	constructor(keepReadings) {
		this._idx = 0;
		this._durations = new Array(keepReadings).fill(0);
		this._values = new Array(keepReadings).fill(0);
		this._keepReadings = keepReadings;
		this._timeLast = Date.now() / 1000;
	}

	_addReading(duration, value) {
		const idx = this._idx;
		this._durations[idx] = duration;
		this._values[idx] = value;
		// Loop back to 0 when we reach the end
		this._idx = (idx + 1) % this._keepReadings;
	}

	getRate(value) {
		const now = Date.now() / 1000;
		const duration = now - this._timeLast;
		this._timeLast = Date.now() / 1000;
		this._addReading(duration, value);
		let valueSum = 0;
		let durationSum = 0;
		for (let i = 0; i < this._keepReadings; i++) {
			valueSum += this._values[i];
			durationSum += this._durations[i];
		}
		return valueSum / durationSum;
	}
}

function isUblockOriginDoingCosmeticFiltering() {
	const adbox = document.querySelector(".adbox");
	return adbox.offsetHeight === 0;
}

class Dashboard {
	constructor() {
		if (isUblockOriginDoingCosmeticFiltering()) {
			byId("read-the-help").style.display = "block";
		}

		// We automatically scroll log windows to the bottom as lines are added,
		// and for performance reasons we have `content-visibility: auto` to skip
		// rendering when they are outside the viewport (at least in Chrome where
		// this CSS property is supported).
		//
		// However, when they are outside the viewport, they fail to get scrolled
		// to the bottom by `scrollToBottom` because they aren't rendering anything.
		// Listen to contentvisibilityautostatechange and scroll these log windows
		// to the bottom after they go back into the viewport and their rendering
		// is no longer being skipped.
		document.body.addEventListener("contentvisibilityautostatechange", (ev) => {
			if (!ev.skipped && ev.target.classList.contains("log-window")) {
				scrollToBottom(ev.target);
			}
		});

		this.messageCount = 0;
		this.newItemsReceived = 0;
		this.newBytesReceived = 0;

		const args = Object.fromEntries(new URLSearchParams(window.location.search));

		const historyLines = args.historyLines ? Number(args.historyLines) : navigator.userAgent.match(/Mobi/) ? 250 : 500;
		const batchTimeWhenVisible = args.batchTimeWhenVisible ? Number(args.batchTimeWhenVisible) : 125;
		// Note that setting batchTimeWhenHidden below 1000ms doesn't really do anything in Chrome, Firefox, and Safari
		// because (with normal settings) they don't run timers in background tabs more than once every 1000ms.
		const batchTimeWhenHidden = args.batchTimeWhenHidden ? Number(args.batchTimeWhenHidden) : 1000;
		const batchMaxItems = args.batchMaxItems ? Number(args.batchMaxItems) : 250;
		const showNicks = args.showNicks ? Boolean(Number(args.showNicks)) : false;
		const contextMenu = args.contextMenu ? Boolean(Number(args.contextMenu)) : true;
		this.initialFilter = args.replayJob ? "" : args.initialFilter ?? "^$";
		this.previousFilter = this.initialFilter;
		const filterJobID = args.filterJobID ? Boolean(Number(args.filterJobID)) : true;
		const filterJobURL = args.filterJobURL ? Boolean(Number(args.filterJobURL)) : true;
		const filterJobNote = args.filterJobNote ? Boolean(Number(args.filterJobNote)) : true;
		const filterJobPipe = args.filterJobPipe ? Boolean(Number(args.filterJobPipe)) : true;
		const filterJobNick = args.filterJobNick ? Boolean(Number(args.filterJobNick)) : true;
		const showAllHeaders = args.initialFilter && args.showAllHeaders ? Boolean(Number(args.showAllHeaders)) : true;
		const showQueuedJobs = args.showQueuedJobs ? Boolean(Number(args.showQueuedJobs)) : true;
		const showRunningJobs = args.showRunningJobs ? Boolean(Number(args.showRunningJobs)) : true;
		const showFinishedJobs = args.showFinishedJobs ? Boolean(Number(args.showFinishedJobs)) : true;
		const showFailedJobs = args.showFailedJobs ? Boolean(Number(args.showFailedJobs)) : true;
		const showFatalJobs = args.showFatalJobs ? Boolean(Number(args.showFatalJobs)) : true;
		const showAbortedJobs = args.showAbortedJobs ? Boolean(Number(args.showAbortedJobs)) : true;
		const replayJob = args.replayJob;
		const replayDump = args.replayJob ? (args.replayDump ? Boolean(Number(args.replayDump)) : true) : false;
		const replayStart = args.replayStart ? Number(args.replayStart) : null;
		const replayEnd = args.replayEnd ? Number(args.replayEnd) : null;
		const loadRecent = args.replayJob ? false : args.loadRecent ? Boolean(Number(args.loadRecent)) : true;
		this.debug = args.debug ? Boolean(Number(args.debug)) : false;
		const openHeader = args.openHeader ? Boolean(Number(args.openHeader)) : false;

		// Append to page title to make it possible to identify the tab in Chrome's task manager
		if (args.title) {
			document.title += ` - ${args.title}`;
		}

		this.host = args.host ? args.host : location.hostname;
		this.port = args.port ? `:${Number(args.port)}` : "";
		const wsproto = window.location.protocol === "https:" ? "wss:" : "ws:";
		this.websocketUrl = args.websocketUrl ?? `${wsproto}//${this.host}:4568/stream`;

		this.dumpTraffic = args.dumpMax && Number(args.dumpMax) > 0;
		if (this.dumpTraffic) {
			this.dumpMax = Number(args.dumpMax);
		}

		this.contextMenuRenderer = new ContextMenuRenderer(document);
		if (contextMenu) {
			document.oncontextmenu = (ev) => this.contextMenuRenderer.onContextMenu(ev);
			document.onclick = (ev) => this.contextMenuRenderer.blur(ev);
			// onkeydown picks up ESC, onkeypress doesn't (tested Chrome 44)
			document.onkeydown = (ev) => {
				if (ev.keyCode === 27 /* ESC */) {
					this.contextMenuRenderer.blur();
				}
			};
			document.onwheel = () => this.contextMenuRenderer.blur();
		}

		this.jobsRenderer = new JobsRenderer(
			byId("logs"),
			byId("filter-box"),
			historyLines,
			showNicks,
			this.contextMenuRenderer,
		);

		this.loadPipelines();

		document.onkeypress = (ev) => this.keyPress(ev);

		// Adjust help text based on URL
		Array.prototype.slice.call(document.querySelectorAll(".url-q-or-amp")).map((elem) => {
			if (window.location.search.indexOf("?") !== -1) {
				elem.textContent = "&";
			}
		});

		if (openHeader) {
			const header = document.querySelector(".header");
			for (const dropdown of document.getElementsByTagName("details")) {
				dropdown.open = true;
			}
		}

		if (!showNicks) {
			addPageStyles(".job-nick-aligned { width: 0; }");
		} else {
			byId("filter-types").lastChild.after(
				h("label", { title: "IRC nick" }, [
					h("input", {
						type: "checkbox",
						id: "filter-job-nick",
						onclick: () => { ds.jobsRenderer.applyFilter(); },
						checked: true,
					}),
					" Nick",
				])
			);
			byId("filter-box").title += "|exnick";
			byId("crawls-finished").setSearchParam("showNicks", "1");
			byId("alt").setSearchParam("showNicks", "1");
			byId("beta").setSearchParam("showNicks", "1");
		}

		byId("filter-job-id").checked = filterJobID;
		byId("filter-job-url").checked = filterJobURL;
		byId("filter-job-note").checked = filterJobNote;
		byId("filter-job-pipeline").checked = filterJobPipe;
		if (showNicks) {
			byId("filter-job-nick").checked = filterJobNick;
		}

		if (args.initialFilter != null) {
			byId("set-filter-none").after(
				h("input", {
					className: "button",
					type: "button",
					id: "set-filter-initial",
					onclick: () => { ds.setFilter(ds.initialFilter) },
					value: "Initial",
					title: "Reset the filter regex to the initialFilter parameter",
				})
			);
			byId("set-filter-none").after("\n");
		}
		this.setFilter(this.initialFilter);

		this.showAllHeaders(showAllHeaders);

		this.showQueuedJobs(showQueuedJobs);
		this.showRunningJobs(showRunningJobs);
		this.showFinishedJobs(showFinishedJobs);
		this.showFailedJobs(showFailedJobs);
		this.showFatalJobs(showFatalJobs);
		this.showAbortedJobs(showAbortedJobs);

		const finishSetup = () => {
			byId("meta-info").innerHTML = "";

			const rateRefreshInterval = 1000;
			const keepReadings = Math.round(5000 / rateRefreshInterval);
			const messagesRate = new RateTracker(keepReadings);
			const bytesRate = new RateTracker(keepReadings);

			// Keep this outside the BatchingQueue callable so that we detect
			// when we stop receiving data entirely.
			setInterval(() => {
				const msgPerSec = Math.round(messagesRate.getRate(this.newItemsReceived));
				const kbPerSec = Math.round(bytesRate.getRate(this.newBytesReceived / 1000));
				this.newItemsReceived = 0;
				this.newBytesReceived = 0;
				byId("meta-info").textContent = `WS:
${String(msgPerSec).padStart(3, "0")} msg/s,
${String(kbPerSec).padStart(3, "0")} KB/s`;
			}, rateRefreshInterval);

			this.queue = new BatchingQueue(
				(queue) => {
					if (this.debug) {
						console.debug(`Processing ${queue.length} JSON messages`);
					}
					for (const obj of queue) {
						this.handleWebSocketData(obj);
					}
				},
				batchTimeWhenVisible,
				batchMaxItems,
			);

			this.decayer = new Decayer(1000, 1.5, 60000);
			/*if (replayJob)
				this.connectAB2f(replayJob);
			else */
				this.connectWebSocket();

			document.addEventListener(
				"visibilitychange",
				() => {
					if (document.hidden) {
						if (this.debug) {
							console.debug(`Page has become hidden, setting batch time to ${batchTimeWhenHidden}ms`);
						}
						this.queue.setMinInterval(batchTimeWhenHidden);
					} else {
						if (this.debug) {
							console.debug(`Page has become visible, setting batch time to ${batchTimeWhenVisible}ms`);
						}
						this.queue.setMinInterval(batchTimeWhenVisible);
						this.queue.callNow();
					}
				},
				false,
			);
		};

		if (loadRecent) {
			// Continue even if we fail to get /logs/recent data
			this.loadRecent().finally(finishSetup);
		} else if (replayJob && replayDump) {
			this.dumpAB2f(replayJob, replayStart, replayEnd);
		} else {
			finishSetup();
		}
	}

	loadPipelines() {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.onload = () => {
				try {
					let pipelines = {};
					const json = JSON.parse(xhr.responseText).pipelines;
					for (const pipeline of json) {
						pipelines[pipeline.id] = pipeline.nickname;
					}
					this.jobsRenderer.updatePipelines(pipelines);
				} catch (e) {
					console.log("Failed to load /pipelines data: ", e);
				}
				resolve();
			};
			xhr.onerror = (ev) => {
				reject(ev);
			};
			xhr.open("GET", `//archivebot.com/pipelines`);
			xhr.setRequestHeader("Accept", "application/json");
			xhr.send("");
		});
	}

	loadRecent() {
		return new Promise((resolve, reject) => {
			byId("meta-info").textContent = "Requesting recent data";
			const xhr = new XMLHttpRequest();
			xhr.onload = () => {
				try {
					const recentLines = JSON.parse(xhr.responseText);
					for (const line of recentLines) {
						this.handleRecentData(line);
					}
				} catch (e) {
					console.log("Failed to load /logs/recent data:", e);
				}
				resolve();
			};
			xhr.onerror = (ev) => {
				reject(ev);
			};
			xhr.onprogress = (ev) => {
				const percent = Math.round(100 * (ev.loaded / ev.total));
				const size_mb = Math.round((100 * ev.total) / 1e6) / 100;
				byId("meta-info").textContent = `Recent data: ${percent}% (${size_mb}MB)`;
			};
			xhr.open("GET", `//archivebot.com/logs/recent?cb=${Date.now()}${Math.random()}`);
			xhr.setRequestHeader("Accept", "application/json");
			xhr.send("");
		});
	}

	keyPress(ev) {
		// If you press ctrl-f or alt-f in Firefox (tested: 41), it dispatches
		// the keypress event for 'f'.  We want only the modifier-free
		// keypresses.
		if (ev.ctrlKey || ev.altKey || ev.metaKey) {
			return;
		}
		// Check shiftKey only after handling '?', because you need shift for '?'
		if (ev.which === 63 /* ? */) {
			ds.toggleHelp();
			return;
		}
		if (ev.shiftKey) {
			return;
		}
		if (ev.which === 106 /* j */) {
			this.jobsRenderer.showNextPrev(1);
		} else if (ev.which === 107 /* k */) {
			this.jobsRenderer.showNextPrev(-1);
		} else if (ev.which === 97 /* a */) {
			ds.setFilter("");
		} else if (ev.which === 110 /* n */) {
			ds.setFilter("^$");
		} else if (ev.which === 102 /* f */) {
			ev.preventDefault();
			byId("filter-box").focus();
			byId("filter-box").select();
		} else if (ev.which === 105 /* i */) {
			ds.setFilter(ds.initialFilter);
		} else if (ev.which === 118 /* v */) {
			window.open(this.jobsRenderer.firstFilterMatch.url);
		} else if (ev.which === 104 /* h */) {
			ds.showAllHeaders(!byId("show-all-headers").checked);
		} else if (ev.which === 113 /* q */) {
			ds.showQueuedJobs(!byId("show-queued-jobs").checked);
		} else if (ev.which === 114 /* r */) {
			ds.showRunningJobs(!byId("show-running-jobs").checked);
		} else if (ev.which === 100 /* d */) {
			ds.showFinishedJobs(!byId("show-finished-jobs").checked);
		} else if (ev.which === 98 /* b */) {
			ds.showFailedJobs(!byId("show-failed-jobs").checked);
		} else if (ev.which === 99 /* c */) {
			ds.showFatalJobs(!byId("show-fatal-jobs").checked);
		} else if (ev.which === 115 /* s */) {
			ds.showAbortedJobs(!byId("show-aborted-jobs").checked);
		} else if (ev.which === 117 /* u */) {
			byId("filter-job-url").click();
		} else if (ev.which === 101 /* e */) {
			byId("filter-job-note").click();
		} else if (ev.which === 112 /* p */) {
			byId("filter-job-pipeline").click();
		}
	}

	handleData(data, recent) {
		this.messageCount += 1;
		if (this.dumpTraffic && this.messageCount <= this.dumpMax) {
			byId("traffic").appendChild(h("pre", null, prettyJson(data)));
		}
		this.jobsRenderer.handleData(data, recent);
	}

	// FIXME: update the backend instead
	// /logs/recent job data differs from the WebSocket job data in lots of ways
	handleRecentData(data) {
		const jobData = data.job_data;

		// keys to be renamed
		for (const [key_from, key_to] of Object.entries(recent_rename)) {
			delete Object.assign(jobData, {[key_from]: jobData[key_to]})[key_to];
		}

		for (const key of recent_to_bool) {
			if (key in jobData) {
				if (jobData[key] === "true")
					jobData[key] = true;
				else if (jobData[key] === "false")
					jobData[key] = false;
			}
		}

		for (const key of recent_delete_false) {
			if (key in jobData)
				if (jobData[key] === false)
					delete jobData[key];
		}

		for (const key of recent_delete_null) {
			if (key in jobData)
				if (jobData[key] === null)
					delete jobData[key];
		}

		for (const key of recent_to_string) {
			if (key in jobData)
				jobData[key] = jobData[key].toString();
		}

		// some values missing/reduced in recent data, not calculable from recent data
		// JobsTracker handleJobData handles that by copying the data back in history

		this.handleData(data, true);
	}

	// FIXME: update the backend instead
	handleWebSocketData(data) {
		const jobData = data.job_data;

		for (const key of websocket_to_bool) {
			if (key in jobData) {
				if (jobData[key] === "true")
					jobData[key] = true;
				else if (jobData[key] === "false")
					jobData[key] = false;
			}
		}

		this.handleData(data, false);
	}

	connectWebSocket() {
		this.ws = new WebSocket(this.websocketUrl);

		this.ws.onmessage = (ev) => {
			this.newItemsReceived += 1;
			this.newBytesReceived += ev.data.length;
			this.queue.push(JSON.parse(ev.data));
		};

		this.ws.onopen = (ev) => {
			console.log("WebSocket opened:", ev);
			this.decayer.reset();
		};

		this.ws.onclose = (ev) => {
			console.log("WebSocket closed:", ev);
			const delay = this.decayer.decay();
			console.log("Reconnecting in", delay, "ms");
			setTimeout(() => this.connectWebSocket(), delay);
		};
	}

	async connectAB2f(ident, start, end) {
/*		const url = `https://ab2f.archivingyoursh.it/${ident}.jsonl`;
		await fetch(url)
		.then((res) => {
			if (this.debug) console.debug("ab2f opened:", res.url);
			this.decayer.reset();
			this.jobReplayChunks = "";
			this.jobReplayTotal = parseInt(res.headers.get("content-length"));
			byId("meta-info").textContent = `Receiving job data for ${ident}`;
			return res;
		})
		.then((res) => res.body.getReader())
		.then((reader) => reader.read())
		.then(({value: chunk, done}) => {
			if (done) return;
			const [next, start] = chunk.split('\n');
			chunks = this.jobReplayChunks + next;
			if (start) {
				this.jobReplayChunks = start;
			}
			byId("meta-info").textContent = "Replaying job data";
			if (this.jobReplayTotal) {
				const percent = Math.round(100 * (chunks.length / this.jobReplayTotal));
				const size_mb = Math.round((100 * this.jobReplayTotal) / 1e6) / 100;
				byId("meta-info").textContent += `: ${percent}% (${size_mb}MB)`;
			}
			return chunks;
		})
		.then((line) => JSON.parse(line))
		.then((msg) => {
			this.newItemsReceived += 1;
			this.newBytesReceived += msg.length;
			this.queue.push(JSON.parse(msg));
		})
		.finally((a)) => {
			if (this.debug) console.debug("ab2f closed");
			const delay = this.decayer.decay();
			byId("meta-info").textContent = "Completed job replay";
		})
*/
	}

	async dumpAB2f(ident, start, end) {
		byId("meta-info").textContent = `Requesting job data for ${ident}`;
		const url = `https://ab2f.archivingyoursh.it/${ident}.jsonl`;
		await fetch(url)
		.then((res) => {
			if (this.debug) console.debug("ab2f opened:", res.url);
			byId("meta-info").textContent = `Receiving job data for ${ident}`;
			return res;
		})
		.then((res) => res.text())
		.then((text) => text.trim().split('\n'))
		.then((lines) => lines.map((line) => JSON.parse(line)))
		.then((msgs) => {
			if (start !== null && end !== null)
				msgs = msgs.slice(start, end);
			if (this.debug) console.debug(`Processing ${msgs.length} JSON messages`);
			msgs.map((msg) => {
				if (this.debug) console.debug(msg);
				this.handleWebSocketData(msg);
			})
		})
		.finally(() => {
			if (this.debug) console.debug("ab2f closed");
			byId("meta-info").textContent = "Completed job replay";
		})
		.catch((error) => {
			if (this.debug)
			console.error("Download error:", error, url);
		})

	}

	toggleAlign() {
		this.jobsRenderer.toggleAlign();
	}

	toggleHelp() {
		const help = byId("help");
		if (help.classList.contains("undisplayed")) {
			help.classList.remove("undisplayed");
		} else {
			help.classList.add("undisplayed");
		}
	}

	getFilter() {
		return byId("filter-box").value;
	}

	setFilter(value) {
		this.previousFilter = byId("filter-box").value;
		byId("filter-box").value = value;
		byId("filter-box").onchange();
		// Showing no jobs logs and no job headers can be confusing
		// so show the headers when no job logs are selected.
		if (value === "^$"){
			if (!byId("show-all-headers").checked) {
				byId("show-all-headers").dataset.auto = true;
				this.showAllHeaders(true);
			}
		} else if (byId("show-all-headers").dataset.auto) {
			delete byId("show-all-headers").dataset.auto;
			this.showAllHeaders(false);
		}
	}

	showAllHeaders(value) {
		byId("show-all-headers").checked = value;
		byId("hide-headers").sheet.disabled = value;
		byId("job-type-aligned").sheet.disabled = !value;
	}

	showQueuedJobs(value) {
		byId("show-queued-jobs").checked = value;
		byId("hide-queued").sheet.disabled = value;
	}

	showRunningJobs(value) {
		byId("show-running-jobs").checked = value;
		byId("hide-running").sheet.disabled = value;
	}

	showFinishedJobs(value) {
		byId("show-finished-jobs").checked = value;
		byId("hide-done").sheet.disabled = value;
	}

	showFailedJobs(value) {
		byId("show-failed-jobs").checked = value;
		byId("hide-failed").sheet.disabled = value;
	}

	showFatalJobs(value) {
		byId("show-fatal-jobs").checked = value;
		byId("hide-fatal").sheet.disabled = value;
	}

	showAbortedJobs(value) {
		byId("show-aborted-jobs").checked = value;
		byId("hide-aborted").sheet.disabled = value;
	}
}

const ds = new Dashboard();
