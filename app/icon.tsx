import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
    width: 512,
    height: 512,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 340,
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626', // Red-600
                    fontWeight: 900,
                    borderRadius: '15%', // Rounded corners like app icons
                    lineHeight: 1,
                    fontFamily: 'sans-serif',
                    border: '12px solid #DC2626', // Cool red border
                    letterSpacing: '-15px',
                }}
            >
                DFK
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    );
}
