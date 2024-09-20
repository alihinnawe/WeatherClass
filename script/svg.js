// constants
export const SVG_NAMESPACE = "http://www.w3.org/2000/svg";


/**
 * Returns a newly created SVG group element.
 * @param styleClasses the group's initial style classes
 * @return the SVG group element created
 * @throws {TypeError} if any of the given style classes is not a string
 */
export function createSvgGroup (...styleClasses) {
	for (const styleClass of styleClasses)
		if (typeof styleClass !== "string") throw new TypeError();

	const group = document.createElementNS(SVG_NAMESPACE, "g");
	for (const styleClass of styleClasses)
		group.classList.add(styleClass);

	return group;
}


/**
 * Returns a newly created SVG line element.
 * @param x1 the horizontal coordinate of the line's one end
 * @param y1 the vertical coordinate of the line's one end
 * @param x2 the horizontal coordinate of the line's other end
 * @param y2 the vertical coordinate of the line's other end
 * @return the SVG line element created
 * @throws {TypeError} if any of the given arguments is neither a number nor a string
 */
export function createSvgLine (x1, y1, x2, y2) {
	if ((typeof x1 !== "number" && typeof x1 !== "string") || (typeof y1 !== "number" && typeof y1 !== "string")) throw new TypeError();
	if ((typeof x2 !== "number" && typeof x2 !== "string") || (typeof y2 !== "number" && typeof y2 !== "string")) throw new TypeError();

	const line = document.createElementNS(SVG_NAMESPACE, "line");
	line.setAttributeNS(null, "x1", x1);
	line.setAttributeNS(null, "y1", y1);
	line.setAttributeNS(null, "x2", x2);
	line.setAttributeNS(null, "y2", y2);
	return line;
}


/**
 * Returns a newly created SVG rect element.
 * @param x the horizontal coordinate of the rectangle's upper-left corner
 * @param y the vertical coordinate of the rectangle's upper-left corner
 * @param width the horizontal extension of the rectangle
 * @param height the vertical extension of the rectangle
 * @return the SVG rect element created
 * @throws {TypeError} if any of the given arguments is neither a number nor a string
 */
export function createSvgRectangle (x, y, width, height) {
	if ((typeof x !== "number" && typeof x !== "string") || (typeof y !== "number" && typeof y !== "string")) throw new TypeError();
	if ((typeof width !== "number" && typeof width !== "string") || (typeof height !== "number" && typeof height !== "string")) throw new TypeError();

	const rectangle = document.createElementNS(SVG_NAMESPACE, "rect");
	rectangle.setAttributeNS(null, "x", x);
	rectangle.setAttributeNS(null, "y", y);
	rectangle.setAttributeNS(null, "width", width);
	rectangle.setAttributeNS(null, "height", height);
	return rectangle;
}


/**
 * Returns a newly created SVG polygon element.
 * @param coordinates the polygon's alternating horizontal and vertical coordinates
 * @return the SVG polygon element created
 * @throws {TypeError} if any of the given coordinates is not a number
 */
export function createSvgPolygon (...coordinates) {
	if (coordinates.length % 2 !== 0) throw new TypeError();
	for (const coordinate of coordinates)
		if (typeof coordinate !== "number") throw new TypeError();

	let points = "";
	for (let index = 0; index < coordinates.length; ++index)
		points += coordinates[index] + (index % 2 === 0 ? "," : " ");

	const polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
	polygon.setAttributeNS(null, "points", points.trim());
	return polygon;
}


/**
 * Returns a newly created SVG circle element.
 * @param x the horizontal coordinate of the circle's center
 * @param y the vertical coordinate of the circle's center
 * @param radius the circle's radius
 * @return the SVG circle element created
 * @throws {TypeError} if any of the given arguments is neither a number nor a string
 */
export function createSvgCircle (x, y, radius) {
	if ((typeof x !== "number" && typeof x !== "string") || (typeof y !== "number" && typeof y !== "string") || (typeof radius !== "number" && typeof radius !== "string")) throw new TypeError();

	const circle = document.createElementNS(SVG_NAMESPACE, "circle");
	circle.setAttributeNS(null, "cx", x);
	circle.setAttributeNS(null, "cy", y);
	circle.setAttributeNS(null, "r", radius);
	return circle;
}


/**
 * Returns a newly created SVG ellipse element.
 * @param x the horizontal coordinate of the ellipse's center
 * @param y the vertical coordinate of the ellipse's center
 * @param rx the ellipse's horizontal radius
 * @param ry the ellipse's vertical radius
 * @return the SVG ellipse element created
 * @throws {TypeError} if any of the given arguments is neither a number nor a string
 */
export function createSvgEllipse (x, y, rx, ry) {
	if ((typeof x !== "number" && typeof x !== "string") || (typeof y !== "number" && typeof y !== "string")) throw new TypeError();
	if ((typeof rx !== "number" && typeof rx !== "string") || (typeof ry !== "number" && typeof ry !== "string")) throw new TypeError();

	const ellipse = document.createElementNS(SVG_NAMESPACE, "ellipse");
	ellipse.setAttributeNS(null, "cx", x);
	ellipse.setAttributeNS(null, "cy", y);
	ellipse.setAttributeNS(null, "rx", rx);
	ellipse.setAttributeNS(null, "ry", ry);
	return ellipse;
}


/**
 * Returns a newly created SVG text element.
 * @param x the horizontal coordinate of the text's lower-left end
 * @param y the vertical coordinate of the text's lower-left end
 * @param angle the text angle in degrees
 * @param value the (optional) text value, or null for none
 * @return the SVG text element created
 * @throws {TypeError} if the given x or y is neither a number nor a string,
 *						or if the given angle is not a number
 */
export function createSvgText (x, y, angle, value) {
	if ((typeof x !== "number" && typeof x !== "string") || (typeof y !== "number" && typeof y !== "string") || typeof angle !== "number") throw new TypeError();

	const text = document.createElementNS(SVG_NAMESPACE, "text");
	text.setAttributeNS(null, "x", x);
	text.setAttributeNS(null, "y", y);
	text.setAttributeNS(null, "rotate", angle);
	if (value != null) text.textContent = value.toString();
	return text;
}


/**
 * Returns a newly created SVG text span element.
 * @param value the (optional) text value, or null for none
 * @return the SVG text span element created
 */
export function createSvgSpan (value) {
	const span = document.createElementNS(SVG_NAMESPACE, "tspan");
	if (value != null) span.textContent = value.toString();
	return span;
}


/**
 * Returns a newly created SVG anchor element.
 * @param href the (optional) href, or null for none
 * @param target the (optional) target, or null for none
 * @return the SVG anchor element created
 * @throws {TypeError} if any of the given arguments is not a string
 */
export function createSvgAnchor (href, target) {
	if ((href && typeof href !== "string") || (target && typeof target !== "string")) throw new TypeError();

	const anchor = document.createElementNS(SVG_NAMESPACE, "a");
	if (href != null) anchor.setAttributeNS(null, "href", href);
	if (target != null) anchor.setAttributeNS(null, "target", target);
	return anchor;
}
