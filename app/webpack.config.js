module.exports = {
    // ...
    proxy: {
      '/proxy': {
        target: 'https://partner.viettelpost.vn', // Địa chỉ của API Viettel Post
        changeOrigin: true,
        pathRewrite: { '^/proxy': '' },
        secure: false,
      },
    },
    // ...
  };
  