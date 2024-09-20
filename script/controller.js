/**
 * Generic semi-abstract controller class which cannot be
 * instantiated, and is intended as a superclass for concrete
 * controller subclasses. It realizes a border layout with
 * quick access to HTML elements for center, top, bottom, left
 * and right portions. It requires a HTML page with a header,
 * a footer, and a main element containing three articles with
 * style class "left", "center" and "right" respectively.
 * Optionally, the footer may contain an input/output element
 * with style class "message".
 */
export default class Controller extends EventTarget {
	static #SHARED_PROPERTIES = {};


	/**
	 * Initializes a new instance.
	 * @throws {InternalError} if there is an attempt to instantiate this class
	 */
	constructor () {
		super();
		if (this.constructor === Controller) throw new InternalError("abstract classes cannot be instantiated!");
	}


	/**
	 * Returns the top.
	 * @return the header element, or null for none
	 */
	get top () {
		return document.querySelector("body>header");
	}


	/**
	 * Returns the bottom.
	 * @return the footer element, or null for none
	 */
	get bottom () {
		return document.querySelector("body>footer");
	}


	/**
	 * Returns the center.
	 * @return the center article element, or null for none
	 */
	get center () {
		return document.querySelector("body>main>article.center");
	}


	/**
	 * Returns the left.
	 * @return the left article element, or null for none
	 */
	get left () {
		return document.querySelector("body>main>article.left");
	}


	/**
	 * Returns the right.
	 * @return the right article element, or null for none
	 */
	get right () {
		return document.querySelector("body>main>article.right");
	}


	/**
	 * Returns the message output.
	 * @return the message output element, or null for none
	 */
	get messageOutput () {
		return document.querySelector("body>footer .message") || null;
	}


	/**
	 * Returns the shared properties.
	 * @return the shared controller properties
	 */
	get sharedProperties () {
		return Controller.#SHARED_PROPERTIES;
	}
}