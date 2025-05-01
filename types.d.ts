declare module "opentype.js" {
    export class Path {
        constructor();
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        closePath(): void;
    }

    export interface GlyphOptions {
        name: string;
        unicode: number;
        advanceWidth: number;
        path: Path;
    }

    export class Glyph {
        constructor(options: GlyphOptions);
        name: string;
        unicode: number;
        advanceWidth: number;
        path: Path;
    }

    export interface FontOptions {
        familyName: string;
        styleName: string;
        unitsPerEm: number;
        ascender: number;
        descender: number;
        glyphs: Glyph[];
    }

    export class Font {
        constructor(options: FontOptions);
        download(filename: string): void;
    }
} 