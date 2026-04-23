export const metadata = {
  title: 'Proposal C Slide Generator',
  description: 'Generate editable PPTX slides from text input',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
