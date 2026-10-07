import zlib
import struct
import math

def create_png(width, height, filename):
    # Generates a valid RGBA PNG using only standard library (zlib + struct)
    def png_pack(tag, data):
        chunk_head = tag + data
        return struct.pack("!I", len(data)) + chunk_head + struct.pack("!I", 0xFFFFFFFF & zlib.crc32(chunk_head))

    header = b"\x89PNG\r\n\x1a\n"
    ihdr = png_pack(b"IHDR", struct.pack("!2I5B", width, height, 8, 6, 0, 0, 0))

    raw_data = bytearray()
    
    # Draw icon pattern
    # Background: deep dark slate / indigo (#0F172A to #1E1B4B)
    cx, cy = width / 2.0, height / 2.0
    corner_r = width * 0.22
    
    for y in range(height):
        raw_data.append(0) # filter byte (None)
        ny = (y - cy) / (width / 2.0)
        for x in range(width):
            nx = (x - cx) / (width / 2.0)
            
            # Rounded rect distance
            dx = max(0.0, abs(x - cx) - (width/2.0 - corner_r))
            dy = max(0.0, abs(y - cy) - (height/2.0 - corner_r))
            dist = math.sqrt(dx*dx + dy*dy)
            
            if dist > corner_r:
                # Outside squircle -> transparent or dark
                alpha = 0
                r, g, b = 0, 0, 0
            else:
                alpha = 255
                # Gradient background
                t = (x + y) / (width + height)
                r = int(15 + t * (30 - 15))
                g = int(23 + t * (27 - 23))
                b = int(42 + t * (75 - 42))

                # Grid cell / Nodes / Mathematical table accents
                # Center circular node 1 (q0)
                d1 = math.hypot(x - width * 0.35, y - height * 0.38)
                if abs(d1 - width * 0.12) < width * 0.025:
                    r, g, b = 56, 189, 248 # Electric cyan
                elif d1 < width * 0.10:
                    r, g, b = 15, 23, 42
                
                # Center circular node 2 (q1 - double circle)
                d2 = math.hypot(x - width * 0.65, y - height * 0.62)
                if abs(d2 - width * 0.14) < width * 0.025 or abs(d2 - width * 0.10) < width * 0.02:
                    r, g, b = 16, 185, 129 # Emerald green (accepting)
                elif d2 < width * 0.08:
                    r, g, b = 15, 23, 42

                # Transition arc between nodes
                arc_dist = math.hypot(x - width * 0.5, y - height * 0.45)
                if abs(arc_dist - width * 0.22) < width * 0.018 and y < height * 0.55 and x > width * 0.32 and x < width * 0.68:
                    r, g, b = 168, 85, 247 # Purple arc

                # Cross mark (distinguishable pair) at bottom-left
                cell_cx, cell_cy = width * 0.35, height * 0.70
                c_dx = abs(x - cell_cx)
                c_dy = abs(y - cell_cy)
                if abs(c_dx - c_dy) < width * 0.02 and max(c_dx, c_dy) < width * 0.08:
                    r, g, b = 239, 68, 68 # Coral red cross
            
            raw_data.extend((r, g, b, alpha))

    idat = png_pack(b"IDAT", zlib.compress(bytes(raw_data), 9))
    iend = png_pack(b"IEND", b"")

    with open(filename, "wb") as f:
        f.write(header + ihdr + idat + iend)

create_png(192, 192, "public/pwa-192x192.png")
create_png(512, 512, "public/pwa-512x512.png")
create_png(180, 180, "public/apple-touch-icon.png")
print("Icons created successfully!")
