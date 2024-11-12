const canvas = document.querySelector('canvas'),
	toolBtns = document.querySelectorAll('.tool'),
	fillColor = document.querySelector('#fill-color'),
	sizeSlider = document.querySelector('#size-slider'),
	alphaSlider = document.querySelector('#alpha-slider'),
	colorBtns = document.querySelectorAll('.colors .option'),
	colorPicker = document.querySelector('#color-picker'),
	clearCanvas = document.querySelector('.clear-canvas'),
	saveImg = document.querySelector('.save-img'),
	ctx = canvas.getContext('2d', { willReadFrequently: true }),
	element = document.getElementById('select')

let startMouseX,
	startMouseY,
	snapshot,
	isDrawing = false,
	selectedTool = 'brush',
	brushWidth = 5,
	brushAlpha = 1,
	selectedColor = '#000'

let currentSelectX,
	currentSelectY,
	selectWidth,
	selectHeight,
	selectArea,
	areaWithoutTheClipping,
	startX,
	startY,
	isDragging = false,
	current_shape_index = null

const currentShape = {
	x: null,
	y: null,
	width: null,
	height: null,
}
Object.seal(currentShape)

window.addEventListener('load', () => {
	canvas.width = canvas.offsetWidth
	canvas.height = canvas.offsetHeight
	ctx.fillStyle = '#ffffff'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = '#ffffff'
})
const drawSpray = (x, y) => {
	const density = 50
	const radius = brushWidth

	for (let i = 0; i < density; i++) {
		const offsetX = Math.random() * 2 * radius - radius
		const offsetY = Math.random() * 2 * radius - radius
		const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)

		if (distance <= radius) {
			ctx.fillRect(x + offsetX, y + offsetY, 1, 1)
		}
	}
}

const drawRect = e => {
	if (!fillColor.checked) {
		ctx.strokeRect(
			e.offsetX,
			e.offsetY,
			startMouseX - e.offsetX,
			startMouseY - e.offsetY
		)
	} else {
		ctx.fillRect(
			e.offsetX,
			e.offsetY,
			startMouseX - e.offsetX,
			startMouseY - e.offsetY
		)
	}
}

const drawCircle = e => {
	ctx.beginPath()
	let radius = Math.sqrt(
		Math.pow(startMouseX - e.offsetX, 2) + Math.pow(startMouseY - e.offsetY, 2)
	)
	ctx.arc(startMouseX, startMouseY, radius, 0, 2 * Math.PI)
	fillColor.checked ? ctx.fill() : ctx.stroke()
}

const drawTriangle = e => {
	ctx.beginPath()
	ctx.moveTo(startMouseX, startMouseY)
	ctx.lineTo(e.offsetX, e.offsetY)
	ctx.lineTo(startMouseX * 2 - e.offsetX, e.offsetY)
	ctx.closePath()
	fillColor.checked ? ctx.fill() : ctx.stroke()
}
const drawEraser = e => {
	ctx.strokeStyle = '#fff'
	ctx.lineTo(e.offsetX, e.offsetY)
	ctx.stroke()
}
const drawLine = e => {
	ctx.beginPath()
	ctx.moveTo(startMouseX, startMouseY)
	ctx.lineTo(e.offsetX, e.offsetY)
	ctx.stroke()
}
const drawBrush = e => {
	ctx.lineTo(e.offsetX, e.offsetY)
	ctx.stroke()
}
const startDraw = e => {
	isDrawing = true
	startMouseX = e.offsetX
	startMouseY = e.offsetY
	ctx.lineJoin = 'round'
	ctx.beginPath()
	ctx.lineWidth = brushWidth
	ctx.globalAlpha = brushAlpha
	ctx.strokeStyle = selectedColor
	ctx.fillStyle = selectedColor
	snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
}
let isMouseInShape = function (x, y) {
	let shapeLeft = currentShape.x
	let shapeRight = currentShape.x + currentShape.width
	let shapeTop = currentShape.y
	let shapeBottom = currentShape.y + currentShape.height
	if (x > shapeLeft && x < shapeRight && y > shapeTop && y < shapeBottom) {
		return true
	}
	return false
}
let mouseMove = function (e) {
	if (!isDragging) {
		return
	} else {
		e.preventDefault()

		let mouseX2 = parseInt(e.offsetX)
		let mouseY2 = parseInt(e.offsetY)
		let dx = mouseX2 - mouseX
		let dy = mouseY2 - mouseY

		currentShape.x += dx
		currentShape.y += dy
		ctx.putImageData(areaWithoutTheClipping, 0, 0)
		ctx.putImageData(selectArea, currentShape.x, currentShape.y)

		mouseX = mouseX2
		mouseY = mouseY2
	}
}
let mouseOut = function (event) {
	if (!isDragging) return
	event.preventDefault()
	isDragging = false
}
let mouseUp = function (e) {
	if (!isDragging) return
	e.preventDefault()
	isDragging = false
}
let mouseX, mouseY
let mouseDown = function (e) {
	e.preventDefault()

	mouseX = parseInt(e.offsetX)
	mouseY = parseInt(e.offsetY)

	if (isMouseInShape(mouseX, mouseY)) {
		isDragging = true
		return
	}
}
const startSelect = e => {
	snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)

	currentSelectX = e.offsetX
	currentSelectY = e.offsetY
	selectHeight = currentSelectY - startMouseY
	selectWidth = currentSelectX - startMouseX

	ctx.lineWidth = 1
	ctx.globalAlpha = 0.2
	ctx.fillStyle = '#2f2fff'

	ctx.strokeRect(startMouseX, startMouseY, selectWidth, selectHeight)
	ctx.fillRect(startMouseX, startMouseY, selectWidth, selectHeight)
}
const endSelect = e => {
	ctx.putImageData(snapshot, 0, 0)

	let x = selectWidth > 0 ? startMouseX : currentSelectX
	let y = selectHeight > 0 ? startMouseY : currentSelectY
	let width = Math.abs(selectWidth)
	let height = Math.abs(selectHeight)
	currentShape.x = x + 10
	currentShape.y = y + 10
	currentShape.width = width
	currentShape.height = height

	selectArea = ctx.getImageData(x, y, width, height)

	ctx.globalAlpha = 1
	ctx.fillStyle = '#ffffff'
	ctx.fillRect(x, y, width, height)

	areaWithoutTheClipping = ctx.getImageData(0, 0, canvas.width, canvas.height)

	ctx.putImageData(selectArea, x + 10, y + 10)

	selectedTool = 'moveselect'

	element.classList.remove('active')
}
const drawing = e => {
	if (!isDrawing) return
	ctx.putImageData(snapshot, 0, 0)

	if (selectedTool === 'brush') {
		drawBrush(e)
	} else if (selectedTool === 'rectangle') {
		drawRect(e)
	} else if (selectedTool === 'circle') {
		drawCircle(e)
	} else if (selectedTool === 'triangle') {
		drawTriangle(e)
	} else if (selectedTool === 'select') {
		startSelect(e)
	} else if (selectedTool === 'eraser') {
		drawEraser(e)
	} else if (selectedTool === 'line') {
		drawLine(e)
	} else if (selectedTool === 'spray') {
		drawSpray(e.offsetX, e.offsetY)
	}
}

