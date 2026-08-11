/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // capas de script costumam passar de 1MB (o padrão do Next); o
      // formulário do admin faz upload de imagem via server action
      bodySizeLimit: "10mb",
    },
  },
};

module.exports = nextConfig;
