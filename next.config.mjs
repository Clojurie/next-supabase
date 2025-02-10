const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.coze.run',
        port: '',
      },
    ],
  },
  devIndicators: {
    appIsrStatus: false,
  },
  compress: false
};

export default nextConfig;