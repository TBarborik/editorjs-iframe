/**
 * Build styles
 */
import './index.scss';

import svg from './toolbox-icon.svg';
/**
 * Raw HTML Tool for CodeX Editor
 *
 * @author CodeX (team@codex.so)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 */

/**
 *
 */
export default class RawTool {
	/**
	 * Notify core that read-only mode is supported
	 *
	 * @returns {boolean}
	 */
	static get isReadOnlySupported() {
		return true;
	}

	/**
	 * Should this tool be displayed at the Editor's Toolbox
	 *
	 * @returns {boolean}
	 * @public
	 */
	static get displayInToolbox() {
		return true;
	}

	/**
	 * Allow to press Enter inside the RawTool textarea
	 *
	 * @returns {boolean}
	 * @public
	 */
	static get enableLineBreaks() {
		return true;
	}

	/**
	 * Get Tool toolbox settings
	 * icon - Tool icon's SVG
	 * title - title to show in toolbox
	 *
	 * @returns {{icon: string, title: string}}
	 */
	static get toolbox() {
		return {
			icon: svg,
			title: 'Iframe',
		};
	}

	/**
	 * @typedef {object} RawData — plugin saved data
	 * @param {string} html - previously saved HTML code
	 * @property
	 */

	/**
	 * Render plugin`s main Element and fill it with saved data
	 *
	 * @param {RawData} data — previously saved HTML data
	 * @param {object} config - user config for Tool
	 * @param {object} api - CodeX Editor API
	 * @param {boolean} readOnly - read-only mode flag
	 */
	constructor({ data, config, api, readOnly }) {
		this.api = api;
		this.readOnly = readOnly;

		this.placeholder = api.i18n.t(config.placeholder || RawTool.DEFAULT_PLACEHOLDER);

		this.CSS = {
			baseClass: this.api.styles.block,
			input: this.api.styles.input,
			wrapper: 'ce-rawtool',
			textarea: 'ce-rawtool__textarea',
		};

		this.data = {
			html: data.html || '',
		};

		this.textarea = null;
		this.resizeDebounce = null;
	}

	/**
	 * Return Tool's view
	 *
	 * @returns {HTMLDivElement} this.element - RawTool's wrapper
	 * @public
	 */
	render() {
		const wrapper = document.createElement('div');
		const renderingTime = 100;

		this.textarea = document.createElement('textarea');

		wrapper.classList.add(this.CSS.baseClass, this.CSS.wrapper);

		this.textarea.classList.add(this.CSS.textarea, this.CSS.input);
		this.textarea.textContent = this.data.html;
		this.textarea.placeholder = this.placeholder;

		if (this.readOnly) {
			this.textarea.disabled = true;
		} else {
			this.textarea.addEventListener('input', () => {
				this.onInput();
			});
		}

		wrapper.appendChild(this.textarea);

		setTimeout(() => {
			this.resize();
		}, renderingTime);

		return wrapper;
	}

	/**
	 * Extract Tool's data from the view
	 *
	 * @param {HTMLDivElement} rawToolsWrapper - RawTool's wrapper, containing textarea with raw HTML code
	 * @returns {RawData} - raw HTML code
	 * @public
	 */
	save(rawToolsWrapper) {
		return {
			html: rawToolsWrapper.querySelector('textarea').value.trim(),
		};
	}

	/**
	 * Default placeholder for RawTool's textarea
	 *
	 * @public
	 * @returns {string}
	 */
	static get DEFAULT_PLACEHOLDER() {
		return 'Enter Iframe code';
	}

	/**
	 * Automatic sanitize config
	 */
	static get sanitize() {
		return {
			html: true, // Allow HTML tags
		};
	}

	/**
	 * Textarea change event
	 *
	 * @returns {void}
	 */
	onInput() {
		if (this.resizeDebounce) {
			clearTimeout(this.resizeDebounce);
		}

		this.resizeDebounce = setTimeout(() => {
			this.resize();
		}, 200);

		const content = this.textarea.value;
		if (content.trim().length === 0 || !this.isIframe(content.trim())) {
			this.textarea.setCustomValidity("Vložený kód není rámec.")
			this.textarea.reportValidity();
		} else {
			this.textarea.setCustomValidity("");
		}
	}

	/**
	 *
	 * @param htmlContent {string}
	 * @returns {boolean}
	 */
	isIframe(htmlContent) {
		const range = document.createRange();

		if (!htmlContent.trim().endsWith(">") || !htmlContent.trim().startsWith("<"))
			return false;

		try {
			const fragment = range.createContextualFragment(htmlContent);
			return fragment.childNodes.length === 1 && fragment.firstElementChild.nodeName === "IFRAME";
		} catch (e) {
			return false;
		}
	}

	/**
	 * Resize textarea to fit whole height
	 *
	 * @returns {void}
	 */
	resize() {
		this.textarea.style.height = 'auto';
		this.textarea.style.height = this.textarea.scrollHeight + 'px';
	}
}