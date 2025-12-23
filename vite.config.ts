import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente (incluindo .env local se existir)
  // Casting process to any to avoid TS error about missing 'cwd' property on Process type
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Define especificamente a API_KEY como string, em vez de passar o objeto process.env inteiro
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Define um objeto vazio para process.env para evitar que bibliotecas que verifiquem 'if (process.env)' quebrem
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: './index.html',
        },
      },
    },
  };
});