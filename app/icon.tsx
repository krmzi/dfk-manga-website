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
                    fontSize: 280, // حجم أصغر ومناسب
                    background: '#050505', // أسود داكن
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626', // أحمر
                    fontWeight: 800, // سميك ولكن أنيق
                    borderRadius: '24px', // حواف ناعمة جداً
                    fontFamily: 'sans-serif',
                    letterSpacing: '-4px', // تباعد أحرف متناسق
                }}
            >
                DFK
            </div>
        ),
        {
            ...size,
        }
    );
}
