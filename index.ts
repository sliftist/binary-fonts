import * as opentype from "opentype.js";
import type { Font, Glyph, Path } from "opentype.js";

// Size and position constants
const squareSize = 100;
const gap = 0;
const gridWidth = 2;
const gridHeight = 4;
const lineWidth = 10;

// Calculate total dimensions
const totalWidth = (squareSize + gap) * gridWidth - gap;
const totalHeight = (squareSize + gap) * gridHeight - gap;
const xOffset = 0;
const yOffset = 0;

function createBinaryGlyph(codePoint: number, advanceWidth = 300): Glyph {
    const path: Path = new opentype.Path();
    const binary = codePoint.toString(2).padStart(8, "0").split("").reverse().join("");
    
    
    // Draw squares in 4x2 grid, left to right, top to bottom
    for (let i = 0; i < 8; i++) {
        const col = Math.floor(i / gridHeight);  // 0-1 for two columns
        const row = gridHeight - 1 - (i % gridHeight);              // 0-3 for four rows
        const bit = binary[i];                   // Read top to bottom, left to right
        
        const x = xOffset + col * (squareSize + gap);
        const y = yOffset + row * (squareSize + gap);
        
        // Draw all sides of the square
        // Top
        path.moveTo(x, y);
        path.lineTo(x + squareSize, y);
        path.lineTo(x + squareSize, y + lineWidth);
        path.lineTo(x, y + lineWidth);
        path.closePath();
        
        // Right
        path.moveTo(x + squareSize - lineWidth, y);
        path.lineTo(x + squareSize, y);
        path.lineTo(x + squareSize, y + squareSize);
        path.lineTo(x + squareSize - lineWidth, y + squareSize);
        path.closePath();
        
        // Bottom
        path.moveTo(x, y + squareSize - lineWidth);
        path.lineTo(x + squareSize, y + squareSize - lineWidth);
        path.lineTo(x + squareSize, y + squareSize);
        path.lineTo(x, y + squareSize);
        path.closePath();
        
        // Left
        path.moveTo(x, y);
        path.lineTo(x + lineWidth, y);
        path.lineTo(x + lineWidth, y + squareSize);
        path.lineTo(x, y + squareSize);
        path.closePath();
        
        // Fill the square if bit is 1
        if (bit === "1") {
            path.moveTo(x + lineWidth, y + lineWidth);
            path.lineTo(x + squareSize - lineWidth, y + lineWidth);
            path.lineTo(x + squareSize - lineWidth, y + squareSize - lineWidth);
            path.lineTo(x + lineWidth, y + squareSize - lineWidth);
            path.closePath();
        }
    }
    
    return new opentype.Glyph({
        name: `uni${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
        unicode: codePoint,
        advanceWidth,
        path
    });
}

// Create glyphs for all printable ASCII characters (32-126)
const glyphs: Glyph[] = [
    // Required .notdef glyph
    new opentype.Glyph({
        name: ".notdef",
        unicode: 0,
        advanceWidth: 300,
        path: new opentype.Path()
    })
];

// Add all 256 characters
for (let i = 1; i <= 255; i++) {
    glyphs.push(createBinaryGlyph(i));
}

// Create the font
const font: Font = new opentype.Font({
    familyName: "BinarySquares",
    styleName: "Regular",
    unitsPerEm: totalHeight / 2,
    ascender: totalHeight,
    descender: 0,
    glyphs
});

// Save the font
font.download("BinarySquares.ttf");
console.log("Font saved as BinarySquares.ttf");