toolBtns.forEach(btn => {
	btn.addEventListener('click', () => {
		const activeElement = document.querySelector('.options .active')
		if (activeElement) {
			activeElement.classList.remove('active')
		}
		btn.classList.add('active')
		selectedTool = btn.id
	})
})

sizeSlider.addEventListener('change', () => (brushWidth = sizeSlider.value))
alphaSlider.addEventListener(
	'change',
	() => (brushAlpha = alphaSlider.value / 100)
)
colorBtns.forEach(btn => {
	btn.addEventListener('click', () => {
		document.querySelector('.options .selected').classList.remove('selected')
		btn.classList.add('selected')
		selectedColor = window
			.getComputedStyle(btn)
			.getPropertyValue('background-color')
	})
})
colorPicker.addEventListener('change', () => {
	colorPicker.parentElement.style.background = colorPicker.value
	colorPicker.parentElement.click()
})
clearCanvas.addEventListener('click', () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
})
saveImg.addEventListener('click', () => {
	const link = document.createElement('a')
	link.download = `${Date.now()}.jpg`
	link.href = canvas.toDataURL()
	link.click()
})
canvas.addEventListener('mouseleave', () => {
	if (isDrawing) {
		isDrawing = false
	}
})
canvas.addEventListener('mousedown', e => {
	startDraw(e)
	if (selectedTool === 'moveselect') mouseDown(e)
})
canvas.addEventListener('click', e => {
	// if (selectedTool === 'select') checkClickOnArea(e)
})
canvas.addEventListener('mousemove', e => {
	drawing(e)
	if (selectedTool === 'moveselect') mouseMove(e)
	// mouse_move(e)
})

canvas.addEventListener('mouseup', e => {
	isDrawing = false
	if (selectedTool === 'select') endSelect(e)
	if (selectedTool === 'moveselect') mouseUp(e)
})
canvas.addEventListener('mouseout', e => {
	if (selectedTool === 'moveselect') mouseOut(e)
})

const undoStack = []
const redoStack = []

const saveState = () => {
	undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
	if (undoStack.length > 10) {
		undoStack.shift()
	}
}

const undo = () => {
	if (undoStack.length > 0) {
		redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
		const imageData = undoStack.pop()
		ctx.putImageData(imageData, 0, 0)
	}
}

const redo = () => {
	if (redoStack.length > 0) {
		undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
		const imageData = redoStack.pop()
		ctx.putImageData(imageData, 0, 0)
	}
}

const trackChanges = () => {
	saveState()
	redoStack.length = 0
}

canvas.addEventListener('mousedown', trackChanges)

window.addEventListener('keydown', e => {
	if (e.ctrlKey && e.key === 'z') {
		e.preventDefault()
		undo()
	} else if (e.ctrlKey && e.key === 'y') {
		e.preventDefault()
		redo()
	}
})
